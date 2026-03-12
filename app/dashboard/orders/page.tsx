import { getAllOrders } from '@/actions/orders';
import AddEditOrderModal from '@/components/AddEditOrderModal';
import TableGenerator from '@/components/TableGenerator';
import { getProductsforOrders } from '@/actions/products';

export default async function Orders() {
  const orders = await getAllOrders();
  const products = await getProductsforOrders();
  return (
    <div className='flex flex-col gap-2 p-2'>
      <AddEditOrderModal productData={products} edit={false} />
      {orders.length ? (
        <TableGenerator
          data={orders}
          className=''
          label={'All Orders'}
          link={'orders'}
        />
      ) : (
        <div>Nothing to display</div>
      )}
    </div>
  );
}
