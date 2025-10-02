'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { products } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

interface productData {
  name: string;
  commonName?: string;
  manufacturedBy: string;
  imageLink?: string;
}
export async function createProduct(data: productData) {
  const { name, commonName, manufacturedBy, imageLink } = data;
  // validate data
  if (name === null || typeof name !== 'string') {
    console.error('Data type not supported');
  }
  try {
    await db
      .insert(products)
      .values({
        name: name,
        commonName: commonName,
        manufacturedBy: manufacturedBy,
        imageLink: imageLink,
      })
      .onConflictDoNothing()
      .returning({ newId: products.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  return;
}

export async function updateProduct(productId: number, data: productData) {
  const { name, commonName, manufacturedBy, imageLink } = data;
  try {
    await db
      .update(products)
      .set({
        name: name,
        commonName: commonName,
        manufacturedBy: manufacturedBy,
        imageLink: imageLink,
      })
      .where(eq(products.id, `${productId}`));
  } catch (err) {
    console.error(`Update Error ${err}`);
  }
}

export async function deleteProduct(productId: number) {
  try {
    await db.delete(products).where(eq(products.id, `${productId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
}

export const getProductsForDashboard = unstable_cache(
  async () => {
    const data = await db
      .select({ name: products.name })
      .from(products)
      .orderBy(asc(products.id));
    return data ?? [];
  },
  [],
  {
    tags: ['products'],
    revalidate: 120,
  }
);
