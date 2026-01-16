import { getOneOrder, deleteOrder, orderItemData } from '@/actions/orders';
import { redirect } from 'next/navigation';
import DeleteForm from '@/components/DeleteForm';
import AddEditOrderModal from '@/components/AddEditOrderModal';
import { getProductsforOrders } from '@/actions/products';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOneOrder(id);
  const products = await getProductsforOrders();
  const lineItems: orderItemData[] = [];
  if (order!.ordersToOrderItems) {
    order!.ordersToOrderItems.forEach((item) => {
      lineItems.push({
        id: item.id,
        product: item.product.name,
        productId: item.product.id,
        quantity: item.quantity ? item.quantity : 0,
        price: item.priceCents ? item.priceCents / 100 : 0,
      });
    });
  }
  const orderData = {
    id: id,
    name: order!.name,
    createdBy: order!.createdById,
    customer: order!.customers.name,
    totalCents: order!.totalCents,
    status: order!.status,
  };
  if (!order) redirect('/dashboard/orders');
  return (
    <div>
      <h2>{order.name}</h2>
      <h3>{order.customerId}</h3>
      <div>
        <AddEditOrderModal
          productData={products}
          edit={true}
          orderData={orderData}
          lineItems={lineItems}
        />
        <DeleteForm id={id} action={deleteOrder} />
      </div>
    </div>
  );
}
