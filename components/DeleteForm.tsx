'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from '@heroui/react';
import { Trash2 } from 'lucide-react';

export default function DeleteForm({ id, action }: { id: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const submit = () => {
    action(id);
  };
  return (
    <div>
      <Button
        color='warning'
        size='md'
        radius='md'
        onPress={onOpen}
        disableAnimation
        className='flex'
      >
        Delete
        <Trash2 size={18} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='bg-white'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Delete Item?
              </ModalHeader>
              <ModalBody>Are you sure you want to delete this item?</ModalBody>
              <ModalFooter>
                <Button color='primary' variant='light' onPress={submit}>
                  Yes
                </Button>
                <Button color='danger' variant='light' onPress={onClose}>
                  No, Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
