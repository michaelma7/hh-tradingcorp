'use server';
import { db } from '@/db/db';
import { eq, asc, sql } from 'drizzle-orm';
import {
  purchaseOrders,
  purchaseOrderItems,
  products,
  inventoryTransactions,
} from '@/db/schema';
import { z } from 'zod/v4';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';
import { inventoryTransaction } from './products';

export interface purchaseOrderData {
  id: string;
  orderDate: string;
  status: 'received' | 'shipped' | 'pending';
}

export type purchaseOrderItem = {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  expirationDate: string;
};

export type purchaseOrderItemChanges = {
  addOrUpdate: purchaseOrderItem[];
  remove: purchaseOrderItem[];
};

const purchaseOrderItemSchema = z.object({
  purchaseOrderId: z.uuid(),
  productId: z.uuid(),
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
  id: z.uuid(),
});

export async function createPurchaseOrder(prevState: any, formData: FormData) {
  try {
    const inputs = {
      orderDate: formData.get('orderDate'),
      status: formData.get('status'),
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
        productId: formData.getAll('productId'),
        quantity: formData.getAll('quantity'),
        price: formData.getAll('price'),
        expirationDate: formData.getAll('expirationDate'),
      };
      const itemsWithId = [];
      for (let i = 0; i < items.productId.length; i++) {
        const [id] = await tx
          .select({ id: products.id })
          .from(products)
          .where(eq(products.name, `${items.productId[i]}`));
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
          const change: inventoryTransaction = {
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

export async function updatePurchaseOrder(prevState: any, formData: FormData) {
  try {
    const inputs = {
      id: formData.get('id'),
      orderDate: formData.get('orderDate'),
      status: formData.get('status'),
      expirationDate: formData.getAll('expirationDate'),
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
          const receivedItem: inventoryTransaction = {
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
  redirect('/dashboard');
}

export async function modifyPurchaseOrderItems(
  prevState: any,
  formData: FormData,
) {
  try {
    // order line item data
    const itemData = {
      productId: formData.getAll('productId'),
      quantity: formData.getAll('quantity'),
      price: formData.getAll('price'),
      expirationDate: formData.getAll('expirationDate'),
    };
    const id = formData.get('id');
    // check for removing all items and no items to update case
    if (itemData.productId[0] === '') {
      await db.transaction(async (tx) => {
        const remove = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, `${id}`));
        if (remove) {
          remove.forEach(
            async (item) =>
              await tx
                .delete(purchaseOrderItems)
                .where(eq(purchaseOrderItems.id, `${item.id}`)),
          );
        }
      });
      return;
    } else {
      // create array of items to upsert & delete
      const items = [];
      for (let i = 0; i < itemData.productId.length; i++) {
        items.push({
          purchaseOrderId: id,
          productId: itemData.productId[i],
          quantity: Number(itemData.quantity[i]),
          priceCents: Number(itemData.price[i]) * 100,
          expirationDate: itemData.expirationDate[i],
        });
      }
      console.log(items);
      const verifiedItems = itemsSchema.parse(items);
      return await db.transaction(async (tx) => {
        // get current list of items and find rows removed
        const currentItems = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, `${id}`));
        for (let i = 0; i < currentItems.length; i++) {
          if (!itemData.productId.includes(currentItems[i].productId)) {
            tx.delete(purchaseOrderItems).where(
              eq(purchaseOrderItems.id, `${currentItems[i].id}`),
            );
          }
        }
        // upsert all other items
        verifiedItems.forEach(async (item) => {
          await tx
            .insert(purchaseOrderItems)
            .values(item)
            .onConflictDoUpdate({
              target: [purchaseOrderItems.id, purchaseOrderItems.productId],
              set: { ...item },
            });
        });
      });
    }
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
  redirect('/dashboard');
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
  },
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
      where: eq(purchaseOrders.id, `${purchaseOrderId}`),
      with: {
        items: {
          columns: {
            purchaseOrderId: false,
            productId: false,
          },
          with: {
            product: {
              columns: {
                name: true,
                id: true,
              },
            },
          },
        },
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
