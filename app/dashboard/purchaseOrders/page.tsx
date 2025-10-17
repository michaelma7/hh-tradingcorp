import { getAllPurchaseOrders } from '@/actions/purchaseOrders';
import Link from 'next/link';
import NewPurchaseOrderModal from '@/components/NewPurchaseOrderModal';
import { CirclePlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/react';

export default async function PurchaseOrders() {
  const purchaseOrders = await getAllPurchaseOrders();

  return (
    <div>
      <NewPurchaseOrderModal />
      <Table>
        <TableHeader>
          <TableColumn>Purchase Order Id</TableColumn>
          <TableColumn>Order Date</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>See More Details</TableColumn>
        </TableHeader>
        <TableBody>
          {purchaseOrders.map((purchaseOrder) => {
            <TableRow key={purchaseOrder.key}>
              <TableCell>{purchaseOrder.id}</TableCell>
              <TableCell>{purchaseOrder.orderDate}</TableCell>
              <TableCell>{purchaseOrder.status}</TableCell>
              <TableCell>
                <Link href={`/dashboard/purchaseOrders/${purchaseOrder.id}`}>
                  <CirclePlus size={11} />
                </Link>
              </TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </div>
  );
}
