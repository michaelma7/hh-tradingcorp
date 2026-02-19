export default function AuthLayout({ children }: { children: any }) {
  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className='w-full max-w-[400px] mx-auto'>{children}</div>
    </div>
  );
}
