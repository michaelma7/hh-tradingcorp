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
  NumberInput,
} from '@heroui/react';
import { createProduct } from '@/actions/products';
import { useActionState } from 'react';
import { CirclePlus } from 'lucide-react';
import { userFormState } from './SignupForm';

export default function NewOrderModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const [formState, submit, pending] = useActionState<userFormState>(
    createProduct,
    initState
  );

  return (
    <>
      <Button color='primary' size='md' radius='md' onPress={onOpen}>
        Create New Product <CirclePlus size={16} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                New Product
              </ModalHeader>
              <ModalBody>
                <form action={submit}>
                  <Input
                    isClearable
                    isRequired
                    type='text'
                    name='name'
                    label='Product Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    type='text'
                    name='commonName'
                    label='Common Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    isRequired
                    type='text'
                    name='manufacturedBy'
                    label='Manufactured By'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    type='text'
                    name='imageLink'
                    label='Image Link'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <NumberInput
                    type='number'
                    label='Quantity'
                    name='quantity'
                    minValue={0}
                    hideStepper
                    className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
