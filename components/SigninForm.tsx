'use client';

import { useFormState } from 'react-dom';
import { signinUser } from '@/app/actions/auth';
import Link from 'next/link';
import Button from './Button';

const initState = { message: null };

export default function SigninForm() {
  const [formState, action] = useFormState<{ message: string | null }>(
    signinUser,
    initState
  );

  return (
    <form
      action={action}
      className='bg-content1 border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2 '
    >
      <h3 className='my-4'>Sign in</h3>
      <input required placeholder='Email' name='email' type='email' />
      <input name='password' required type='password' placeholder='Password' />
      <Button type='submit'>Sign In</Button>
      <div>
        <Link href='/signup'>{`Don't have an account?`}</Link>
      </div>
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
