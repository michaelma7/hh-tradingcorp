import { useActionState } from 'react';

type FormAction<S> = (prevState: S, formData: FormData) => Promise<S>;

export function useFormAction<S>(
  action: FormAction<S>,
  initialState: Awaited<S>,
  permalink?: string,
) {
  return useActionState(
    action as unknown as (state: S) => Promise<S>,
    initialState,
    permalink,
  );
}
