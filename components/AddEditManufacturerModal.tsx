'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Button,
  Input,
} from '@heroui/react';
import Submit from './Submit';
import {
  createManfacturer,
  updateManfacturer,
  manufacturerData,
  ManufacturerFormState,
} from '@/actions/manufacturers';
import { useFormAction } from '@/utils/useFormAction';
import { CirclePlus } from 'lucide-react';

export default function AddEditManufacturerModal({
  edit,
  data,
}: {
  edit: boolean;
  data?: manufacturerData;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const formAction = (prevState: ManufacturerFormState, formData: FormData) => {
    if (edit) {
      formData.append('id', data!.id as string);
      return updateManfacturer(prevState, formData);
    } else return createManfacturer(prevState, formData);
  };
  const [formState, submit, pending] = useFormAction(formAction, initState);
  const manufacturerName = data!.name ? data!.name : '';
  const contact = data!.contact ? data!.contact : '';

  return (
    <>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Create New Manufacturer <CirclePlus size={16} />
        </Button>
      )}
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
                    defaultValue={manufacturerName}
                    type='text'
                    name='name'
                    label='Manufacturer Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={contact}
                    type='text'
                    name='contact'
                    label='Contact'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Submit label={'Submit'} disabled={pending} />
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
