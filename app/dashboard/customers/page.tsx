import { getAllCustomers } from '@/actions/customers';
import AddEditCustomerModal from '@/components/AddEditCustomerModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const customers = await getAllCustomers();
  return (
    <div>
      <AddEditCustomerModal edit={false} />
      <TableGenerator
        data={customers}
        className='bg-white'
        label={'All Customers'}
        link={'customers'}
      />
    </div>
  );
}
