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
    <div>
      <h2>{manufacturer.name}</h2>
      <div>{manufacturer.contact}</div>
      <div>
        <AddEditManufacturerModal edit={true} data={manufacturer} />
        <DeleteForm id={id} action={deleteManfacturer} />
      </div>
    </div>
  );
}
