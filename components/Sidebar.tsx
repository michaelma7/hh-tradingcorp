'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { signout } from '@/actions/auth';

const links = [
  { route: '/dashboard', name: 'Home 首页' },
  { route: '/dashboard/orders', name: '订单' },
  { route: '/dashboard/products', name: ' 产品' },
  { route: '/dashboard/manufacturers', name: '生产厂家' },
  { route: '/dashboard/customers', name: '顾客' },
  { route: '/dashboard/purchaseOrders', name: '库存订单' },
];

const isActive = (path: string, route: string) => {
  if (route === '/dashboard') return path === '/dashboard';
  else return path.includes(route);
};

export default function Sidebar() {
  const path = usePathname();
  const active = 'bg-secondary hover:bg-secondary-300';
  return (
    <div className='w-full h-full px-3 relative'>
      <div className='grid gap-2'>
        {links.map((link) => (
          <div className='w-full ' key={link.route}>
            <Link className='' href={link.route}>
              <div
                className={`w-full h-full py-2 px-2 rounded-lg hover:bg-blue-400 bg-primary text-white flex justify-center
                    ${isActive(path, link.route) ? active : ''}`}
              >
                {link.name}
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className='absolute bottom-0 w-full left-0 px-4'>
        <Button color='danger' onPress={signout} radius='sm' className='m-4'>
          Sign Out 登出
        </Button>
      </div>
    </div>
  );
}
