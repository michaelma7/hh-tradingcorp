import {
  getOneCustomer,
  deleteCustomer,
  customersData,
} from '@/actions/customers';
import { redirect } from 'next/navigation';
import DeleteForm from '@/components/DeleteForm';
import AddEditCustomerModal from '@/components/AddEditCustomerModal';

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer: customersData | undefined = await getOneCustomer(id);
  if (!customer) redirect('/dashboard/customers');

  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='flex gap-2'>
        <AddEditCustomerModal edit={true} data={customer} />
        <DeleteForm id={id} action={deleteCustomer} />
      </div>
      <span>名称: {customer.name}</span>
      <span>地点: {customer.location}</span>
    </div>
  );
}
