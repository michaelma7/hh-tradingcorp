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
  const [product] = await getOneProduct(id);
  if (!product) redirect('/dashboard/products');

  return (
    <div>
      <h2>{product.name}</h2>
      <h4>{product.manufacturer}</h4>
      <h4>Quantity: {product.quantity}</h4>
      <h4>Reserved: {product.reserved}</h4>
      <h4>Available: {product.current}</h4>
      <div>
        <AddEditProductModal edit={true} data={product} />
        <DeleteForm id={id} action={deleteProduct} />
      </div>
    </div>
  );
}
