import { getAllCustomers } from '@/actions/customers';
import NewCustomerModal from '@/components/NewCustomerModal';
import TableGenerator from '@/components/TableGenerator';

export default async function Orders() {
  const customers = await getAllCustomers();
  return (
    <div>
      <NewCustomerModal />
      <TableGenerator
        data={customers}
        className='bg-white'
        label={'All Customers'}
        link={'customers'}
      />
    </div>
  );
}
