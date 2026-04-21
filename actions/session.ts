'use server';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { roles } from '@/rbac/permissions';

type Session = JWTPayload;
const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionUser {
  id: string;
  email: string;
  role: roles;
}

export async function encrypt(payload: Session) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (err) {
    console.error('Verification failed', err);
  }
}

export async function getUserFromToken(token: string | undefined) {
  try {
    const payload = await decrypt(token);
    const user = await db.query.users.findFirst({
      where: eq(users.id, `${payload!.userId}`),
      columns: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) return null;
    return user;
  } catch (err) {
    console.error('User not found', err);
  }
}

export async function createSession(userId: string, role: string) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, expiresAt });
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set('rbac', role, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
  } catch (err) {
    console.error('Failed to create session', err);
  }
}

export async function updateSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const role = cookieStore.get('rbac')?.value;
    const payload = await decrypt(session);

    if (!session || !payload || !role) return null;

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expires,
      sameSite: 'lax',
      path: '/',
    });
    cookieStore.set('rbac', role, {
      httpOnly: true,
      secure: true,
      expires: expires,
      sameSite: 'lax',
      path: '/',
    });
  } catch (err) {
    console.error('Failed to update session', err);
  }
}

export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    cookieStore.delete('rbac');
  } catch (err) {
    console.error('Failed to delete session', err);
  }
}
