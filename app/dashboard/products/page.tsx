import { getAllProducts } from '@/actions/products';
import AddEditProductModal from '@/components/AddEditProductModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const products = await getAllProducts();
  return (
    <div>
      <AddEditProductModal edit={false} />
      <TableGenerator
        data={products}
        className=''
        label={'All Products'}
        link={'products'}
      />
    </div>
  );
}
