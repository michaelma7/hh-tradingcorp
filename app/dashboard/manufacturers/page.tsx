import { getAllManufacturers } from '@/actions/manufacturers';
import NewManufacturerModal from '@/components/NewManufacturerModal';
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
  const manufacturers = await getAllManufacturers();

  return (
    <div>
      <NewManufacturerModal />
      <Table>
        <TableHeader>
          <TableColumn>Manufacturer Id</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Contact</TableColumn>
          <TableColumn>See More Details</TableColumn>
        </TableHeader>
        <TableBody>
          {manufacturers.map((manufacturer) => {
            <TableRow key={manufacturer.key}>
              <TableCell>{manufacturer.id}</TableCell>
              <TableCell>{manufacturer.name}</TableCell>
              <TableCell>{manufacturer.contact}</TableCell>
              <TableCell>
                <Link href={`/dashboard/manufacturers/${manufacturer.id}`}>
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
