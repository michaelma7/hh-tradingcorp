'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { manufacturers } from '@/db/schema';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';

export interface manufacturerData {
  name: string;
  contact: string;
}

const manufacturerSchema = z.object({
  name: z.string().trim(),
  contact: z.string().trim(),
});

const updateSchema = manufacturerSchema.extend({
  id: z.string().uuid(),
});

export async function createManfacturer(prevState: any, data: FormData) {
  try {
    const newManu: manufacturerData = manufacturerSchema.parse({
      name: data.get('name'),
      contact: data.get('contact'),
    });
    if (newManu.name === null || typeof newManu.name !== 'string') {
      console.error('Data type not supported');
      throw Error;
    }
    await db
      .insert(manufacturers)
      .values({
        name: newManu.name,
        contact: newManu.contact,
      })
      .onConflictDoNothing()
      .returning({ newId: manufacturers.id });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Insertion error: ${err}`);
    throw err;
  }
}

export async function updateManfacturer(prevState: any, data: FormData) {
  const update = updateSchema.parse({
    id: data.get('id'),
    name: data.get('name'),
    contact: data.get('contact'),
  });
  try {
    await db
      .update(manufacturers)
      .set({
        name: update.name,
        contact: update.contact,
      })
      .where(eq(manufacturers.id, `${update.id}`));
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Update Error ${err}`);
    throw err;
  }
}

export async function deleteManfacturer(manufacturerId: number) {
  try {
    await db
      .delete(manufacturers)
      .where(eq(manufacturers.id, `${manufacturerId}`));
  } catch (err) {
    console.error(`Delete Error ${err}`);
  }
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
  }
);

export async function getOneManufacturer(manufacturerId: string) {
  try {
    return await db
      .select()
      .from(manufacturers)
      .where(eq(manufacturers.id, `${manufacturerId}`));
  } catch (err) {
    console.error(`Manufacturer data fetch error ${err}`);
    throw err;
  }
}

export async function getAllManufacturers() {
  try {
    return await db.select().from(manufacturers);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
