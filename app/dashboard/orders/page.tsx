import { getAllOrders } from '@/actions/orders';
import AddEditOrderModal from '@/components/AddEditOrderModal';
import TableGenerator from '@/components/TableGenerator';
import { getProductsforOrders } from '@/actions/products';

export default async function Orders() {
  const orders = await getAllOrders();
  const products = await getProductsforOrders();
  return (
    <div>
      <AddEditOrderModal productData={products} edit={false} />
      <TableGenerator
        data={orders}
        className='bg-white'
        label={'All Orders'}
        link={'orders'}
      />
    </div>
  );
}
