import { redirect } from 'next/navigation';
import DeleteForm from '@/components/DeleteForm';
import EditUserForm from '@/components/EditUserForm';
import { deleteUser, getOneUser } from '@/actions/users';

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user] = await getOneUser(id);
  if (!user) redirect('/dashboard');

  return (
    <div className='flex flex-col gap-2'>
      <span>Edit User Info</span>
      <EditUserForm data={user} />
      <DeleteForm id={id} action={deleteUser} />
    </div>
  );
}
