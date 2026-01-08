'use client';
import { Button } from '@heroui/button';
import { Tabs, Tab } from '@heroui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/table';
import NewOrderModal from '@/components/NewOrderModal';
import NewPurchaseOrderModal from '@/components/NewPurchaseOrderModal';
import AddEditProductModal from '@/components/AddEditProductModal';
import AddEditCustomerModal from '@/components/AddEditCustomerModal';
import AddEditManufacturerModal from '@/components/AddEditManufacturerModal';
import Link from 'next/link';

export default function DashboardTabs({ data }: { data: any }) {
  const orderRows = data.orders.map((order) => {
    return (
      <TableRow key={order.id} className='bg-white'>
        <TableCell>{order.name}</TableCell>
        <TableCell>{order.customerId}</TableCell>
        <TableCell>${order.totalCents / 100}</TableCell>
        <TableCell>{order.status}</TableCell>
      </TableRow>
    );
  });

  const productRows = data.products.map((product) => {
    return (
      <TableRow key={product.id} className='bg-white'>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.quantity}</TableCell>
        <TableCell>{product.manufacturedBy}</TableCell>
        <TableCell>{product.lastUpdated}</TableCell>
      </TableRow>
    );
  });

  const purchaseOrderRows = data.purchaseOrders.map((purchaseOrder) => {
    return (
      <TableRow key={purchaseOrder.id} className='bg-white'>
        <TableCell>{purchaseOrder.id}</TableCell>
        <TableCell>{purchaseOrder.orderDate}</TableCell>
        <TableCell>{purchaseOrder.status}</TableCell>
      </TableRow>
    );
  });

  const customerRows = data.customers.map((customer) => {
    return (
      <TableRow key={customer.id} className='bg-white'>
        <TableCell>{customer.name}</TableCell>
        <TableCell>{customer.location}</TableCell>
      </TableRow>
    );
  });

  const manufacturerRows = data.manufacturers.map((manufacturer) => {
    return (
      <TableRow key={manufacturer.id} className='bg-white'>
        <TableCell>{manufacturer.name}</TableCell>
        <TableCell>{manufacturer.contact}</TableCell>
      </TableRow>
    );
  });
  return (
    <Tabs aria-label='Options'>
      <Tab key='orders' title='Orders'>
        <div>
          <NewOrderModal productData={data.productData} />
          <Button color='primary' size='md' radius='md'>
            <Link href='/dashboard/orders'>View All Orders</Link>
          </Button>
          <Table aria-label='Orders Dashboard Table'>
            <TableHeader>
              <TableColumn>Order Name</TableColumn>
              <TableColumn>Customer Name</TableColumn>
              <TableColumn>Total</TableColumn>
              <TableColumn>Delivered?</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'No rows to display'}>
              {orderRows}
            </TableBody>
          </Table>
        </div>
      </Tab>
      <Tab key='purchaseOrders' title='Purchase Orders'>
        <NewPurchaseOrderModal />
        <Button color='primary' size='md' radius='md'>
          <Link href='/dashboard/purchaseOrders'>View All Purchase Orders</Link>
        </Button>
        <Table aria-label='Purchase Orders Dashboard Table'>
          <TableHeader>
            <TableColumn>Id</TableColumn>
            <TableColumn>Order Date</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {purchaseOrderRows}
          </TableBody>
        </Table>
      </Tab>
      <Tab key='products' title='Products'>
        <AddEditProductModal edit={false} />
        <Button color='primary' size='md' radius='md'>
          <Link href='/dashboard/products'>View All Products</Link>
        </Button>
        <Table aria-label='Products Dashboard Table'>
          <TableHeader>
            <TableColumn>Product</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Manufactured By</TableColumn>
            <TableColumn>Last Updated</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {productRows}
          </TableBody>
        </Table>
      </Tab>
      <Tab key='customers' title='Customers'>
        <AddEditCustomerModal edit={false} />
        <Button color='primary' size='md' radius='md'>
          <Link href='/dashboard/customers'>View All Customers</Link>
        </Button>
        <Table aria-label='Customer Dashboard Table'>
          <TableHeader>
            <TableColumn>Customer Name</TableColumn>
            <TableColumn>Location</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {customerRows}
          </TableBody>
        </Table>
      </Tab>
      <Tab key='manufacturers' title='Manufacturers'>
        <AddEditManufacturerModal edit={false} />
        <Button color='primary' size='md' radius='md'>
          <Link href='/dashboard/manufacturers'>View All Manufacturers</Link>
        </Button>
        <Table aria-label='Manufacturers Dashboard Table'>
          <TableHeader>
            <TableColumn>Manufacturer Name</TableColumn>
            <TableColumn>Contact</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {manufacturerRows}
          </TableBody>
        </Table>
      </Tab>
    </Tabs>
  );
}
