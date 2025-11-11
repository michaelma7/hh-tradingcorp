import { getOneOrder } from '@/actions/orders';
import { redirect } from 'next/navigation';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order] = await getOneOrder(id);
  if (!order) redirect('/dashboard/orders');
  return (
    <div>
      <h2>{order.id}</h2>
    </div>
  );
}
