'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/actions/auth';
import { Input } from '@heroui/react';
import Submit from './Submit';

export type userFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

export default function SignupForm() {
  const initState = { message: null };
  const [formState, submit, isPending] = useActionState<userFormState>(
    registerUser,
    initState
  );

  return (
    <form
      action={submit}
      className='bg-content1 border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2'
    >
      <h3 className='my-4 font-semibold'>Sign Up</h3>
      <Input
        label='Email'
        type='email'
        variant='bordered'
        isRequired
        fullWidth
      />
      <Input
        label='Password'
        type='password'
        variant='bordered'
        isRequired
        fullWidth
      />
      <Input
        label='Re-type Password'
        name='confirmPassword'
        type='password'
        variant='bordered'
        isRequired
        fullWidth
      />
      <Submit label={'Sign Up'} />
      <div>
        <Link href='/signin'>{`Already have an account?`}</Link>
      </div>
      {isPending ? 'Loading...' : formState?.message}
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
