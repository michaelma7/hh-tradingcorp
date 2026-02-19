'use client';
import { Button } from '@heroui/react';
import { signout } from '@/actions/auth';
import Link from 'next/link';
import { useProvider } from '@/app/CurrentUserProvider';

export default function Nav() {
  const { currentUser } = useProvider();
  return (
    <nav className='h-[65px] border-b border-default-50 flex items-center px-6 gap-4'>
      <div>
        <Button color='primary'>
          <Link href='/dashboard'>Dashboard</Link>
        </Button>
        <Button color='primary'>
          <Link href='/dashboard/orders'>Orders</Link>
        </Button>
        <Button color='warning' onPress={signout}>
          Sign Out
        </Button>
      </div>
      <div className='w-1/2'>
        <span id='username'>{currentUser}</span>
      </div>
    </nav>
  );
}
