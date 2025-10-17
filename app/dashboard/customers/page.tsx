import { getAllCustomers } from '@/actions/customers';
import NewCustomerModal from '@/components/NewCustomerModal';
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
  const customers = await getAllCustomers();

  return (
    <div>
      <NewCustomerModal />
      <Table>
        <TableHeader>
          <TableColumn>Customer Id</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Location</TableColumn>
          <TableColumn>See More Details</TableColumn>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            <TableRow key={customer.key}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.location}</TableCell>
              <TableCell>
                <Link href={`/dashboard/customers/${customer.id}`}>
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
