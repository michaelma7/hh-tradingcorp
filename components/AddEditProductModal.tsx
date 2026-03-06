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
import { useActionState } from 'react';
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
  const formAction = async (
    prevState: ProductFormState,
    formData: FormData,
  ): Promise<ProductFormState> => {
    if (edit) {
      formData.append('id', JSON.stringify(data!.id));
      return await updateProduct(prevState, formData);
    } else return await createProduct(prevState, formData);
  };
  const [formState, submit, pending] = useActionState(formAction, initState);

  return (
    <>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit: 编辑 <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          创建新产品 <CirclePlus size={16} />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{edit ? '编辑产品' : '新产品'}</ModalHeader>
              <ModalBody>
                <form action={submit} className='flex flex-col gap-2 pb-4'>
                  <Input
                    isClearable
                    isRequired
                    defaultValue={edit ? data!.name : ''}
                    type='text'
                    name='name'
                    label='产品名'
                    className='px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500'
                  />
                  <Input
                    isClearable
                    defaultValue={edit ? data!.commonName : ''}
                    type='text'
                    name='commonName'
                    label='通用名'
                    className='px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500'
                  />
                  <Input
                    isClearable
                    isRequired
                    defaultValue={edit ? data!.manufacturedBy.name : ''}
                    type='text'
                    name='manufacturedBy'
                    label='生产厂家'
                    className='px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500'
                  />
                  <Input
                    isClearable
                    defaultValue={data?.imageLink ? data?.imageLink : ''}
                    type='text'
                    name='imageLink'
                    label='图片链接'
                    className='px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500'
                  />
                  <NumberInput
                    defaultValue={data?.quantity ? data?.quantity : 0}
                    type='number'
                    label='数量'
                    name='quantity'
                    minValue={0}
                    hideStepper
                    className='px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500'
                  />
                  <Button type='submit' color='primary' disabled={pending}>
                    提交
                  </Button>
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
    </>
  );
}
