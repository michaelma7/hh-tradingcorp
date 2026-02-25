'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { customers } from '@/db/schema';
import { z } from 'zod/v4';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface customersData {
  id: string;
  name: string;
  location: string | null;
}

export type CustomerFormState = {
  message?: string;
  errors?: {
    formErrors: string[];
    fieldErrors: {
      name?: string[];
      location?: string[];
      id?: string[];
    };
  };
} | null;

const customerSchema = z.object({
  name: z.string().trim(),
  location: z.string().trim(),
});

const updateSchema = customerSchema.extend({
  id: z.uuid(),
});

export async function createCustomer(
  prevState: CustomerFormState,
  data: FormData,
): Promise<CustomerFormState> {
  try {
    const newCustomer = customerSchema.safeParse({
      name: data.get('name'),
      location: data.get('location'),
    });
    if (!newCustomer.success)
      return { errors: z.flattenError(newCustomer.error) };
    await db
      .insert(customers)
      .values({
        name: newCustomer.data.name,
        location: newCustomer.data.location,
      })
      .onConflictDoNothing()
      .returning({ newId: customers.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  prevState: CustomerFormState,
  data: FormData,
): Promise<CustomerFormState> {
  try {
    const update = updateSchema.safeParse({
      id: data.get('id'),
      name: data.get('name'),
      location: data.get('location'),
    });
    if (!update.success) return { errors: z.flattenError(update.error) };
    await db
      .update(customers)
      .set({
        name: update.data.name,
        location: update.data.location,
      })
      .where(eq(customers.id, `${update.data.id}`));
  } catch (err) {
    console.error(`Update Error ${err}`);
  }
  redirect('/dashboard/customers');
}

export async function deleteCustomer(customerId: number) {
  try {
    await db.delete(customers).where(eq(customers.id, `${customerId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
  redirect('/dashboard/customers');
}

export const getCustomersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.customers.findMany({
      orderBy: [asc(customers.createdAt)],
      limit: 20,
    });
    return data ?? [];
  },
  [],
  {
    tags: ['customers'],
    revalidate: 120,
  },
);

export async function getOneCustomer(customerId: string) {
  try {
    return await db.query.customers.findFirst({
      where: eq(customers.id, `${customerId}`),
      columns: {
        createdAt: false,
      },
    });
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
