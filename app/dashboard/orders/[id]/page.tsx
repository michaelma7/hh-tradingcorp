import { getOneOrder, orderData } from '@/actions/orders';
import DisplayOneItem from '@/components/DisplayOneItem';
import { redirect } from 'next/navigation';

export default async function OrderPage({ params }) {
  const order = await getOneOrder(params.id);
  if (!order) redirect('/dashboard/orders');
  return (
    <div>
      <DisplayOneItem></DisplayOneItem>
      <h2>{order.id}</h2>
    </div>
  );
}
