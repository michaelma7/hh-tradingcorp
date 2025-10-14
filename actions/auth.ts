'use server';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { createSession, deleteSession } from './session';
import { SafeParseSuccess, z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
});

export async function signin({
  data,
}: SafeParseSuccess<{
  email: string;
  password: string;
}>) {
  const match = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (!match) throw new Error('Invalid Username or password');

  const pw = await bcrypt.compare(data.password, match.password);

  if (!pw) throw new Error('Invalid Username or password');

  await createSession(match.id);

  return;
}

export async function signup({
  data,
}: SafeParseSuccess<{
  email: string;
  password: string;
}>) {
  const encrypted = await bcrypt.hash(data.password, 10);
  const email = data.email;
  const rows = await db
    .insert(users)
    .values({ email, password: encrypted })
    .returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    });

  const user = rows[0];
  await createSession(user.id);
  return;
}

export async function signout() {
  await deleteSession();
  redirect('/signin');
}

export async function registerUser(prevState: any, formData: FormData) {
  const data = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!data.success) return { errors: data.error.flatten().fieldErrors };
  try {
    await signup(data);
  } catch (err) {
    console.error(err);
    return { message: 'Failed to sign you up' };
  }
  redirect('/dashboard');
}

export async function signinUser(prevState: any, formData: FormData) {
  const data = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!data.success) return { errors: data.error.flatten().fieldErrors };

  try {
    await signin(data);
  } catch (err) {
    console.error(err);
    return { message: 'Failed to sign you in' };
  }
  redirect('/dashboard');
}
