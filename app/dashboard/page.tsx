import {
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/react';
import { getOrdersForDashboard } from '@/actions/orders';
import { getProductsForDashboard } from '@/actions/products';
import { getPurchaseOrdersForDashboard } from '@/actions/purchaseOrders';
import { getCustomersForDashboard } from '@/actions/customers';
import { getManfacturersForDashboard } from '@/actions/manufacturers';
import NewOrderModal from '@/components/NewOrderModal';

import Link from 'next/link';

export default async function Dashboard() {
  const orders = await getOrdersForDashboard();
  const products = await getProductsForDashboard();
  const purchaseOrders = await getPurchaseOrdersForDashboard();
  const customers = await getCustomersForDashboard();
  const manufacturers = await getManfacturersForDashboard();

  return (
    <div className='flex w-full flex-col'>
      <h2>Dashboard</h2>
      <Tabs aria-label='Options'>
        <Tab key='orders' title='Orders'>
          <div>
            <NewOrderModal />
            <Button color='primary' size='md' radius='md'>
              <Link href='/orders'>View All Orders</Link>
            </Button>
            <Table aria-label='Orders Dashboard Table'>
              <TableHeader>
                <TableColumn>Order Name</TableColumn>
                <TableColumn>Customer Name</TableColumn>
                <TableColumn>Total</TableColumn>
                <TableColumn>Delivered?</TableColumn>
              </TableHeader>
              <TableBody emptyContent={'No rows to display'}>
                {orders.map((order) => {
                  <TableRow key={order.key}>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.totalCents * 100}</TableCell>
                    <TableCell>{order.status}</TableCell>
                  </TableRow>;
                })}
              </TableBody>
            </Table>
          </div>
        </Tab>
        <Tab key='purchaseOrders' title='Purchase Orders'>
          <Button color='primary' size='md' radius='md' onPress={openModal}>
            Create New Purchase Order
          </Button>
          <Button color='primary' size='md' radius='md'>
            <Link href='/purchaseOrders'>View All Purchase Orders</Link>
          </Button>
          <Table aria-label='Purchase Orders Dashboard Table'>
            <TableHeader>
              <TableColumn>Id</TableColumn>
              <TableColumn>Order Date</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'No rows to display'}>
              {purchaseOrders.map((purchaseOrder) => {
                <TableRow key={purchaseOrder.key}>
                  <TableCell>{purchaseOrder.id}</TableCell>
                  <TableCell>{purchaseOrder.orderDate}</TableCell>
                  <TableCell>{purchaseOrder.status}</TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </Tab>
        <Tab key='products' title='Products'>
          <Button color='primary' size='md' radius='md' onPress={openModal}>
            Create New Products
          </Button>
          <Button color='primary' size='md' radius='md'>
            <Link href='/products'>View All Products</Link>
          </Button>
          <Table aria-label='Products Dashboard Table'>
            <TableHeader>
              <TableColumn>Product</TableColumn>
              <TableColumn>Quantity</TableColumn>
              <TableColumn>Manufactured By</TableColumn>
              <TableColumn>Last Updated</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'No rows to display'}>
              {products.map((product) => {
                <TableRow key={product.key}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.manufacturedBy}</TableCell>
                  <TableCell>{product.lastUpdated}</TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </Tab>
        <Tab key='customers' title='Customers'>
          <Button color='primary' size='md' radius='md' onPress={openModal}>
            Create New Customer
          </Button>
          <Button color='primary' size='md' radius='md'>
            <Link href='/customers'>View All Customers</Link>
          </Button>
          <Table aria-label='Customer Dashboard Table'>
            <TableHeader>
              <TableColumn>Customer Name</TableColumn>
              <TableColumn>Location</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'No rows to display'}>
              {customers.map((customer) => {
                <TableRow key={customer.key}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.location}</TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </Tab>
        <Tab key='manufacturers' title='Manufacturers'>
          <Button color='primary' size='md' radius='md' onPress={openModal}>
            Create New Manufacturer
          </Button>
          <Button color='primary' size='md' radius='md'>
            <Link href='/Manufacturers'>View All Manufacturers</Link>
          </Button>
          <Table aria-label='Manufacturers Dashboard Table'>
            <TableHeader>
              <TableColumn>Manufacturer Name</TableColumn>
              <TableColumn>Contact</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'No rows to display'}>
              {manufacturers.map((manufacturer) => {
                <TableRow key={manufacturer.key}>
                  <TableCell>{manufacturer.name}</TableCell>
                  <TableCell>{manufacturer.contact}</TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
}
