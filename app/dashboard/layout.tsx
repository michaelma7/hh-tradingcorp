import Shell from '@/components/Shell';
import { getCurrentUser } from '@/actions/users';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <div className='flex h-screen flex-col md:flexrow md:overflow-hidden'>
      <Shell data={user}>
        <div>{children}</div>
      </Shell>
    </div>
  );
}
