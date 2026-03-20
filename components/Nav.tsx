'use client';
import { Button } from '@heroui/react';
import { signout } from '@/actions/auth';
import Link from 'next/link';
import { useProvider } from '@/providers/CurrentUserProvider';

export default function Nav() {
  const currentUser = useProvider()?.currentUser;
  return (
    <nav className='h-[65px] border-b border-default-50 flex items-center px-6 gap-4'>
      <div className='flex gap-2'>
        <Button color='primary'>
          <Link href='/dashboard'>仪表板</Link>
        </Button>
        <Button color='primary'>
          <Link href='/dashboard/orders'>订单</Link>
        </Button>
        <Button color='danger' onPress={signout}>
          Sign Out 登出
        </Button>
      </div>
      <div className='w-1/2'>
        <span id='username'>{currentUser}</span>
      </div>
    </nav>
  );
}
