'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Input,
  DatePicker,
  NumberInput,
  RadioGroup,
  Radio,
} from '@heroui/react';
import { createPurchaseOrder } from '@/actions/purchaseOrders';
import { useActionState, useState } from 'react';
import { CirclePlus, Plus, Trash2 } from 'lucide-react';

export default function NewOrderModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const [formState, submit, pending] = useActionState(
    createPurchaseOrder,
    initState
  );

  const [items, setItems] = useState([
    { id: 1, product: '', quantity: 0, cost: 0, expirationDate: '' },
  ]);
  const addItem = () => {
    const newId = items.length + 1;
    setItems([
      ...items,
      { id: newId, product: '', quantity: 0, cost: 0, expirationDate: '' },
    ]);
  };
  const removeRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };
  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };
  const total = items.reduce((acc, curr) => acc + curr.quantity * curr.cost, 0);

  return (
    <>
      <Button color='primary' size='md' radius='md' onPress={onOpen}>
        Create New Purchase Order <CirclePlus size={16} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                New Purchase Order
              </ModalHeader>
              <ModalBody>
                <form action={submit}>
                  <DatePicker label='Order Date' isRequired name='orderDate' />
                  <RadioGroup
                    label='Delivery Status'
                    defaultValue='pending'
                    name='status'
                  >
                    <Radio value='pending'>Pending</Radio>
                    <Radio value='shipped'>Shipped</Radio>
                    <Radio value='received'>Received</Radio>
                  </RadioGroup>
                  <div className='grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm'>
                    <div className='col-span-5'>Product Name</div>
                    <div className='col-span-2'>Quantity</div>
                    <div className='col-span-2'>Unit Price</div>
                    <div className='col-span-2'>Expiration Date</div>
                    <div className='col-span-1'></div>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className='grid grid-cols-12 gap-4 items-center'
                    >
                      <Input
                        isClearable
                        type='text'
                        label='Product'
                        value={item.product}
                        onChange={(e) =>
                          updateItem(item.id, 'product', e.target.value)
                        }
                        className='col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <NumberInput
                        type='number'
                        label='Quantity'
                        name='quantity'
                        minValue={0}
                        hideStepper
                        value={item.quantity}
                        onValueChange={(value) =>
                          updateItem(item.id, 'quantity', value || 0)
                        }
                        className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <NumberInput
                        type='number'
                        label='Cost'
                        name='cost'
                        minValue={0}
                        hideStepper
                        value={item.cost}
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        onValueChange={(value) =>
                          updateItem(item.id, 'cost', value || 0)
                        }
                        className='col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <DatePicker
                        label='Expiration Date'
                        name='expirationDate'
                        isRequired
                        onChange={(value) =>
                          updateItem(
                            item.id,
                            'expirationDate',
                            value!.toString()
                          )
                        }
                      />
                      <Button
                        onPress={() => removeRow(item.id)}
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
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button color='primary' disabled={pending}>
                    Submit
                  </Button>
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
    </>
  );
}
