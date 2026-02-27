'use client';

import { Button } from '@heroui/react';
import { useFormStatus } from 'react-dom';

const Submit = ({
  label,
  disabled,
  ...btnProps
}: {
  label: string;
  disabled?: boolean;
}) => {
  const { pending } = useFormStatus();

  return (
    <Button {...btnProps} disabled={disabled} type='submit' isLoading={pending}>
      {label}
    </Button>
  );
};

export default Submit;
