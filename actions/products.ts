'use server';
import { db } from '@/db/db';
import { eq, asc, sql } from 'drizzle-orm';
import { products, inventoryTransactions } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

export interface productData {
  name: string;
  commonName?: string;
  manufacturedBy: string;
  imageLink?: string;
  quantity: number;
  reserved: number;
  lastUpdated: string;
}

export type transactionType = 'received' | 'ordered' | 'returned' | 'sale';
export interface inventoryTransaction {
  productId: string;
  transaction: transactionType;
  quantity: number;
  referenceId: string;
}

export async function createProduct(data: productData) {
  const {
    name,
    commonName,
    manufacturedBy,
    imageLink,
    quantity,
    reserved,
    lastUpdated,
  } = data;
  // validate data
  if (name === null || typeof name !== 'string') {
    console.error('Data type not supported');
  }
  try {
    return await db
      .insert(products)
      .values({
        name: name,
        commonName: commonName,
        manufacturedBy: manufacturedBy,
        imageLink: imageLink,
        quantity: quantity,
        reserved: reserved,
        lastUpdated: lastUpdated,
      })
      .onConflictDoNothing()
      .returning({ newId: products.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
    throw err;
  }
}

export async function updateProduct(productId: string, data: productData) {
  const { name, commonName, manufacturedBy, imageLink } = data;
  // validate data
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
    throw err;
  }
}

export async function updateInventory(data: inventoryTransaction) {
  const { productId, transaction, quantity, referenceId } = data;
  // validate data
  try {
    return await db.transaction(async (tx) => {
      const newTransaction = {
        productId: productId,
        transaction: transaction,
        quantity: quantity,
        referenceId: referenceId,
      };

      const [newId] = await tx
        .insert(inventoryTransactions)
        .values(newTransaction)
        .onConflictDoNothing()
        .returning({ id: inventoryTransactions.id });

      if (transaction === 'received' || transaction === 'returned') {
        await tx
          .update(products)
          .set({ quantity: sql`${products.quantity} + ${quantity}` })
          .where(eq(products.id, `${productId}`));
      } else if (transaction === 'ordered') {
        await tx
          .update(products)
          .set({ reserved: sql`${products.reserved} + ${quantity}` })
          .where(eq(products.id, `${productId}`));
      } else {
        await tx
          .update(products)
          .set({
            quantity: sql`${products.quantity} - ${quantity}`,
            reserved: sql`${products.reserved} - ${quantity}`,
          })
          .where(eq(products.id, `${productId}`));
      }
      return newId;
    });
  } catch (err) {
    console.error(`Inventory update error ${err}`);
    throw err;
  }
}

export async function deleteProduct(productId: string) {
  try {
    await db.delete(products).where(eq(products.id, `${productId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
    throw err;
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

export async function getOneProduct(productId: string) {
  try {
    return await db
      .select()
      .from(products)
      .where(eq(products.id, `${productId}`));
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
