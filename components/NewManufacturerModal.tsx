'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Input,
} from '@heroui/react';
import { createManfacturer } from '@/actions/manufacturers';
import { useActionState } from 'react';
import { CirclePlus } from 'lucide-react';
import { userFormState } from './SignupForm';

export default function NewOrderModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const [formState, submit, pending] = useActionState<userFormState>(
    createManfacturer,
    initState
  );

  return (
    <>
      <Button color='primary' size='md' radius='md' onPress={onOpen}>
        Create New Manufacturer <CirclePlus size={16} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                New Manufacturer
              </ModalHeader>
              <ModalBody>
                <form action={submit}>
                  <Input
                    isClearable
                    isRequired
                    type='text'
                    name='name'
                    label='Customer Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    type='text'
                    name='contact'
                    label='Contact'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </form>
                {formState?.message && <p>{formState.message}</p>}
                <Button color='primary' disabled={pending}>
                  Submit
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
