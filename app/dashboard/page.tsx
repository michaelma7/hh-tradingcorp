import { getOrdersForDashboard } from '@/actions/orders';
import {
  getProductsForDashboard,
  getProductsforOrders,
} from '@/actions/products';
import { getPurchaseOrdersForDashboard } from '@/actions/purchaseOrders';
import { getCustomersForDashboard } from '@/actions/customers';
import { getManfacturersForDashboard } from '@/actions/manufacturers';
import DashboardTabs from '@/components/DashboardTabs';

export default async function Dashboard() {
  const orders = await getOrdersForDashboard();
  const products = await getProductsForDashboard();
  const purchaseOrders = await getPurchaseOrdersForDashboard();
  const customers = await getCustomersForDashboard();
  const manufacturers = await getManfacturersForDashboard();
  const productData = await getProductsforOrders();
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
          productData: productData,
        }}
      />
    </div>
  );
}
