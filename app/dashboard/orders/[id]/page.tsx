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
  if (!order) redirect('/dashboard/orders');
  if (order!.ordersToOrderItems) {
    order!.ordersToOrderItems.forEach((item) => {
      lineItems.push({
        id: item.id,
        productId: item.product.name,
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

  return (
    <div>
      <h2>{order.name}</h2>
      <h3>{order.customers.name}</h3>
      {lineItems ? (
        lineItems.map((item) => (
          <div key={item.id}>
            <p>Product: {item.productId}</p>
            <p>Qty: {item.quantity}</p>
            <p>${item.price}</p>
          </div>
        ))
      ) : (
        <div>No Items</div>
      )}
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
