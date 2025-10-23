import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getUserFromToken } from './session';

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
