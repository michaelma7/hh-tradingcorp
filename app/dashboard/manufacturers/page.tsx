import { getAllManufacturers } from '@/actions/manufacturers';
import AddEditManufacturerModal from '@/components/AddEditManufacturerModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Manufacturers() {
  const manufacturers = await getAllManufacturers();

  return (
    <div>
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
