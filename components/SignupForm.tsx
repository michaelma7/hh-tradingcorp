'use client';
import { useState, useActionState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/actions/auth';
import { Input } from '@heroui/react';
import Submit from './Submit';
import { EyeFilledIcon } from '@/public/eyeFilled';
import { EyeSlashFilledIcon } from '@/public/eyeSlashFilled';

export type userFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
export default function SignupForm() {
  const initState = { message: null };
  const [formState, action] = useActionState<userFormState>(
    registerUser,
    initState
  );

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form
      action={action}
      className='bg-content1 border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2'
    >
      <h3 className='my-4'>Sign Up</h3>
      <Input
        label='Email'
        type='email'
        variant='bordered'
        isRequired
        fullWidth
      />
      <Input
        label='Password'
        type={isVisible ? 'text' : 'password'}
        variant='bordered'
        isRequired
        fullWidth
        endContent={
          <button
            aria-label='toggle password visibility'
            className='focus:outline-solid outline-transparent'
            type='button'
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <EyeSlashFilledIcon className='text-2xl text-default-400 pointer-events-none' />
            ) : (
              <EyeFilledIcon className='text-2xl text-default-400 pointer-events-none' />
            )}
          </button>
        }
      />
      <Submit label={'Sign Up'} />
      <div>
        <Link href='/signin'>{`Already have an account?`}</Link>
      </div>
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
