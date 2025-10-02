'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { purchaseOrders } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

export interface purchaseOrderData {
  orderDate: Date;
  status: string;
}

export async function createPurchaseOrder(data: purchaseOrderData) {
  const { orderDate, status } = data;
  // validate data
  // process products from array into string
  if (status === null || typeof status !== 'string') {
    console.error('Data type not supported');
  }
  try {
    await db
      .insert(purchaseOrders)
      .values({
        orderDate: orderDate,
        status: status,
      })
      .onConflictDoNothing()
      .returning({ newId: purchaseOrders.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  return;
}

export async function updatePurchaseOrder(
  purchaseOrderId: number,
  data: purchaseOrderData
) {
  const { orderDate, status } = data;
  // process products from array into string
  try {
    await db
      .update(purchaseOrders)
      .set({
        orderDate: orderDate,
        status: status,
      })
      .where(eq(purchaseOrders.id, `${purchaseOrderId}`));
  } catch (err) {
    console.error(`Update Error ${err}`);
  }
}

export async function deletePurchaseOrder(purchaseOrderId: number) {
  try {
    await db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, `${purchaseOrderId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
}

export const getPurchaseOrdersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.purchaseOrders.findMany({
      orderBy: [asc(purchaseOrders.createdAt)],
    });
    return data ?? [];
  },
  [],
  {
    tags: ['purchaseOrders'],
    revalidate: 120,
  }
);

export async function getOnePurchaseOrder(purchaseOrderId: number) {
  try {
    const data = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, `${purchaseOrderId}`));
    return data;
  } catch (err) {
    console.error(`Look up failed ${err}`);
  }
}
