import { getAllPurchaseOrders } from '@/actions/purchaseOrders';
import { getProductsforOrders } from '@/actions/products';
import AddEditPurchaseOrderModal from '@/components/AddEditPurchaseOrderModal';
import TableGenerator from '@/components/TableGenerator';

export default async function PurchaseOrders() {
  const purchaseOrders = await getAllPurchaseOrders();
  const products = await getProductsforOrders();
  return (
    <div>
      <AddEditPurchaseOrderModal edit={false} productData={products} />
      <TableGenerator
        data={purchaseOrders}
        className=''
        label={'All Purchase Orders'}
        link={'purchaseOrders'}
      />
    </div>
  );
}
