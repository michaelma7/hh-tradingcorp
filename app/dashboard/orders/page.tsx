import { getAllOrders } from '@/actions/orders';
import NewOrderModal from '@/components/NewOrderModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const orders = await getAllOrders();

  return (
    <div>
      <NewOrderModal />
      <TableGenerator
        data={orders}
        className='bg-white'
        label={'All Orders'}
        link={'orders'}
      />
    </div>
  );
}
