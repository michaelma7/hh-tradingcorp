import { getAllManufacturers } from '@/actions/manufacturers';
import NewManufacturerModal from '@/components/NewManufacturerModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const manufacturers = await getAllManufacturers();

  return (
    <div>
      <NewManufacturerModal />
      <TableGenerator
        data={manufacturers}
        className='bg-white'
        label={'All Manufacturers'}
        link={'manufacturers'}
      />
    </div>
  );
}
