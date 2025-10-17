import { getAllOrders } from '@/actions/orders';
import NewOrderModal from '@/components/NewOrderModal';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/react';

export default async function Orders() {
  const orders = await getAllOrders();

  return (
    <div>
      <NewOrderModal />
      <Table>
        <TableHeader>
          <TableColumn>Order Name</TableColumn>
          <TableColumn>Customer Name</TableColumn>
          <TableColumn>Total</TableColumn>
          <TableColumn>Delivered?</TableColumn>
          <TableColumn>See More Details</TableColumn>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            <TableRow key={order.key}>
              <TableCell>{order.name}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.totalCents * 100}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <Link href={`/dashboard/orders/${order.id}`}>More Details</Link>
              </TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </div>
  );
}
