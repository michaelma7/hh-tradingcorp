import { productData } from '@/actions/products';
import { orderData, orderItemData } from '@/actions/orders';
import { purchaseOrderData } from '@/actions/purchaseOrders';
import { customersData } from '@/actions/customers';
import { manufacturerData } from '@/actions/manufacturers';
import DisplayRow from './DisplayRow';

interface paramProps {
  data:
    | productData
    | orderData
    | purchaseOrderData
    | customersData
    | manufacturerData;
  className?: string;
  id: string;
  type: string;
}

export default function DisplayOneItem({
  data,
  className,
  id,
  type,
}: paramProps) {
  const getTitle = () => {
    switch (type) {
      case 'order':
        return `Order #${id}`;
      case 'purchaseOrder':
        return `PO #${id}`;
      default:
        return data.name;
    }
  };

  const dataFieldRows = Object.entries(data).map(([key, value]) => (
    <DisplayRow key={key} label={key} value={value} />
  ));

  return (
    <div className={`border rounded-lg p-6 bg-white shadow-sm ${className}`}>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold text-gray-900'>{getTitle()}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium`}>
          {type.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>
      <div>{dataFieldRows}</div>
    </div>
  );
}
