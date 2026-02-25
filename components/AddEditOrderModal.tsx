'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
import { useState } from 'react';
import { CirclePlus, Plus, Trash2 } from 'lucide-react';
import Submit from './Submit';
import { useFormAction } from '@/utils/useFormAction';
import { useProvider } from '@/app/CurrentUserProvider';

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
  const formAction = (
    prevState: OrderFormState | OrderItemFormState,
    formData: FormData,
  ): Promise<OrderFormState | OrderItemFormState> => {
    if (edit) {
      for (const item of items) formData.append('productId', item.productId);
      formData.append('id', orderData!.id);
      formData.append('totalCents', JSON.stringify(total * 100));
      formData.set('status', JSON.stringify(deliveryStatus));
      modifyOrderItems(prevState, formData);
      return updateOrder(prevState, formData);
    } else {
      for (const item of items) formData.append('productId', item.productId);
      formData.append('totalCents', JSON.stringify(total * 100));
      formData.set('status', JSON.stringify(deliveryStatus));
      return createOrder(prevState, formData);
    }
  };
  const [formState, submit, pending] = useFormAction(formAction, initState);
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
          Edit <CirclePlus size={16} />
        </Button>
      ) : (
        <Button
          color='primary'
          size='sm'
          radius='md'
          disableAnimation
          onPress={onOpen}
          className='flex'
        >
          Create New Order <CirclePlus size={16} />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className=''>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                New Order
              </ModalHeader>
              <ModalBody>
                <form
                  action={submit}
                  className='border border-default-100 shadow-lg rounded-md p-3 flex flex-col gap-2'
                >
                  <Input
                    type='text'
                    name='name'
                    label='Order Name'
                    defaultValue={edit ? orderData!.name : ''}
                    isRequired
                  />
                  <Input
                    type='text'
                    name='customer'
                    label='Customer'
                    defaultValue={edit ? orderData!.customer : ''}
                    isRequired
                  />
                  <Checkbox
                    aria-label='Order Delivered?'
                    name='status'
                    size='sm'
                    radius='full'
                    isSelected={deliveryStatus}
                    onValueChange={setDeliveryStatus}
                  >
                    Delivered?
                  </Checkbox>
                  <Input
                    type='text'
                    name='createdBy'
                    label='Username'
                    isReadOnly
                    defaultValue={currentUser}
                    className='col-span-5 px-3 py-2 border border-gray-300 rounded-md'
                  />
                  <div className='grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm'>
                    <div className='col-span-5'>Product Name</div>
                    <div className='col-span-2'>Quantity</div>
                    <div className='col-span-2'>Unit Price</div>
                    <div className='col-span-2'>Subtotal</div>
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
                        label='Product'
                        labelPlacement='outside-left'
                        name='product'
                        items={productData}
                        value={item.productId}
                        defaultInputValue={item.productId}
                        onSelectionChange={(key) => {
                          const id = JSON.stringify(key);
                          updateItem(item.id!, 'productId', JSON.parse(id));
                        }}
                        className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        {(product) => (
                          <AutocompleteItem className='' key={product.key}>
                            {product.name}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      <NumberInput
                        type='number'
                        label='Quantity'
                        name='quantity'
                        minValue={0}
                        hideStepper
                        value={item.quantity}
                        onValueChange={(value) =>
                          updateItem(item.id!, 'quantity', value || 0)
                        }
                        className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <NumberInput
                        type='number'
                        label='Price'
                        name='price'
                        minValue={0}
                        hideStepper
                        value={item.price}
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        onValueChange={(value) =>
                          updateItem(item.id!, 'price', value || 0)
                        }
                        className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <NumberInput
                        className='col-span-2 px-3 py-2 text-right font-medium text-gray-700'
                        isDisabled
                        type='number'
                        name='subtotal'
                        label='Subtotal'
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        value={item.quantity! * item.price!}
                        onValueChange={(value) =>
                          updateItem(item.id!, 'subtotal', value || 0)
                        }
                      />
                      <Button
                        onPress={() => removeRow(item.id!)}
                        className='col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                  <Button onPress={addItem}>
                    <Plus size={14} /> Add Item
                  </Button>
                  <div className='flex justify-end'>
                    <div className='flex justify-between text-gray-900 pt-3 border-t'>
                      <span>Total:</span>
                      <span id='total'>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Submit
                    label={'Submit'}
                    onPress={onClose}
                    disabled={pending}
                  />
                </form>
                {formState?.message && <p>{formState.message}</p>}
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
    </div>
  );
}
