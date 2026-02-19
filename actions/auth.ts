'use server';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { createSession, deleteSession } from './session';
import { ZodSafeParseSuccess, z } from 'zod/v4';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

export type UserFormState = {
  message?: string | null;
  errors?: {
    formErrors: string[];
    fieldErrors: {
      email?: string[];
      password?: string[];
      old?: string[];
      confirm?: string[];
      id?: string[];
    };
  };
} | null;

const authSchema = z.object({
  email: z.email({ message: 'Please enter a valid email.' }).trim(),
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

const signUpSchema = z
  .object({
    email: z.email({ message: 'Please enter a valid email.' }).trim(),
    password: z
      .string()
      .min(8, { message: 'Be at least 8 characters long' })
      .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
      .regex(/[0-9]/, { message: 'Contain at least one number.' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Contain at least one special character.',
      })
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function signin({
  data,
}: ZodSafeParseSuccess<{
  email: string;
  password: string;
}>) {
  try {
    const match = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!match) throw new Error('Invalid Username or password');

    const pw = await bcrypt.compare(data.password, match.password);

    if (!pw) throw new Error('Invalid Username or password');

    await createSession(match.id);
  } catch (err) {
    console.error('Failed to sign in', err);
  }
}

export async function signup({
  data,
}: ZodSafeParseSuccess<{
  email: string;
  password: string;
}>) {
  try {
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
  } catch (err) {
    console.error('Failed to create user', err);
  }
}

export async function signout() {
  try {
    await deleteSession();
  } catch (err) {
    console.error('Failed to signout', err);
  }
  redirect('/signin');
}

export async function registerUser(
  prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  try {
    const data = signUpSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!data.success) return { errors: z.flattenError(data.error) };
    await signup(data);
  } catch (err) {
    console.error(err);
    return { message: 'Failed to sign you up' };
  }
  redirect('/dashboard');
}

export async function signInUser(
  prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  try {
    const data = authSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!data.success) return { errors: z.flattenError(data.error) };
    await signin(data);
  } catch (err) {
    console.error(err);
    return { message: 'Failed to sign you in' };
  }
  redirect('/dashboard');
}
