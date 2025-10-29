'use server';
import { db } from '@/db/db';
import { eq, asc, sql } from 'drizzle-orm';
import { products, inventoryTransactions } from '@/db/schema';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';

export interface productData {
  name: string;
  commonName?: string;
  manufacturedBy: string;
  imageLink?: string;
  quantity: number;
  reserved: number;
}

export type transactionType = 'received' | 'ordered' | 'returned' | 'sale';
export interface inventoryTransaction {
  productId: string;
  transaction: transactionType;
  quantity: number;
  referenceId: string;
}

const productSchema = z.object({
  name: z.string(),
  commonName: z.string().optional().or(z.literal('')),
  manufacturedBy: z.string(),
  quantity: z.number(),
  reserved: z.number(),
  imageLink: z.string().url('Must be valid URL').optional().or(z.literal('')),
});

const updateSchema = z.object({
  id: z.string(),
  name: z.string(),
  commonName: z.string().optional().or(z.literal('')),
  manufacturedBy: z.string(),
  quantity: z.number(),
  reserved: z.number(),
  imageLink: z.string().url('Must be valid URL').optional().or(z.literal('')),
});

export async function createProduct(prevState: any, formData: FormData) {
  try {
    const data = productSchema.parse({
      name: formData.get('name'),
      commonName: formData.get('commonName'),
      manufacturedBy: formData.get('manufacturedBy'),
      imageLink: formData.get('imageLink'),
      quantity: formData.get('quantity'),
      reserved: formData.get('reserved'),
    });

    return await db
      .insert(products)
      .values({
        name: data.name,
        commonName: data.commonName,
        manufacturedBy: data.manufacturedBy,
        imageLink: data.imageLink,
        quantity: data.quantity,
        reserved: data.reserved,
      })
      .onConflictDoNothing()
      .returning({ newId: products.id });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Insertion error: ${err}`);
    throw err;
  }
}

export async function updateProduct(prevState: any, formData: FormData) {
  try {
    const data = updateSchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      commonName: formData.get('commonName'),
      manufacturedBy: formData.get('manufacturedBy'),
      imageLink: formData.get('imageLink'),
      quantity: formData.get('quantity'),
      reserved: formData.get('reserved'),
    });
    await db
      .update(products)
      .set({
        name: data.name,
        commonName: data.commonName,
        manufacturedBy: data.manufacturedBy,
        imageLink: data.imageLink,
      })
      .where(eq(products.id, `${data.id}`));
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
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
    const data = await db.query.products.findMany({
      orderBy: [asc(products.lastUpdated)],
      limit: 25,
    });
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
      .select({
        Name: products.name,
        Quantity: products.quantity,
        Reserved: products.reserved,
        Current: products.current,
        Manufacturer: products.manufacturedBy,
        Image: products.imageLink,
      })
      .from(products)
      .where(eq(products.id, `${productId}`));
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}

export async function getAllProducts() {
  try {
    return await db
      .select({
        Name: products.name,
        Quantity: products.quantity,
        Reserved: products.reserved,
        Current: products.current,
        Manufacturer: products.manufacturedBy,
      })
      .from(products);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
