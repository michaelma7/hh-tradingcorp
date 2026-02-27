'use client';
import { useState, useActionState } from 'react';
import { signInUser, UserFormState } from '@/actions/auth';
import { Input } from '@heroui/react';
import Submit from './Submit';
import { EyeFilledIcon } from '@/public/eyeFilled';
import { EyeSlashFilledIcon } from '@/public/eyeSlashFilled';

export default function SigninForm() {
  const initState: UserFormState = null;
  const [formState, submit, isPending] = useActionState<
    UserFormState,
    FormData
  >(signInUser, initState);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form
      action={submit}
      className='border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2 '
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
      <Submit label={'Sign In'} disabled={isPending} />
      {isPending ? 'Loading' : ''}
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
