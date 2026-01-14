import { getAllPurchaseOrders } from '@/actions/purchaseOrders';
import AddEditPurchaseOrderModal from '@/components/AddEditPurchaseOrderModal';
import TableGenerator from '@/components/TableGenerator';

export default async function PurchaseOrders() {
  const purchaseOrders = await getAllPurchaseOrders();

  return (
    <div>
      <AddEditPurchaseOrderModal edit={false} />
      <TableGenerator
        data={purchaseOrders}
        className='bg-white'
        label={'All Purchase Orders'}
        link={'purchaseOrders'}
      />
    </div>
  );
}
