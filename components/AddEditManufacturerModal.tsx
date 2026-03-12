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
import { useActionState } from 'react';
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
  const formAction = async (
    prevState: ManufacturerFormState,
    formData: FormData,
  ) => {
    if (edit) {
      formData.append('id', data!.id as string);
      return await updateManfacturer(prevState, formData);
    } else return await createManfacturer(prevState, formData);
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
          创建新生产厂家 <CirclePlus size={16} />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{edit ? '编辑生产厂家' : '新生产厂家'}</ModalHeader>
              <ModalBody>
                <form action={submit} className='pb-4 flex flex-col gap-2'>
                  <Input
                    isClearable
                    isRequired
                    defaultValue={edit ? data!.name : ''}
                    type='text'
                    name='name'
                    label='生产厂家名称'
                    className='rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Input
                    isClearable
                    defaultValue={data?.contact ? data?.contact : ''}
                    type='text'
                    name='contact'
                    label='联系'
                    className='rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Submit label={'提交'} disabled={pending} />
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
