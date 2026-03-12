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
import { CirclePlus } from 'lucide-react';
import { useActionState } from 'react';

export default function AddEditCustomerModal({
  edit,
  data,
}: {
  edit: boolean;
  data?: customersData;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = null;
  const formAction = async (
    prevState: CustomerFormState,
    formData: FormData,
  ) => {
    if (edit) {
      formData.append('id', data!.id as string);
      return await updateCustomer(prevState, formData);
    } else return await createCustomer(prevState, formData);
  };
  const [formState, submit, pending] = useActionState(formAction, initState);

  return (
    <div>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit: 编辑 <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          创建新客户 <CirclePlus size={16} />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{edit ? '编辑客户' : '新客户'}</ModalHeader>
              <ModalBody>
                <form action={submit} className='pb-4 flex flex-col gap-2'>
                  <Input
                    isClearable
                    isRequired
                    defaultValue={edit ? data!.name : ''}
                    type='text'
                    name='name'
                    label='客户名称'
                    className='col-span-5 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={data?.location ? data?.location : ''}
                    type='text'
                    name='location'
                    label='地点'
                    className='col-span-5 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Submit label='提交' disabled={pending} />
                  <Button color='danger' variant='flat' onPress={onClose}>
                    取消
                  </Button>
                </form>
                {formState?.message && <p>{formState.message}</p>}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
