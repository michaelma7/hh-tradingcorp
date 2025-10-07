'use server';
import { db } from '@/db/db';
import { eq, asc, and } from 'drizzle-orm';
import { orders, orderItems } from '@/db/schema';
import { updateInventory } from './products';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

export interface orderData {
  name: string;
  createdById: string;
  customerId?: string;
  totalCents: number;
  status: boolean;
}

export type orderItemData = {
  orderId: string;
  productId: string;
  quantity?: number;
  priceCents?: number;
  subtotal?: number;
};

export type orderItemChanges = {
  addOrUpdate: orderItemData[];
  remove: orderItemData[];
};

// function dataValidation(data: orderData | orderItemData): void {}

export async function createOrder(data: orderData, items: orderItemData[]) {
  const { name, createdById, customerId, totalCents, status } = data;
  // validate data
  if (name === null || typeof name !== 'string') {
    console.error('Data type not supported');
    return;
  }
  try {
    return await db.transaction(async (tx) => {
      const newOrder: typeof orders.$inferInsert = {
        name: name,
        createdById: createdById,
        customerId: customerId,
        status: status,
        totalCents: totalCents,
      };

      const [newId] = await tx
        .insert(orders)
        .values(newOrder)
        .onConflictDoNothing()
        .returning({ id: orders.id });

      const itemsWithId = items.map((item) => ({
        orderId: newId.id,
        productId: item.productId,
        quantity: item.quantity || 0,
        priceCents: item.priceCents || 0,
        subtotal: item.subtotal || 0,
      }));

      await tx.insert(orderItems).values(itemsWithId).onConflictDoNothing();

      const inventoryChanges = items.map(
        (item) =>
          ({
            productId: item.productId,
            transaction: 'ordered',
            quantity: item.quantity!,
            referenceId: newId.id,
          } as const)
      );
      for (const change of inventoryChanges) await updateInventory(change);
      return { newId };
    });
  } catch (err) {
    console.error(`Order insertion error: ${err}`);
    throw err;
  }
}

export async function updateOrder(orderId: string, data: orderData) {
  const { name, createdById, customerId, totalCents, status } = data;
  // validate data
  if (name === null || typeof name !== 'string') {
    console.error('Data type not supported');
    throw new Error('Data type not supported');
  }

  try {
    const updatedOrder: typeof orders.$inferInsert = {
      name: name,
      createdById: createdById,
      customerId: customerId,
      status: status,
      totalCents: totalCents,
    };
    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set(updatedOrder)
        .where(eq(orders.id, `${orderId}`))
        .returning({ id: orders.id });
      if (status) {
        const items = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, `${orderId}`));
        for (const item of items) {
          const deliveredItem = {
            productId: item.productId,
            transaction: 'sale',
            quantity: item.quantity!,
            referenceId: orderId,
          } as const;
          await updateInventory(deliveredItem);
        }
      }
    });
  } catch (err) {
    console.error(`Order update Error ${err}`);
    throw err;
  }
}

export async function modifyOrderItems(
  orderId: string,
  data: orderItemChanges
) {
  const { addOrUpdate, remove } = data;
  if (addOrUpdate.length + remove.length === 0)
    throw new Error('No data detected');
  else if (addOrUpdate.length + remove.length > 100)
    throw new Error('Too many lines detected');

  try {
    return await db.transaction(async (tx) => {
      // insert/update each new item
      if (addOrUpdate.length) {
        for (let i = 0; i < addOrUpdate.length; i++) {
          await tx
            .insert(orderItems)
            .values(addOrUpdate[i])
            .onConflictDoUpdate({
              target: [orderItems.id, orderItems.productId],
              set: { ...addOrUpdate[i] },
            });
        }
      }
      // delete
      if (remove.length) {
        for (let i = 0; i < remove.length; i++)
          await tx
            .delete(orderItems)
            .where(
              and(
                eq(orderItems.orderId, `${orderId}`),
                eq(orderItems.productId, `${remove[i].productId}`)
              )
            );
      }
    });
  } catch (err) {
    console.error('OrderItems update error', err);
    throw err;
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(orders).where(eq(orders.id, `${orderId}`));
      await tx.delete(orderItems).where(eq(orderItems.orderId, `${orderId}`));
      return;
    });
  } catch (err) {
    console.error(`Order delete Error ${err}`);
    throw err;
  }
}

export const getOrdersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.orders.findMany({
      orderBy: [asc(orders.createdAt)],
      limit: 25,
    });
    return data ?? [];
  },
  [],
  {
    tags: ['orders'],
    revalidate: 120,
  }
);

export async function getOneOrder(orderId: string) {
  try {
    return await db.transaction(async (tx) => {
      const orderData = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, `${orderId}`));
      const lineItems = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, `${orderId}`));
      return { orderData, lineItems };
    });
  } catch (err) {
    console.error(`Look up failed ${err}`);
    throw err;
  }
}
