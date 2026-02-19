'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getUserFromToken } from './session';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';
import { db } from '@/db/db';
import bcrypt from 'bcrypt';
import { UserFormState } from './auth';

export interface userData {
  id: string;
  email: string;
}
const userSchema = z.object({
  email: z.email().trim(),
  password: z
    .string()
    .trim()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    }),
});

const updateSchema = userSchema
  .extend({
    id: z.uuid(),
    confirm: z.string(),
    old: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get('session')?.value;
    if (!token) redirect('/signin');

    const user = await getUserFromToken();
    if (!user) redirect('/signin');
    return user;
  } catch (err) {
    console.error('Cannot find cookie', err);
  }
});

export async function updateUser(
  prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  try {
    const data = updateSchema.safeParse({
      id: formData.get('id'),
      email: formData.get('email'),
      password: formData.get('change'),
      confirm: formData.get('confirmPassword'),
      old: formData.get('current'),
    });
    if (!data.success) {
      const errors = z.flattenError(data.error);
      return { errors: errors };
    }

    const current = await db.query.users.findFirst({
      where: eq(users.email, data.data.email),
    });
    if (!current) return new Error('Invalid Username or password');

    const pw = await bcrypt.compare(data.data.old, current.password);
    if (!pw) return new Error('Invalid Username or password');

    await db
      .update(users)
      .set({
        email: data.data.email,
        password: data.data.password,
      })
      .where(eq(users.id, `${data.data.id}`));
  } catch (err) {
    if (err instanceof z.ZodError) console.error('Validation errors:', err);
    console.error(`User update error ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function deleteUser(id: string) {
  try {
    await db.delete(users).where(eq(users.id, `${id}`));
  } catch (err) {
    console.error(`User delete error ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function getOneUser(id: string) {
  try {
    return await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, `${id}`));
  } catch (err) {
    console.error(`User info not found or not valid ${err}`);
    throw err;
  }
}
