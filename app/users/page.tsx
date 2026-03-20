import TableGenerator from '@/components/TableGenerator';
import { getAllUsers } from '@/actions/users';

export default async function Users() {
  const users = await getAllUsers();
  return (
    <div className='flex flex-col gap-2 p-2'>
      {users.length ? (
        <TableGenerator
          data={users}
          className=''
          label={'All Users'}
          link={'users'}
        />
      ) : (
        <div>Nothing to display</div>
      )}
    </div>
  );
}
