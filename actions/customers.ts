'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { customers } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

export interface customersData {
  name: string;
  location: string;
}

export async function createCustomer(data: customersData) {
  const { name, location } = data;
  try {
    await db
      .insert(customers)
      .values({
        name: name,
        location: location,
      })
      .onConflictDoNothing()
      .returning({ newId: customers.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  return;
}

export async function updateCustomer(customerId: number, data: customersData) {
  const { name, location } = data;
  try {
    await db
      .update(customers)
      .set({
        name: name,
        location: location,
      })
      .where(eq(customers.id, `${customerId}`));
  } catch (err) {
    console.error(`Update Error ${err}`);
  }
}

export async function deleteCustomer(customerId: number) {
  try {
    await db.delete(customers).where(eq(customers.id, `${customerId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
}

export const getCustomersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.customers.findMany({
      orderBy: [asc(customers.createdAt)],
    });
    return data ?? [];
  },
  [],
  {
    tags: ['customers'],
    revalidate: 120,
  }
);

export async function getOneCustomer(customerId: string) {
  try {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.id, `${customerId}`));
  } catch (err) {
    console.error(`Customer data fetch error ${err}`);
    throw err;
  }
}
