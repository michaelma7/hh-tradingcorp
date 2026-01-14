import {
  getOnePurchaseOrder,
  deletePurchaseOrder,
  purchaseOrderItem,
} from '@/actions/purchaseOrders';
import { redirect } from 'next/navigation';
import DeleteForm from '@/components/DeleteForm';
import AddEditPurchaseOrderModal from '@/components/AddEditPurchaseOrderModal';

export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchaseOrder = await getOnePurchaseOrder(id);
  const lineItems: purchaseOrderItem[] = [];
  if (purchaseOrder!.items) {
    purchaseOrder!.items.forEach((item) => {
      lineItems.push({
        id: item.id,
        product: item.product.name,
        quantity: item.quantity ? item.quantity : 0,
        price: item.priceCents ? item.priceCents / 100 : 0,
        expirationDate: item.expirationDate ? item.expirationDate : '',
      });
    });
  }
  if (!purchaseOrder) redirect('/dashboard/purchaseOrders');
  return (
    <div>
      <h2>{purchaseOrder.id}</h2>
      <h4>{purchaseOrder.orderDate}</h4>
      <h4>Status: {purchaseOrder.status}</h4>
      <div>
        <AddEditPurchaseOrderModal
          edit={true}
          orderData={purchaseOrder}
          lineItems={lineItems}
        />
        <DeleteForm id={id} action={deletePurchaseOrder} />
      </div>
    </div>
  );
}
