import Shell from '@/components/Shell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col md:flexrow md:overflow-hidden'>
      <Shell>
        <div>{children}</div>
      </Shell>
    </div>
  );
}
