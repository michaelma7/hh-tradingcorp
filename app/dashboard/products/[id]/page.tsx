import { getOneProduct } from '@/actions/products';
import { redirect } from 'next/navigation';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product] = await getOneProduct(id);
  if (!product) redirect('/dashboard/products');
  // fail statement to redirect to main page

  return (
    <div>
      <h2>{product.Name}</h2>
      <h4>{product.Manufacturer}</h4>
      <h4>Quantity: {product.Quantity}</h4>
      <h4>Reserved: {product.Reserved}</h4>
      <h4>Available: {product.Current}</h4>
    </div>
  );
}
