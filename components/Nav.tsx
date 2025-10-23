'use client';
import { Button, Input } from '@heroui/react';
import { signout } from '@/actions/auth';
import Link from 'next/link';

export default function Nav() {
  return (
    <nav className='h-[65px] border-b border-default-50 flex items-center px-6 gap-4'>
      <div>
        <Button color='primary'>
          <Link href='/dashboard'>Dashboard</Link>
        </Button>
        <Button color='primary'>
          <Link href='/orders'>Orders</Link>
        </Button>
        <Button color='warning' onPress={signout}>
          Sign Out
        </Button>
      </div>
      <div className='w-1/2'>
        <Input placeholder='search' />
      </div>
    </nav>
  );
}
