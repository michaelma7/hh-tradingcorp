import { getAllProducts } from '@/actions/products';
import AddEditProductModal from '@/components/AddEditProductModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Products() {
  const products = await getAllProducts();
  return (
    <div className='flex flex-col gap-2 p-2'>
      <AddEditProductModal edit={false} />
      {products.length ? (
        <TableGenerator
          data={products}
          className=''
          label={'All Products'}
          link={'products'}
        />
      ) : (
        <div>Nothing to display</div>
      )}
    </div>
  );
}
