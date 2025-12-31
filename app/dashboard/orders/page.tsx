import { getAllOrders } from '@/actions/orders';
import NewOrderModal from '@/components/NewOrderModal';
import TableGenerator from '@/components/TableGenerator';
import { getProductsforOrders } from '@/actions/products';

export default async function Orders() {
  const orders = await getAllOrders();
  const products = await getProductsforOrders();
  return (
    <div>
      <NewOrderModal productData={products} />
      <TableGenerator
        data={orders}
        className='bg-white'
        label={'All Orders'}
        link={'orders'}
      />
    </div>
  );
}
