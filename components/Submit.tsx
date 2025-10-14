'use client';

import { Button } from '@heroui/react';
import { useFormStatus } from 'react-dom';

const Submit = ({ label, ...btnProps }) => {
  const { pending } = useFormStatus();

  return (
    <Button {...btnProps} type='submit' isLoading={pending}>
      {label}
    </Button>
  );
};

export default Submit;
