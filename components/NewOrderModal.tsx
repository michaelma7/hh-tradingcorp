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
  Switch,
  NumberInput,
} from '@heroui/react';
import { createOrder } from '@/actions/orders';
import { useActionState, useState } from 'react';
import { CirclePlus, Plus, Trash2 } from 'lucide-react';
import { userFormState } from './SignupForm';

export default function NewOrderModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initState = { message: null };
  const [formState, submit] = useActionState<userFormState>(
    createOrder,
    initState
  );

  const [items, setItems] = useState([
    { id: 1, product: '', quantity: 0, price: 0, subtotal: 0 },
  ]);
  const addItem = () => {
    const newId = items.length + 1;
    setItems([
      ...items,
      { id: newId, product: '', quantity: 0, price: 0, subtotal: 0 },
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
  const total = items.reduce(
    (acc, curr) => acc + curr.quantity * curr.price,
    0
  );

  return (
    <>
      <Button color='primary' size='md' radius='md' onPress={onOpen}>
        Create New Order <CirclePlus size={16} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                New Order
              </ModalHeader>
              <ModalBody>
                <form>
                  <Input type='text' name='orderName' label='Order Name' />
                  <Input type='text' name='customer' label='Customer' />
                  <Switch aria-label='Order Delivered?' name='status' size='md'>
                    Delivered?
                  </Switch>
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
                        label='Price'
                        name='price'
                        minValue={0}
                        hideStepper
                        value={item.price}
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        onValueChange={(value) =>
                          updateItem(item.id, 'price', value || 0)
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
                        value={item.quantity * item.price}
                        onValueChange={(value) =>
                          updateItem(item.id, 'subtotal', value || 0)
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
                </form>
                {formState?.message && <p>{formState.message}</p>}
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={submit}>
                  Submit
                </Button>
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
