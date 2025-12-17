'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { customers } from '@/db/schema';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface customersData {
  name: string;
  location: string;
}

const customerSchema = z.object({
  name: z.string().trim(),
  location: z.string().trim(),
});

const updateSchema = customerSchema.extend({
  id: z.string().uuid(),
});

export async function createCustomer(prevState: any, data: FormData) {
  try {
    const newCustomer = customerSchema.parse({
      name: data.get('name'),
      location: data.get('location'),
    });
    await db
      .insert(customers)
      .values({
        name: newCustomer.name,
        location: newCustomer.location,
      })
      .onConflictDoNothing()
      .returning({ newId: customers.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  redirect('/dashboard');
}

export async function updateCustomer(prevState: any, data: FormData) {
  try {
    const update = updateSchema.parse({
      id: data.get('id'),
      name: data.get('name'),
      location: data.get('location'),
    });
    await db
      .update(customers)
      .set({
        name: update.name,
        location: update.location,
      })
      .where(eq(customers.id, `${update.id}`));
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

export async function getAllCustomers() {
  try {
    return await db
      .select({
        Name: customers.name,
        Location: customers.location,
        id: customers.id,
      })
      .from(customers);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
