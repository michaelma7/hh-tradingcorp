'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Button,
  DatePicker,
  NumberInput,
  RadioGroup,
  Radio,
  Autocomplete,
  AutocompleteItem,
  Input,
} from '@heroui/react';
import Submit from './Submit';
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  modifyPurchaseOrderItems,
  purchaseOrderData,
  purchaseOrderItem,
  PurchaseOrderItemFormState,
  PurchaseOrderFormState,
} from '@/actions/purchaseOrders';
import { productsForOrders } from '@/actions/products';
import { useState, useActionState } from 'react';
import { CirclePlus, Plus, Trash2 } from 'lucide-react';
import { parseDate } from '@internationalized/date';

export default function AddEditPurchaseOrderModal({
  edit,
  orderData,
  lineItems,
  productData,
}: {
  edit: boolean;
  orderData?: purchaseOrderData;
  lineItems?: purchaseOrderItem[];
  productData: productsForOrders[];
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const formAction = async (
    prevState: PurchaseOrderItemFormState | PurchaseOrderFormState,
    formData: FormData,
  ): Promise<PurchaseOrderFormState | PurchaseOrderItemFormState> => {
    if (edit) {
      for (const item of items) formData.append('productId', item.productId);
      formData.append('id', orderData!.id);
      await modifyPurchaseOrderItems(prevState, formData);
      return await updatePurchaseOrder(prevState, formData);
    } else {
      for (const item of items) formData.append('productId', item.productId);
      return await createPurchaseOrder(prevState, formData);
    }
  };
  const [formState, submit, pending] = useActionState(formAction, initState);

  const initItems = edit
    ? lineItems
    : [
        {
          id: '1',
          productId: '',
          quantity: 0,
          price: 0,
          expirationDate: '',
        },
      ];
  const [items, setItems] = useState(initItems!);
  const addItem = () => {
    const newId = items.length + 1;
    setItems([
      ...items,
      {
        id: newId.toString(),
        productId: '',
        quantity: 0,
        price: 0,
        expirationDate: '',
      },
    ]);
  };
  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };
  const total = items.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0,
  );

  return (
    <>
      {edit ? (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          Edit: 编辑 <CirclePlus size={16} />
        </Button>
      ) : (
        <Button color='primary' size='md' radius='md' onPress={onOpen}>
          新库存订单 <CirclePlus size={16} />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='3xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col'>
                {edit ? '编辑库存订单' : '新库存订单'}
              </ModalHeader>
              <ModalBody>
                <form action={submit} className='flex flex-col gap-3'>
                  <DatePicker
                    label='订单日期'
                    isRequired
                    name='orderDate'
                    defaultValue={edit ? parseDate(orderData!.orderDate) : null}
                    selectorButtonPlacement='start'
                    className='w-1/2'
                  />
                  <RadioGroup
                    label='配送状态'
                    defaultValue={edit ? orderData?.status : 'pending'}
                    name='status'
                  >
                    <Radio value='pending'>待办的</Radio>
                    <Radio value='shipped'>已发货</Radio>
                    <Radio value='received'>已收到</Radio>
                  </RadioGroup>
                  <Input
                    label='发货人'
                    name='shipper'
                    defaultValue={edit ? orderData?.shipper : ''}
                    className='w-1/2'
                  />
                  <Input
                    label='配送信息'
                    name='shippingInfo'
                    defaultValue={edit ? orderData?.shippingInfo : ''}
                    className='w-1/2'
                  />

                  <div className='grid grid-cols-13 gap-3 font-semibold text-gray-700 text-sm'>
                    <div className='col-span-4'>产品名称</div>
                    <div className='col-span-2'>数量</div>
                    <div className='col-span-2'>价格</div>
                    <div className='col-span-3'>失效日期</div>
                    <div className='col-span-1'></div>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className='grid grid-cols-13 gap-3 items-center'
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
                          updateItem(item.id!, 'productId', id);
                        }}
                        className='col-span-4 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                      >
                        {(product) => (
                          <AutocompleteItem key={product.key}>
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
                        className='col-span-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
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
                        className='col-span-2  border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                      />
                      <DatePicker
                        label='失效日期'
                        name='expirationDate'
                        isRequired
                        value={
                          item.expirationDate
                            ? parseDate(item.expirationDate)
                            : null
                        }
                        onChange={(value) =>
                          updateItem(
                            item.id!,
                            'expirationDate',
                            value!.toString(),
                          )
                        }
                        selectorButtonPlacement='start'
                        className='col-span-3'
                      />
                      <Button
                        onPress={() => removeRow(item.id!)}
                        className='col-span-1 p-1 text-red-600 hover:bg-red-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
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
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
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
    </>
  );
}
