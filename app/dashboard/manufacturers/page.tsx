import { getAllManufacturers } from '@/actions/manufacturers';
import AddEditManufacturerModal from '@/components/AddEditManufacturerModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const manufacturers = await getAllManufacturers();

  return (
    <div>
      <AddEditManufacturerModal edit={false} />
      <TableGenerator
        data={manufacturers}
        className='bg-white'
        label={'All Manufacturers'}
        link={'manufacturers'}
      />
    </div>
  );
}
