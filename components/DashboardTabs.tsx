'use client';
import { Button } from '@heroui/react';
import { Tabs, Tab } from '@heroui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/table';
import AddEditOrderModal from '@/components/AddEditOrderModal';
import AddEditPurchaseOrderModal from '@/components/AddEditPurchaseOrderModal';
import AddEditProductModal from '@/components/AddEditProductModal';
import AddEditCustomerModal from '@/components/AddEditCustomerModal';
import AddEditManufacturerModal from '@/components/AddEditManufacturerModal';
import Link from 'next/link';
import { customersData } from '@/actions/customers';
import { purchaseOrderData } from '@/actions/purchaseOrders';
import { manufacturerData } from '@/actions/manufacturers';
import { productData, productsForOrders } from '@/actions/products';
import { orderData } from '@/actions/orders';

interface DashboardData {
  orders: orderData[];
  customers: customersData[];
  manufacturers: manufacturerData[];
  products: productData[];
  purchaseOrders: purchaseOrderData[];
  productData: productsForOrders[];
}
export default function DashboardTabs({ data }: { data: DashboardData }) {
  const orderRows = data.orders.map((order) => {
    return (
      <TableRow key={order.id} className=''>
        <TableCell>{order.name}</TableCell>
        <TableCell>{order.customers.name}</TableCell>
        <TableCell>${order.totalCents / 100}</TableCell>
        <TableCell>{order.status ? 'Yes' : 'No'}</TableCell>
      </TableRow>
    );
  });

  const productRows = data.products.map((product) => {
    return (
      <TableRow key={product.id} className=''>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.quantity}</TableCell>
        {/* <TableCell>{product.manufacturedBy.name}</TableCell> */}
      </TableRow>
    );
  });

  const purchaseOrderRows = data.purchaseOrders.map((purchaseOrder) => {
    return (
      <TableRow key={purchaseOrder.id} className=''>
        <TableCell>{purchaseOrder.id}</TableCell>
        <TableCell>{purchaseOrder.orderDate}</TableCell>
        <TableCell>{purchaseOrder.status}</TableCell>
        <TableCell>{purchaseOrder.shipper}</TableCell>
        <TableCell>{purchaseOrder.shippingInfo}</TableCell>
      </TableRow>
    );
  });

  const customerRows = data.customers.map((customer) => {
    return (
      <TableRow key={customer.id} className=''>
        <TableCell>{customer.name}</TableCell>
        <TableCell>{customer.location}</TableCell>
      </TableRow>
    );
  });

  const manufacturerRows = data.manufacturers.map((manufacturer) => {
    return (
      <TableRow key={manufacturer.id} className=''>
        <TableCell>{manufacturer.name}</TableCell>
        <TableCell>{manufacturer.contact}</TableCell>
      </TableRow>
    );
  });
  return (
    <Tabs aria-label='Options'>
      <Tab key='orders' title='订单'>
        <div>
          <div className='flex gap-2 align-middle p-2'>
            <AddEditOrderModal productData={data.productData} edit={false} />
            <Button color='primary' size='md' radius='md'>
              <Link href='/dashboard/orders'>看所有订单</Link>
            </Button>
          </div>
          <Table aria-label='Orders Dashboard Table' isStriped>
            <TableHeader>
              <TableColumn>订单号</TableColumn>
              <TableColumn>顾客</TableColumn>
              <TableColumn>总数</TableColumn>
              <TableColumn>送到了吗?</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'No rows to display'}>
              {orderRows}
            </TableBody>
          </Table>
        </div>
      </Tab>
      <Tab key='purchaseOrders' title='库存订单'>
        <div className='flex gap-2 align-middle p-2'>
          <AddEditPurchaseOrderModal
            edit={false}
            productData={data.productData}
          />
          <Button color='primary' size='md' radius='md'>
            <Link href='/dashboard/purchaseOrders'>看所有库存订单</Link>
          </Button>
        </div>
        <Table aria-label='Purchase Orders Dashboard Table' isStriped>
          <TableHeader>
            <TableColumn>Id</TableColumn>
            <TableColumn>订单日期</TableColumn>
            <TableColumn>配送状态</TableColumn>
            <TableColumn>发货人</TableColumn>
            <TableColumn>配送信息</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {purchaseOrderRows}
          </TableBody>
        </Table>
      </Tab>
      <Tab key='products' title='产品'>
        <div className='flex gap-2 align-middle p-2'>
          <AddEditProductModal edit={false} />
          <Button color='primary' size='md' radius='md'>
            <Link href='/dashboard/products'>看所有产品</Link>
          </Button>
        </div>

        <Table aria-label='Products Dashboard Table' isStriped>
          <TableHeader>
            <TableColumn>产品名</TableColumn>
            <TableColumn>数量</TableColumn>
            {/* <TableColumn>生产厂家</TableColumn> */}
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {productRows}
          </TableBody>
        </Table>
      </Tab>
      <Tab key='customers' title='顾客'>
        <div className='flex gap-2 align-middle p-2'>
          <AddEditCustomerModal edit={false} />
          <Button color='primary' size='md' radius='md'>
            <Link href='/dashboard/customers'>看所有顾客</Link>
          </Button>
        </div>

        <Table aria-label='Customer Dashboard Table' isStriped>
          <TableHeader>
            <TableColumn>名称</TableColumn>
            <TableColumn>地点</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {customerRows}
          </TableBody>
        </Table>
      </Tab>
      <Tab key='manufacturers' title='生产厂家'>
        <div className='flex gap-2 align-middle p-2'>
          <AddEditManufacturerModal edit={false} />
          <Button color='primary' size='md' radius='md'>
            <Link href='/dashboard/manufacturers'>看所有生产厂家</Link>
          </Button>
        </div>
        <Table aria-label='Manufacturers Dashboard Table' isStriped>
          <TableHeader>
            <TableColumn>名称</TableColumn>
            <TableColumn>联系</TableColumn>
          </TableHeader>
          <TableBody emptyContent={'No rows to display'}>
            {manufacturerRows}
          </TableBody>
        </Table>
      </Tab>
    </Tabs>
  );
}
