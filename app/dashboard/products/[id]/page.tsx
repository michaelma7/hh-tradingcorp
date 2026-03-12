import { getOneProduct, deleteProduct } from '@/actions/products';
import { redirect } from 'next/navigation';
import DeleteForm from '@/components/DeleteForm';
import AddEditProductModal from '@/components/AddEditProductModal';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getOneProduct(id);
  if (!product) redirect('/dashboard/products');

  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='flex gap-2'>
        <AddEditProductModal edit={true} data={product} />
        <DeleteForm id={id} action={deleteProduct} />
      </div>
      <span>产品名: {product.name}</span>
      {/* <span>生产厂家: {product.manufacturedBy.name}</span> */}
      <span>数量: {product.quantity}</span>
      <span>保留的: {product.reserved}</span>
      <span>目前可用: {product.current}</span>
    </div>
  );
}
