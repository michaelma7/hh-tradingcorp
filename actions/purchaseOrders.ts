'use server';
import { db } from '@/db/db';
import { eq, asc, and } from 'drizzle-orm';
import { purchaseOrders, purchaseOrderItems } from '@/db/schema';
import { updateInventory } from './products';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';

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
  quantity: z.number(),
  priceCents: z.number(),
  expirationDate: z.string(),
});

const itemsSchema = z.array(purchaseOrderItemSchema);

const purchaseOrderSchema = z.object({
  orderDate: z.string(),
  status: z.enum(['received', 'shipped', 'pending']),
  items: itemsSchema,
});

const updateSchema = purchaseOrderSchema.extend({
  id: z.string().uuid(),
});

export async function createPurchaseOrder(data: FormData) {
  try {
    const purchaseOrder = purchaseOrderSchema.parse(data);
    return await db.transaction(async (tx) => {
      const newPurchaseOrder: typeof purchaseOrders.$inferInsert = {
        orderDate: purchaseOrder.orderDate,
        status: purchaseOrder.status,
      };

      const [newId] = await tx
        .insert(purchaseOrders)
        .values(newPurchaseOrder)
        .onConflictDoNothing()
        .returning({ id: purchaseOrders.id });

      const itemsWithId = purchaseOrder.items.map((item) => ({
        purchaseOrderId: newId.id,
        productId: item.productId,
        quantity: item.quantity || 0,
        priceCents: item.priceCents || 0,
        expirationDate: item.expirationDate,
      }));

      await tx
        .insert(purchaseOrderItems)
        .values(itemsWithId)
        .onConflictDoNothing();
      return { newId };
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Insertion error: ${err}`);
    throw err;
  }
}

export async function updatePurchaseOrder(data: FormData) {
  try {
    const update = updateSchema.parse(data);
    // make inventory transactions and update product inventory for each item
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
          } as const;
          await updateInventory(receivedItem);
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Update Error ${err}`);
    throw err;
  }
}

export async function modifyPurchaseOrderItems(
  purchaseOrderId: string,
  data: purchaseOrderItemChanges
) {
  try {
    const addOrUpdate = itemsSchema.parse(data.addOrUpdate);
    const remove = itemsSchema.parse(data.remove);
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
                eq(purchaseOrderItems.purchaseOrderId, `${purchaseOrderId}`),
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
    return await db.select().from(purchaseOrders);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
