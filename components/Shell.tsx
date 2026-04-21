'use client';
import Sidebar from './Sidebar';
import Nav from './Nav';
import { useProvider } from '@/providers/CurrentUserProvider';
import { useEffect } from 'react';
import { userData } from '@/actions/users';

export default function Shell({
  children,
  data,
}: {
  children: React.ReactNode;
  data: userData | undefined;
}) {
  const changeUser = useProvider()!.setCurrentUser;
  useEffect(() => changeUser({ email: data!.email, role: data!.role }), []);
  return (
    <div className='flex w-screen h-screen'>
      <aside className='w-[200px] min-w-[200px] max-w-[200px] h-full border-r border-default-50'>
        <Sidebar />
      </aside>
      <div className='w-[calc(100vw-200px)] '>
        <Nav />
        <main className='h-[calc(100vh-65px)]'>{children}</main>
      </div>
    </div>
  );
}
