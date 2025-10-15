import { getAllPurchaseOrders } from '@/actions/purchaseOrders';
import Link from 'next/link';

export default async function PurchaseOrders() {
  const purchaseOrders = await getAllPurchaseOrders();

  return (
    <div>
      {purchaseOrders.map((purchaseOrder) => {
        <div key={purchaseOrder.id}>
          <Link href={`/dashboard/purchaseOrders/${purchaseOrder.id}`}>
            {purchaseOrder.name}
          </Link>
        </div>;
      })}
    </div>
  );
}
