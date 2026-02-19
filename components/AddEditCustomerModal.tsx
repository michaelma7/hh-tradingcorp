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
import Submit from '@/components/Submit';
import {
  createCustomer,
  updateCustomer,
  customersData,
  CustomerFormState,
} from '@/actions/customers';
import { useFormAction } from '@/utils/useFormAction';
import { CirclePlus } from 'lucide-react';

export default function AddEditCustomerModal({
  edit,
  data,
}: {
  edit: boolean;
  data?: customersData;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const formAction = (prevState: CustomerFormState, formData: FormData) => {
    if (edit) {
      formData.append('id', JSON.stringify(data!.id));
      return updateCustomer(prevState, formData);
    } else return createCustomer(prevState, formData);
  };
  const [formState, submit, pending] = useFormAction(formAction, initState);
  let customerName = '';
  let location = '';
  if (edit) {
    customerName = data!.name;
    location = data!.location;
  }

  return (
    <>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Create New Customer <CirclePlus size={16} />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                New Customer
              </ModalHeader>
              <ModalBody>
                <form action={submit}>
                  <Input
                    isClearable
                    isRequired
                    defaultValue={customerName}
                    type='text'
                    name='name'
                    label='Customer Name'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={location}
                    type='text'
                    name='location'
                    label='Location'
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Submit label='Submit' disabled={pending} />
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
