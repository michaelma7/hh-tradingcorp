import { getAllProducts } from '@/actions/products';
import NewProductModal from '@/components/NewProductModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const products = await getAllProducts();

  return (
    <div>
      <NewProductModal />
      <TableGenerator
        data={products}
        className='bg-white'
        label={'All Products'}
        link={'products'}
      />
    </div>
  );
}
