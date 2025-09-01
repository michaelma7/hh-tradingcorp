'use client';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';
import Button from './Button';

export default function SignupForm() {
  const initState = { message: null };
  const [formState, action] = useFormState<{ message: string | null }>(
    registerUser,
    initState
  );
  return (
    <form
      action={action}
      className='bg-content1 border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2'
    >
      <h3 className='my-4'>Sign Up</h3>
      <input placeholder='Email' name='email' required />
      <input name='password' placeholder='password' required type='password' />
      <Button className='mt-4 w-full' type='submit'>
        Sign Up
      </Button>
      <div>
        <Link href='/signin'>{`Already have an account?`}</Link>
      </div>
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
