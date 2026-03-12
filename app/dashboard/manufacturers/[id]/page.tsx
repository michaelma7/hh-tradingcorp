import {
  getOneManufacturer,
  deleteManfacturer,
  manufacturerData,
} from '@/actions/manufacturers';
import AddEditManufacturerModal from '@/components/AddEditManufacturerModal';
import DeleteForm from '@/components/DeleteForm';
import { redirect } from 'next/navigation';

export default async function ManufacturerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const manufacturer: manufacturerData | undefined =
    await getOneManufacturer(id);
  if (!manufacturer) redirect('/dashboard/manufacturers');
  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='flex gap-2'>
        <AddEditManufacturerModal edit={true} data={manufacturer} />
        <DeleteForm id={id} action={deleteManfacturer} />
      </div>
      <span>名称: {manufacturer.name}</span>
      <span>联系: {manufacturer.contact}</span>
    </div>
  );
}
