import { getOrdersForDashboard } from '@/actions/orders';
import { getProductsForDashboard } from '@/actions/products';
import { getPurchaseOrdersForDashboard } from '@/actions/purchaseOrders';
import { getCustomersForDashboard } from '@/actions/customers';
import { getManfacturersForDashboard } from '@/actions/manufacturers';
import { getCurrentUser } from '@/actions/users';
import DashboardTabs from '@/components/DashboardTabs';

export default async function Dashboard() {
  // const user = await getCurrentUser();
  const orders = await getOrdersForDashboard();
  const products = await getProductsForDashboard();
  const purchaseOrders = await getPurchaseOrdersForDashboard();
  const customers = await getCustomersForDashboard();
  const manufacturers = await getManfacturersForDashboard();

  return (
    <div className='flex w-full flex-col'>
      <h2>Dashboard</h2>
      <DashboardTabs
        data={{
          orders: orders,
          products: products,
          purchaseOrders: purchaseOrders,
          customers: customers,
          manufacturers: manufacturers,
        }}
      />
    </div>
  );
}
