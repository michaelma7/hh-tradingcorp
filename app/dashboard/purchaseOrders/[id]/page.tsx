import { getOnePurchaseOrder } from '@/actions/purchaseOrders';
import { redirect } from 'next/navigation';

export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [purchaseOrder] = await getOnePurchaseOrder(id);
  if (!purchaseOrder) redirect('/dashboard/purchaseOrders');
  return (
    <div>
      <h2>{purchaseOrder.id}</h2>
    </div>
  );
}
