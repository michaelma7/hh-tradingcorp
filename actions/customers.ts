'use server';
import { db } from '@/db/db';
import { eq, asc, and, count, desc, ne, not } from 'drizzle-orm';
import { customers } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { revalidateTag, unstable_cache } from 'next/cache';

export async function createCustomer() {}

export async function updateCustomer(customerId: number) {}

export async function deleteCustomer(customerId: number) {}

export const getCustomersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.customers.findMany({
      orderBy: [asc(customers.createdAt)],
    });
  },
  [],
  {
    tags: ['customers'],
    revalidate: 120,
  }
);
