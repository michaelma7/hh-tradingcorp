'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Button,
  Input,
  NumberInput,
} from '@heroui/react';
import { createProduct, updateProduct } from '@/actions/products';
import { useActionState } from 'react';
import { CirclePlus } from 'lucide-react';

export default function AddEditProductModal({
  edit,
  data,
}: {
  edit: boolean;
  data?: any;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const formAction = (prevState: any, formData: FormData) => {
    if (edit) {
      formData.append('id', data.id);
      updateProduct(prevState, formData);
    } else createProduct(prevState, formData);
  };
  const [formState, submit, pending] = useActionState(formAction, initState);
  let productName = '';
  let commonName = '';
  let manufacturer = '';
  let imageLink = '';
  let quantity = 0;
  if (edit) {
    productName = data.name;
    commonName = data.commonName;
    manufacturer = data.manufacturedBy;
    imageLink = data.imageLink;
    quantity = data.quantity;
  }

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
                    defaultValue={productName}
                    type='text'
                    name='name'
                    label='Product Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={commonName}
                    type='text'
                    name='commonName'
                    label='Common Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    isRequired
                    defaultValue={manufacturer}
                    type='text'
                    name='manufacturedBy'
                    label='Manufactured By'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={imageLink}
                    type='text'
                    name='imageLink'
                    label='Image Link'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <NumberInput
                    defaultValue={quantity}
                    type='number'
                    label='Quantity'
                    name='quantity'
                    minValue={0}
                    hideStepper
                    className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Button type='submit' color='primary' disabled={pending}>
                    Submit
                  </Button>
                  <Button color='danger' variant='light' onPress={onClose}>
                    Cancel
                  </Button>
                </form>
                {formState?.message && <p>{formState.message}</p>}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
