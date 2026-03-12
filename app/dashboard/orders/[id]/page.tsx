import {
  getOneOrder,
  deleteOrder,
  orderItemData,
  lineItemData,
} from '@/actions/orders';
import { redirect } from 'next/navigation';
import DeleteForm from '@/components/DeleteForm';
import AddEditOrderModal from '@/components/AddEditOrderModal';
import { getProductsforOrders } from '@/actions/products';
import TableGenerator from '@/components/TableGenerator';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOneOrder(id);
  const products = await getProductsforOrders();
  const lineItems: orderItemData[] = [];
  const lineItemsRow: lineItemData[] = [];
  if (!order) redirect('/dashboard/orders');
  if (order?.ordersToOrderItems) {
    order?.ordersToOrderItems.forEach((item) => {
      lineItems.push({
        id: item.id,
        productId: item.product.name,
        quantity: item.quantity ? item.quantity : 0,
        price: item.priceCents ? item.priceCents / 100 : 0,
      });
      lineItemsRow.push({
        产品名称: item.product.name,
        数量: item.quantity ? item.quantity : 0,
        价格: `$${item.priceCents ? item.priceCents / 100 : 0}`,
        小计: `$${item.priceCents && item.quantity ? (item.quantity * item.priceCents) / 100 : 0}`,
      });
    });
  }
  const orderData = {
    id: id,
    name: order!.name,
    createdBy: order!.createdById,
    customers: order!.customers,
    totalCents: order!.totalCents,
    status: order!.status,
  };

  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='flex gap-2'>
        <AddEditOrderModal
          productData={products}
          edit={true}
          orderData={orderData}
          lineItems={lineItems}
        />
        <DeleteForm id={id} action={deleteOrder} />
      </div>
      <span>订单号: {order.name}</span>
      <span>顾客: {order.customers.name}</span>
      <span>送到了吗? {order.status ? 'Yes' : 'No'} </span>
      <span>品目</span>
      <TableGenerator
        data={lineItemsRow}
        label='Line Item Table'
        className=''
        link='n/a'
      />
      <span>总数: ${order.totalCents / 100}</span>
    </div>
  );
}
