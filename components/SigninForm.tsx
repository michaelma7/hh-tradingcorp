'use client';
import { useState, useActionState } from 'react';
import { signInUser } from '@/actions/auth';
import Link from 'next/link';
import { Input } from '@heroui/react';
import Submit from './Submit';
import { EyeFilledIcon } from '@/public/eyeFilled';
import { EyeSlashFilledIcon } from '@/public/eyeSlashFilled';

export default function SigninForm() {
  const initState = { message: null };
  const [formState, submit, isPending] = useActionState<{
    message: string | null;
  }>(signInUser, initState);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form
      action={submit}
      className='bg-content1 border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2 '
    >
      <h3 className='my-4 font-semibold'>Sign in</h3>
      <Input
        label='Email'
        name='email'
        type='email'
        variant='bordered'
        size='lg'
        isRequired
        labelPlacement='outside-left'
      />
      <Input
        label='Password'
        name='password'
        type={isVisible ? 'text' : 'password'}
        variant='bordered'
        labelPlacement='outside-left'
        isRequired
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
      <Submit label={'Sign In'} />
      {/* <div>
        <Link href='/signup'>{`Don't have an account?`}</Link>
      </div> */}
      {isPending ? 'Loading' : formState.message}
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
