import { getAllProducts } from '@/actions/products';
import NewProductModal from '@/components/NewProductModal';
import Link from 'next/link';
import { CirclePlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/react';

export default async function Orders() {
  const products = await getAllProducts();

  return (
    <div>
      <NewProductModal />
      <Table>
        <TableHeader>
          <TableColumn>Product Name</TableColumn>
          <TableColumn>Common Name</TableColumn>
          <TableColumn>Manufactured By</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>See More Details</TableColumn>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            <TableRow key={product.key}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.commonName}</TableCell>
              <TableCell>{product.manufacturedBy}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                <Link href={`/dashboard/products/${product.id}`}>
                  <CirclePlus />
                </Link>
              </TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </div>
  );
}
