'use server';
import { db } from '@/db/db';
import { eq, asc, and, sql } from 'drizzle-orm';
import {
  purchaseOrders,
  purchaseOrderItems,
  products,
  inventoryTransactions,
} from '@/db/schema';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface purchaseOrderData {
  orderDate: string;
  status: 'received' | 'shipped' | 'pending';
}

export type purchaseOrderItem = {
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  priceCents: number;
  expirationDate: string;
};

export type purchaseOrderItemChanges = {
  addOrUpdate: purchaseOrderItem[];
  remove: purchaseOrderItem[];
};

const purchaseOrderItemSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number(),
  priceCents: z.coerce.number(),
  expirationDate: z.string(),
});

const itemsSchema = z.array(purchaseOrderItemSchema);

const purchaseOrderSchema = z.object({
  orderDate: z.string(),
  status: z.enum(['received', 'shipped', 'pending']),
});

const updateSchema = purchaseOrderSchema.extend({
  id: z.string().uuid(),
});

export async function createPurchaseOrder(prevState: any, data: FormData) {
  try {
    const inputs = {
      orderDate: data.get('orderDate'),
      status: data.get('status'),
    };
    const purchaseOrder = purchaseOrderSchema.parse(inputs);
    await db.transaction(async (tx) => {
      const newPurchaseOrder: typeof purchaseOrders.$inferInsert = {
        orderDate: purchaseOrder.orderDate,
        status: purchaseOrder.status,
      };

      const [newId] = await tx
        .insert(purchaseOrders)
        .values(newPurchaseOrder)
        .onConflictDoNothing()
        .returning({ id: purchaseOrders.id });
      const items = {
        productId: data.getAll('product'),
        quantity: data.getAll('quantity'),
        price: data.getAll('price'),
        expirationDate: data.getAll('expirationDate'),
      };
      const itemsWithId = [];
      for (let i = 0; i < items.productId.length; i++) {
        const [id] = await tx
          .select({ id: products.id })
          .from(products)
          .where(eq(products.name, items.productId[i]));
        itemsWithId.push({
          purchaseOrderId: newId.id,
          productId: id.id,
          quantity: Number(items.quantity[i]),
          priceCents: Number(items.price[i]) * 100,
          expirationDate: items.expirationDate[i],
        });
      }
      const verifiedItems = itemsSchema.parse(itemsWithId);

      await tx
        .insert(purchaseOrderItems)
        .values(verifiedItems)
        .onConflictDoNothing();

      if (purchaseOrder.status === 'received') {
        for (const item of verifiedItems) {
          const change = {
            productId: item.productId,
            transaction: 'received',
            quantity: item.quantity!,
            referenceId: item.purchaseOrderId,
          };
          await tx
            .insert(inventoryTransactions)
            .values(change)
            .onConflictDoNothing();
          await tx
            .update(products)
            .set({ quantity: sql`${products.quantity} + ${change.quantity}` })
            .where(eq(products.id, `${change.productId}`));
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Insertion error: ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function updatePurchaseOrder(prevState: any, data: FormData) {
  try {
    const inputs = {
      id: data.get('id'),
      orderDate: data.get('orderDate'),
      status: data.get('status'),
    };
    const update = updateSchema.parse(inputs);
    await db.transaction(async (tx) => {
      tx.update(purchaseOrders)
        .set({
          orderDate: update.orderDate,
          status: update.status,
        })
        .where(eq(purchaseOrders.id, `${update.id}`));
      if (update.status === 'received') {
        const items = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, `${update.id}`));
        for (const item of items) {
          const receivedItem = {
            productId: item.productId,
            transaction: 'received',
            quantity: item.quantity!,
            referenceId: update.id,
          };
          await tx
            .update(products)
            .set({
              quantity: sql`${products.quantity} + ${receivedItem.quantity}`,
            })
            .where(eq(products.id, `${receivedItem.productId}`));
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Update Error ${err}`);
    throw err;
  }
}

export async function modifyPurchaseOrderItems(data: FormData) {
  try {
    const changes = JSON.parse(data.get('changes'));
    const removals = JSON.parse(data.get('remove'));
    const id = data.get('id');
    const addOrUpdate = itemsSchema.parse(changes);
    const remove = itemsSchema.parse(removals);
    await db.transaction(async (tx) => {
      // insert/update each new item
      if (addOrUpdate.length) {
        for (let i = 0; i < addOrUpdate.length; i++) {
          await tx
            .insert(purchaseOrderItems)
            .values(addOrUpdate[i])
            .onConflictDoUpdate({
              target: [purchaseOrderItems.id, purchaseOrderItems.productId],
              set: { ...addOrUpdate[i] },
            });
        }
      }
      // delete
      if (remove.length) {
        for (let i = 0; i < remove.length; i++)
          await tx
            .delete(purchaseOrderItems)
            .where(
              and(
                eq(purchaseOrderItems.purchaseOrderId, `${id}`),
                eq(purchaseOrderItems.productId, `${remove[i].productId}`)
              )
            );
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error('PurchaseOrderItems update error', err);
    throw err;
  }
}

export async function deletePurchaseOrder(purchaseOrderId: string) {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(purchaseOrders)
        .where(eq(purchaseOrders.id, `${purchaseOrderId}`));
      await tx
        .delete(purchaseOrderItems)
        .where(eq(purchaseOrderItems.purchaseOrderId, `${purchaseOrderId}`));
      return;
    });
  } catch (err) {
    console.error(`PuchaseOrder delete Error ${err}`);
    throw err;
  }
}

export const getPurchaseOrdersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.purchaseOrders.findMany({
      orderBy: [asc(purchaseOrders.orderDate)],
    });
    return data ?? [];
  },
  [],
  {
    tags: ['purchaseOrders'],
    revalidate: 120,
  }
);

export async function getPurchaseOrderItems(purchaseOrderId: string) {
  try {
    return await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, `${purchaseOrderId}`));
  } catch (err) {
    console.error(`Item look up failed ${err}`);
    throw err;
  }
}

export async function getOnePurchaseOrder(purchaseOrderId: string) {
  try {
    return await db.query.purchaseOrders.findFirst({
      where: (purchaseOrders, { eq }) => eq(purchaseOrders.id, purchaseOrderId),
      with: {
        items: true,
      },
    });
  } catch (err) {
    console.error(`Look up failed ${err}`);
    throw err;
  }
}

export async function getAllPurchaseOrders() {
  try {
    return await db
      .select({
        OrderDate: purchaseOrders.orderDate,
        Status: purchaseOrders.status,
        id: purchaseOrders.id,
      })
      .from(purchaseOrders);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
