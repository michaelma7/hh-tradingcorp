'use server';
import { db } from '@/db/db';
import { eq, asc, and } from 'drizzle-orm';
import { purchaseOrders, purchaseOrderItems, products } from '@/db/schema';
import { updateInventory } from './products';
import { z } from 'zod';
import bcrypt from 'bcrypt';
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

export async function createPurchaseOrder(
  data: purchaseOrderData,
  items: purchaseOrderItem[]
) {
  const { orderDate, status } = data;
  // validate data
  if (status === null || typeof status !== 'string') {
    console.error('Data type not supported');
  }
  try {
    return await db.transaction(async (tx) => {
      const newPurchaseOrder: typeof purchaseOrders.$inferInsert = {
        orderDate: orderDate,
        status: status,
      };

      const [newId] = await tx
        .insert(purchaseOrders)
        .values(newPurchaseOrder)
        .onConflictDoNothing()
        .returning({ id: purchaseOrders.id });

      const itemsWithId = items.map((item) => ({
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
    console.error(`Insertion error: ${err}`);
    throw err;
  }
}

export async function updatePurchaseOrder(
  purchaseOrderId: string,
  data: purchaseOrderData
) {
  const { orderDate, status } = data;
  // validate data
  if (status === null || typeof status !== 'string') {
    console.error('Data type not supported');
  }
  try {
    // make inventory transactions and update product inventory for each item
    await db.transaction(async (tx) => {
      tx.update(purchaseOrders)
        .set({
          orderDate: orderDate,
          status: status,
        })
        .where(eq(purchaseOrders.id, `${purchaseOrderId}`));
      if (status === 'received') {
        const items = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, `${purchaseOrderId}`));
        for (const item of items) {
          const receivedItem = {
            productId: item.productId,
            transaction: 'received',
            quantity: item.quantity!,
            referenceId: purchaseOrderId,
          } as const;
          await updateInventory(receivedItem);
        }
      }
    });
  } catch (err) {
    console.error(`Update Error ${err}`);
    throw err;
  }
}

export async function modifyPurchaseOrderItems(
  purchaseOrderId: string,
  data: purchaseOrderItemChanges
) {
  const { addOrUpdate, remove } = data;
  if (addOrUpdate.length + remove.length === 0)
    throw new Error('No data detected');
  else if (addOrUpdate.length + remove.length > 100)
    throw new Error('Too many lines detected');

  try {
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
      return;
    });
  } catch (err) {
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
    return await db
      .select({
        id: purchaseOrders.id,
        orderDate: purchaseOrders.orderDate,
        status: purchaseOrders.status,
        product: products.name,
        quantity: purchaseOrderItems.quantity,
        cost: purchaseOrderItems.priceCents,
        expirationDate: purchaseOrderItems.expirationDate,
      })
      .from(purchaseOrders)
      .innerJoin(
        purchaseOrderItems,
        eq(purchaseOrders.id, purchaseOrderItems.purchaseOrderId)
      )
      .innerJoin(products, eq(purchaseOrderItems.productId, products.id))
      .where(eq(purchaseOrders.id, purchaseOrderId))
      .all();
    // return await db.query.purchaseOrders.findFirst({
    //   where: (purchaseOrders, { eq }) => (eq(purchaseOrders.id), purchaseOrderId),
    //   with: {
    //     purchaseOrderItems: {
    //       with: {
    //         products: true,
    //       },
    //       true,
    //     },
    //   },
    // });
  } catch (err) {
    console.error(`Look up failed ${err}`);
    throw err;
  }
}
