'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { manufacturers } from '@/db/schema';
import { z } from 'zod/v4';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface manufacturerData {
  id?: string;
  name: string;
  contact: string | null;
}

export type ManufacturerFormState = {
  message?: string | null;
  errors?: {
    formErrors: string[];
    fieldErrors: {
      name?: string[];
      contact?: string[];
      id?: string[];
    };
  };
} | null;

const manufacturerSchema = z.object({
  name: z.string().trim(),
  contact: z.string().trim(),
});

const updateSchema = manufacturerSchema.extend({
  id: z.uuid(),
});

export async function createManfacturer(
  prevState: ManufacturerFormState,
  data: FormData,
): Promise<ManufacturerFormState> {
  try {
    const newManu = manufacturerSchema.safeParse({
      name: data.get('name'),
      contact: data.get('contact'),
    });
    if (!newManu.success) return { errors: z.flattenError(newManu.error) };
    await db
      .insert(manufacturers)
      .values({
        name: newManu.data.name,
        contact: newManu.data.contact,
      })
      .onConflictDoNothing();
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Insertion error: ${err}`);
    throw err;
  }
  redirect('/dashbaord/manufacturers');
}

export async function updateManfacturer(
  prevState: ManufacturerFormState,
  data: FormData,
): Promise<ManufacturerFormState> {
  try {
    const update = updateSchema.safeParse({
      id: data.get('id'),
      name: data.get('name'),
      contact: data.get('contact'),
    });
    if (!update.success) return { errors: z.flattenError(update.error) };
    await db
      .update(manufacturers)
      .set({
        name: update.data.name,
        contact: update.data.contact,
      })
      .where(eq(manufacturers.id, `${update.data.id}`));
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Update Error ${err}`);
    throw err;
  }
  redirect('/dashboard/manufacturers');
}

export async function deleteManfacturer(manufacturerId: number): Promise<void> {
  try {
    await db
      .delete(manufacturers)
      .where(eq(manufacturers.id, `${manufacturerId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
  redirect('/dashboard/manufacturers');
}

export const getManfacturersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.manufacturers.findMany({
      orderBy: [asc(manufacturers.id)],
      limit: 25,
    });
    return data ?? [];
  },
  [],
  {
    tags: ['manufacturers'],
    revalidate: 120,
  },
);

export async function getOneManufacturer(manufacturerId: string) {
  try {
    return await db.query.manufacturers.findFirst({
      where: eq(manufacturers.id, `${manufacturerId}`),
    });
  } catch (err) {
    console.error(`Manufacturer data fetch error ${err}`);
    throw err;
  }
}

export async function getAllManufacturers() {
  try {
    return await db
      .select({
        Name: manufacturers.name,
        Contact: manufacturers.contact,
        id: manufacturers.id,
      })
      .from(manufacturers);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
