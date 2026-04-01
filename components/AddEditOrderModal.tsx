'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Checkbox,
  NumberInput,
} from '@heroui/react';
import {
  createOrder,
  modifyOrderItems,
  updateOrder,
  orderData,
  orderItemData,
  OrderItemFormState,
  OrderFormState,
} from '@/actions/orders';
import { productsForOrders } from '@/actions/products';
import { useActionState, useState } from 'react';
import { CirclePlus, Plus, Trash2 } from 'lucide-react';
import Submit from './Submit';
import { useProvider } from '@/providers/CurrentUserProvider';

export default function AddEditOrderModal({
  productData,
  edit,
  orderData,
  lineItems,
}: {
  productData: productsForOrders[];
  edit: boolean;
  orderData?: orderData;
  lineItems?: orderItemData[];
}) {
  const currentUser = useProvider()?.currentUser;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deliveryStatus, setDeliveryStatus] = useState(
    edit ? orderData!.status : false,
  );
  const initState = { message: null };
  const formAction = async (
    prevState: OrderFormState | OrderItemFormState,
    formData: FormData,
  ): Promise<OrderFormState | OrderItemFormState> => {
    if (edit) {
      for (const item of items) formData.append('productId', item.productId);
      formData.append('id', orderData!.id);
      formData.append('totalCents', JSON.stringify(total * 100));
      formData.set('status', JSON.stringify(deliveryStatus));
      await modifyOrderItems(prevState, formData);
      return await updateOrder(prevState, formData);
    } else {
      for (const item of items) formData.append('productId', item.productId);
      formData.append('totalCents', JSON.stringify(total * 100));
      formData.set('status', JSON.stringify(deliveryStatus));
      return await createOrder(prevState, formData);
    }
  };
  const [formState, submit, pending] = useActionState(formAction, initState);
  const initItems = lineItems
    ? lineItems
    : [
        {
          id: '1',
          productId: '',
          quantity: 0,
          price: 0,
          subtotal: 0,
        },
      ];
  const [items, setItems] = useState(initItems);
  const addItem = () => {
    const newId = items!.length + 1;
    setItems([
      ...items,
      {
        id: newId.toString(),
        productId: '',
        quantity: 0,
        price: 0,
        subtotal: 0,
      },
    ]);
  };
  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  const updateItem = (
    id: string,
    field: string,
    value: string | number | React.Key,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };
  const total = items.reduce(
    (acc, curr) => acc + curr.quantity! * curr.price!,
    0,
  );

  return (
    <div>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit: 编辑 <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          下新订单 <CirclePlus size={16} />
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior='inside'
        size='3xl'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{edit ? '编辑订单' : '新订单'}</ModalHeader>
              <ModalBody>
                <form
                  action={submit}
                  className='rounded-md p-3 flex flex-col gap-3 pb-4'
                >
                  <Input
                    type='text'
                    name='name'
                    label='订单号'
                    defaultValue={edit ? orderData!.name : ''}
                    isRequired
                    className='w-1/2'
                  />
                  <Input
                    type='text'
                    name='customer'
                    label='顾客'
                    defaultValue={edit ? orderData!.customers.name : ''}
                    isRequired
                    className='w-1/2'
                  />
                  <Checkbox
                    aria-label='送到了吗？'
                    name='status'
                    size='sm'
                    radius='full'
                    isSelected={deliveryStatus}
                    onValueChange={setDeliveryStatus}
                  >
                    送到了吗?
                  </Checkbox>
                  <Input
                    type='text'
                    name='createdBy'
                    label='用户名'
                    isReadOnly
                    defaultValue={currentUser}
                    className='w-1/2 rounded-md'
                  />
                  <div className='grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm'>
                    <div className='col-span-4'>产品名称</div>
                    <div className='col-span-2'>数量</div>
                    <div className='col-span-2'>价格</div>
                    <div className='col-span-2'>小计</div>
                    <div className='col-span-1'></div>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className='grid grid-cols-12 gap-4 items-center'
                    >
                      <Autocomplete
                        isClearable
                        type='text'
                        label='产品'
                        name='product'
                        items={productData}
                        value={item.productId}
                        defaultInputValue={item.productId}
                        onSelectionChange={(key) => {
                          const id = JSON.stringify(key);
                          updateItem(item.id!, 'productId', JSON.parse(id));
                        }}
                        className='col-span-4 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        {(product) => (
                          <AutocompleteItem className='' key={product.key}>
                            {product.name}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      <NumberInput
                        type='number'
                        label='数量'
                        name='quantity'
                        minValue={0}
                        hideStepper
                        value={item.quantity}
                        onValueChange={(value) =>
                          updateItem(item.id!, 'quantity', value || 0)
                        }
                        className='col-span-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <NumberInput
                        type='number'
                        label='价格'
                        name='price'
                        minValue={0}
                        hideStepper
                        value={item.price}
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        onValueChange={(value) =>
                          updateItem(item.id!, 'price', value || 0)
                        }
                        className='col-span-2  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <NumberInput
                        className='col-span-2 text-right font-medium text-gray-700'
                        isDisabled
                        hideStepper
                        type='number'
                        name='subtotal'
                        label='小计'
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        value={item.quantity! * item.price!}
                        onValueChange={(value) =>
                          updateItem(item.id!, 'subtotal', value || 0)
                        }
                      />
                      <Button
                        onPress={() => removeRow(item.id!)}
                        className='col-span-1 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                  <Button onPress={addItem}>
                    <Plus size={14} /> 加物品
                  </Button>
                  <div className='flex justify-end'>
                    <div className='flex justify-between text-gray-900 pt-3 border-t'>
                      <span>总数:</span>
                      <span id='total'>${total.toFixed(2)}</span>
                    </div>
                  </div>
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
