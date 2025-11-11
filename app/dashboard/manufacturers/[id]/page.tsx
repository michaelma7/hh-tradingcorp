import { getOneManufacturer } from '@/actions/manufacturers';
import { redirect } from 'next/navigation';

export default async function ManufacturerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [manufacturer] = await getOneManufacturer(id);
  if (!manufacturer) redirect('/dashboard/manufacturers');
  return (
    <div>
      <h2>{manufacturer.id}</h2>
    </div>
  );
}
