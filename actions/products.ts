'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { products, manufacturers } from '@/db/schema';
import { z } from 'zod/v4';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface productData {
  id?: string;
  name: string;
  commonName?: string;
  manufacturedBy: { id: string; name: string };
  imageLink?: string | null;
  quantity: number | null;
  reserved: number | null;
}

export type transactionType = 'received' | 'ordered' | 'return' | 'sale';
export interface inventoryTransaction {
  productId: string;
  transaction: transactionType;
  quantity: number;
  referenceId: string;
}

export interface productsForOrders {
  key: string;
  code: string;
  name: string;
}

export type ProductFormState = {
  message?: string;
  errors?: {
    formErrors: string[];
    fieldErrors: {
      id?: string[];
      name?: string[];
      commonName?: string[];
      manufacturedBy?: string[];
      imageLink?: string[];
      quantity?: string[];
      reserved?: string[];
    };
  };
} | null;

const productSchema = z.object({
  name: z.string().trim(),
  commonName: z.string().optional().or(z.literal('')),
  manufacturedBy: z.string().trim(),
  quantity: z.coerce.number().default(0),
  reserved: z.coerce.number().default(0),
  imageLink: z.url('Must be valid URL').trim().optional().or(z.literal('')),
});

const updateSchema = productSchema.extend({
  id: z.uuid(),
});

export async function createProduct(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    const data = productSchema.safeParse({
      name: formData.get('name'),
      commonName: formData.get('commonName'),
      manufacturedBy: formData.get('manufacturedBy'),
      imageLink: formData.get('imageLink'),
      quantity: Number(formData.get('quantity')),
      reserved: Number(formData.get('reserved')),
    });
    if (!data.success) return { errors: z.flattenError(data.error) };
    const [manufacturer] = await db
      .select({ id: manufacturers.id })
      .from(manufacturers)
      .where(eq(manufacturers.name, `${data.data.manufacturedBy}`));
    await db
      .insert(products)
      .values({
        name: data.data.name,
        commonName: data.data.commonName,
        manufacturedBy: manufacturer.id,
        imageLink: data.data.imageLink,
        quantity: data.data.quantity,
        reserved: data.data.reserved,
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

export async function updateProduct(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    const data = updateSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      commonName: formData.get('commonName'),
      manufacturedBy: formData.get('manufacturedBy'),
      imageLink: formData.get('imageLink'),
      quantity: Number(formData.get('quantity')),
      reserved: Number(formData.get('reserved')),
    });
    if (!data.success) return { errors: z.flattenError(data.error) };
    const [manufacturer] = await db
      .select({ id: manufacturers.id })
      .from(manufacturers)
      .where(eq(manufacturers.name, `${data.data.manufacturedBy}`));
    await db
      .update(products)
      .set({
        name: data.data.name,
        commonName: data.data.commonName,
        manufacturedBy: manufacturer.id,
        imageLink: data.data.imageLink,
        quantity: data.data.quantity,
        reserved: data.data.reserved,
      })
      .where(eq(products.id, `${data.data.id}`));
  } catch (err) {
    if (err instanceof z.ZodError) throw console.error(`${err.issues}`);
    console.error(`Update Error ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function deleteProduct(productId: string): Promise<void> {
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
  },
);

export async function getOneProduct(productId: string) {
  try {
    return await db.query.products.findFirst({
      where: eq(products.id, `${productId}`),
      with: {
        manufacturedBy: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      columns: {
        commonName: false,
        lastUpdated: false,
      },
    });
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

export async function getProductsforOrders() {
  try {
    return await db
      .select({
        key: products.id,
        code: products.id,
        name: products.name,
      })
      .from(products);
  } catch (err) {
    throw err;
  }
}
