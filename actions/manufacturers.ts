'use server';
import { db } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { manufacturers } from '@/db/schema';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { unstable_cache } from 'next/cache';

export interface manufacturerData {
  name: string;
  contact: string;
}
// TODO
// need to type everything
export async function createManfacturer(data: manufacturerData) {
  const { name, contact } = data;
  // validate data
  if (name === null || typeof name !== 'string') {
    console.error('Data type not supported');
    return;
  }
  try {
    await db
      .insert(manufacturers)
      .values({
        name: name,
        contact: contact,
      })
      .onConflictDoNothing()
      .returning({ newId: manufacturers.id });
  } catch (err) {
    console.error(`Insertion error: ${err}`);
  }
  return;
}

export async function updateManfacturer(
  manuId: number,
  data: manufacturerData
) {
  const { name, contact } = data;
  try {
    await db
      .update(manufacturers)
      .set({
        name: name,
        contact: contact,
      })
      .where(eq(manufacturers.id, `${manuId}`));
  } catch (err) {
    console.error(`Update Error ${err}`);
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
    const data = await db
      .select({ name: manufacturers.name })
      .from(manufacturers)
      .orderBy(asc(manufacturers.id));
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
