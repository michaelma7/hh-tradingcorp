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
import {
  createProduct,
  updateProduct,
  productData,
  ProductFormState,
} from '@/actions/products';
import { useFormAction } from '@/utils/useFormAction';
import { CirclePlus } from 'lucide-react';

export default function AddEditProductModal({
  edit,
  data,
}: {
  edit: boolean;
  data?: productData;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = null;
  const formAction = (
    prevState: ProductFormState,
    formData: FormData,
  ): Promise<ProductFormState> => {
    if (edit) {
      formData.append('id', JSON.stringify(data!.id));
      return updateProduct(prevState, formData);
    } else return createProduct(prevState, formData);
  };
  const [formState, submit, pending] = useFormAction(formAction, initState);

  return (
    <>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Create New Product <CirclePlus size={16} />
        </Button>
      )}
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
                    defaultValue={edit ? data!.name : ''}
                    type='text'
                    name='name'
                    label='Product Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={edit ? data!.commonName : ''}
                    type='text'
                    name='commonName'
                    label='Common Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    isRequired
                    defaultValue={edit ? data!.manufacturedBy.name : ''}
                    type='text'
                    name='manufacturedBy'
                    label='Manufactured By'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={data!.imageLink ? data!.imageLink : ''}
                    type='text'
                    name='imageLink'
                    label='Image Link'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <NumberInput
                    defaultValue={data!.quantity ? data!.quantity : 0}
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
