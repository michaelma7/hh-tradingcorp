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
    <div>
      <h2>{customer.name}</h2>
      <h4>{customer.location}</h4>
      <div>
        <AddEditCustomerModal edit={true} data={customer} />
        <DeleteForm id={id} action={deleteCustomer} />
      </div>
    </div>
  );
}
