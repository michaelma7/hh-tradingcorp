'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { signout } from '@/actions/auth';

const links = [
  { route: '/dashboard', name: 'Home' },
  { route: '/dashboard/orders', name: 'Orders' },
  { route: '/dashboard/products', name: 'Products' },
  { route: '/dashboard/manufacturers', name: 'Manufacturers' },
  { route: '/dashboard/customers', name: 'Customers' },
  { route: '/dashboard/purchaseOrders', name: 'Purchase Orders' },
];

const isActive = (path: string, route: string) => {
  if (route === '/dashboard') return path === '/dashboard';
  else return path.includes(route);
};

export default function Sidebar() {
  const path = usePathname();
  const active = 'bg-primary hover:bg-primary';
  return (
    <div className='w-full h-full px-3 relative'>
      <div>
        {links.map((link) => (
          <div className='w-full' key={link.route}>
            <Link className='' href={link.route}>
              <div
                className={`w-full h-full py-2 px-2 hover:bg-content1 rounded-lg 
                    ${isActive(path, link.route) ? active : ''}`}
              >
                {link.name}
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className='absolute bottom-0 w-full left-0 px-4'>
        <Button color='warning' onPress={signout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
