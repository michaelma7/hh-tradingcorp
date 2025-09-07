import { getAllOrders } from '@/actions/orders';
import Link from 'next/link';

export default async function Orders() {
  const orders = await getAllOrders();

  return (
    <div>
      {orders.map((order) => {
        <div key={order.id}>
          <Link href={`/dashboard/orders/${order.id}`}>{order.name}</Link>
        </div>;
      })}
    </div>
  );
}
