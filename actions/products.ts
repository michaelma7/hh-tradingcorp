'use server';
import { db } from '@/db/db';
import { eq, asc, sql } from 'drizzle-orm';
import { products, inventoryTransactions, manufacturers } from '@/db/schema';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface productData {
  name: string;
  commonName?: string;
  manufacturedBy: string;
  imageLink?: string;
  quantity: number;
  reserved: number;
}

export type transactionType = 'received' | 'ordered' | 'return' | 'sale';
export interface inventoryTransaction {
  productId: string;
  transaction: transactionType;
  quantity: number;
  referenceId: string;
}

const productSchema = z.object({
  name: z.string().trim(),
  commonName: z.string().optional().or(z.literal('')),
  manufacturedBy: z.string().trim(),
  quantity: z.coerce.number().default(0),
  reserved: z.coerce.number().default(0),
  imageLink: z
    .string()
    .url('Must be valid URL')
    .trim()
    .optional()
    .or(z.literal('')),
});

const updateSchema = productSchema.extend({
  id: z.string().uuid(),
});

const inventorySchema = z.object({
  productId: z.string().uuid(),
  referenceId: z.string().uuid(),
  quantity: z.number(),
  transaction: z.enum(['received', 'ordered', 'return', 'sale']),
});

export async function createProduct(prevState: any, formData: FormData) {
  try {
    const data = productSchema.parse({
      name: formData.get('name'),
      commonName: formData.get('commonName'),
      manufacturedBy: formData.get('manufacturedBy'),
      imageLink: formData.get('imageLink'),
      quantity: Number(formData.get('quantity')),
      reserved: Number(formData.get('reserved')),
    });
    const [manufacturer] = await db
      .select({ id: manufacturers.id })
      .from(manufacturers)
      .where(eq(manufacturers.name, `${data.manufacturedBy}`));
    await db
      .insert(products)
      .values({
        name: data.name,
        commonName: data.commonName,
        manufacturedBy: manufacturer.id,
        imageLink: data.imageLink,
        quantity: data.quantity,
        reserved: data.reserved,
      })
      .onConflictDoNothing()
      .returning({ newId: products.id });
  } catch (err) {
    if (err instanceof z.ZodError) throw console.error(`${err.issues}`);
    console.error(`Insertion error: ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function updateProduct(prevState: any, formData: FormData) {
  try {
    const data = updateSchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      commonName: formData.get('commonName'),
      manufacturedBy: formData.get('manufacturedBy'),
      imageLink: formData.get('imageLink'),
      quantity: Number(formData.get('quantity')),
      reserved: Number(formData.get('reserved')),
    });
    const [manufacturer] = await db
      .select({ id: manufacturers.id })
      .from(manufacturers)
      .where(eq(manufacturers.name, `${data.manufacturedBy}`));
    await db
      .update(products)
      .set({
        name: data.name,
        commonName: data.commonName,
        manufacturedBy: manufacturer.id,
        imageLink: data.imageLink,
        quantity: data.quantity,
        reserved: data.reserved,
      })
      .where(eq(products.id, `${data.id}`));
  } catch (err) {
    if (err instanceof z.ZodError) throw console.error(`${err.issues}`);
    console.error(`Update Error ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function deleteProduct(productId: string) {
  try {
    await db.delete(products).where(eq(products.id, `${productId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export const getProductsForDashboard = unstable_cache(
  async () => {
    const data = await db.query.products.findMany({
      orderBy: [asc(products.lastUpdated)],
      limit: 25,
      columns: { lastUpdated: false },
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
        id: products.id,
      })
      .from(products);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
