'use client';
import { useTransition } from 'react';
import { CirclePlus } from 'lucide-react';
import { createOrder } from '@/actions/orders';
import { createCustomer } from '@/actions/customers';
import { createProduct } from '@/actions/products';
import { createManufacturer } from '@/actions/manufacturers';
import Button from '@/components/Button';

export default function Nav() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      createOrder();
    });
  };
  return (
    <nav className='h-[65px] border-b border-default-50 flex items-center px-6 gap-4'>
      <div>
        <Button
          // isLoading={isPending}
          onClick={handleClick}
        >
          <CirclePlus size={16} /> New Order
        </Button>
      </div>
      <div className='w-1/2'>
        <input placeholder='search' />
      </div>
    </nav>
  );
}
