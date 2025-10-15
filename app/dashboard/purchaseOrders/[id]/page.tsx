import { getOnePurchaseOrder } from '@/actions/purchaseOrders';
import DisplayOneItem from '@/components/DisplayOneItem';
import { redirect } from 'next/navigation';

export default async function PurchaseOrderPage({ params }) {
  const purchaseOrder = await getOnePurchaseOrder(params.id);
  if (!purchaseOrder) redirect('/dashboard/purchaseOrders');
  return (
    <div>
      <DisplayOneItem></DisplayOneItem>
      <h2>{params.id}</h2>
    </div>
  );
}
