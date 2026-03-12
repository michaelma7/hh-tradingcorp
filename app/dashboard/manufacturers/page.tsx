import { getAllManufacturers } from '@/actions/manufacturers';
import AddEditManufacturerModal from '@/components/AddEditManufacturerModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Manufacturers() {
  const manufacturers = await getAllManufacturers();

  return (
    <div className='flex flex-col gap-2 p-2'>
      <AddEditManufacturerModal edit={false} />
      <TableGenerator
        data={manufacturers}
        className=''
        label={'All Manufacturers'}
        link={'manufacturers'}
      />
    </div>
  );
}
