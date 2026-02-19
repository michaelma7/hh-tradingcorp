'use client';
import { useState } from 'react';
import { Input } from '@heroui/react';
import Submit from '@/components/Submit';
import { updateUser, userData } from '@/actions/users';
import { EyeFilledIcon } from '@/public/eyeFilled';
import { EyeSlashFilledIcon } from '@/public/eyeSlashFilled';
import { useFormAction } from '@/utils/useFormAction';
import { UserFormState } from '@/actions/auth';

export default function EditUserForm({ data }: { data: userData }) {
  const formAction = (prevState: any, formData: FormData) => {
    formData.append('id', data.id);
    return updateUser(prevState, formData);
  };
  const initState: UserFormState = null;
  const [formState, submit, isPending] = useFormAction<UserFormState>(
    formAction,
    initState,
  );
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  return (
    <form
      action={submit}
      className='bg-content1 border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2'
    >
      <Input
        label='Email'
        type='email'
        variant='bordered'
        name='email'
        isRequired
        fullWidth
        defaultValue={data.email}
      />
      <Input
        label='Current Password'
        type={isVisible ? 'text' : 'password'}
        variant='bordered'
        name='current'
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
      <Input
        label='New Password'
        type={isVisible ? 'text' : 'password'}
        variant='bordered'
        name='change'
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
      <Input
        label='Re-type Password'
        name='confirmPassword'
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
      <Submit label={'Submit Changes'} />
      {isPending ? 'Loading...' : formState?.message}
      {formState?.message && <p>{formState.message}</p>}
    </form>
  );
}
