import { getAllPurchaseOrders } from '@/actions/purchaseOrders';
import NewPurchaseOrderModal from '@/components/NewPurchaseOrderModal';
import TableGenerator from '@/components/TableGenerator';

export default async function PurchaseOrders() {
  const purchaseOrders = await getAllPurchaseOrders();

  return (
    <div>
      <NewPurchaseOrderModal />
      <TableGenerator
        data={purchaseOrders}
        className='bg-white'
        label={'All Purchase Orders'}
        link={'purchaseOrders'}
      />
    </div>
  );
}
