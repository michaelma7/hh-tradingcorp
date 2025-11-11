import { getOneCustomer } from '@/actions/customers';
import { redirect } from 'next/navigation';

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer] = await getOneCustomer(id);
  if (!customer) redirect('/dashboard/customers');
  // fail statement to redirect to main page

  return (
    <div>
      <h2>{customer.name}</h2>
      <h4>{customer.location}</h4>
    </div>
  );
}
