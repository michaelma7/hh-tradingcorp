'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { orders } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

export interface orderData {
  name: string;
  createdById: string;
  customer?: string;
  products?: string;
  status: boolean;
  deliveredDate?: string;
}

export async function createOrder(data: orderData) {
  const { name, createdById, customer, products, status, deliveredDate } = data;
  // validate data
  // process products from array into string
  if (name === null || typeof name !== 'string') {
    console.error('Data type not supported');
  }
  try {
    await db
      .insert(orders)
      .values({
        name: name,
        createdById: createdById,
        customer: customer,
        products: products,
        status: status,
        deliveredDate: deliveredDate,
      })
      .onConflictDoNothing()
      .returning({ newId: orders.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  return;
}

export async function updateOrder(orderId: number, data: orderData) {
  const { name, createdById, customer, products, status, deliveredDate } = data;
  // process products from array into string
  try {
    await db
      .update(orders)
      .set({
        name: name,
        createdById: createdById,
        customer: customer,
        products: products,
        status: status,
        deliveredDate: deliveredDate,
      })
      .where(eq(orders.id, `${orderId}`));
  } catch (err) {
    console.error(`Update Error ${err}`);
  }
}

export async function deleteOrder(orderId: number) {
  try {
    await db.delete(orders).where(eq(orders.id, `${orderId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
}

export const getOrdersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.orders.findMany({
      orderBy: [asc(orders.createdAt)],
    });
    return data ?? [];
  },
  [],
  {
    tags: ['orders'],
    revalidate: 120,
  }
);

export async function getOneOrder(orderId: number) {
  try {
    const data = await db
      .select()
      .from(orders)
      .where(eq(orders.id, `${orderId}`));
    return data;
  } catch (err) {
    console.error(`Look up failed ${err}`);
  }
}
