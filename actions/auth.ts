'use server';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { createSession, deleteSession } from './session';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function signin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const match = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!match) throw new Error('Invalid Username or password');

  const pw = await bcrypt.compare(password, match.password);

  if (!pw) throw new Error('Invalid Username or password');

  await createSession(match.id);

  return;
}

export async function signup({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const encrypted = await bcrypt.hash(password, 10);
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
  const data = authSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  try {
    await signup(data);
  } catch (err) {
    console.error(err);
    return { message: 'Failed to sign you up' };
  }
  redirect('/dashboard');
}

export async function signinUser(prevState: any, formData: FormData) {
  const data = authSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  try {
    await signin(data);
  } catch (err) {
    console.error(err);
    return { message: 'Failed to sign you in' };
  }
  redirect('/dashboard');
}
