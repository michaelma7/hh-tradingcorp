import { db } from '@/db/db';
import {
  users,
  products,
  manufacturers,
  customers,
  orders,
  purchaseOrders,
} from '@/db/schema';
import bcrypt from 'bcrypt';

const seedDb = async () => {
  try {
    const newUser = await db.query.users.findFirst();
    if (!newUser) {
      console.error('create an account first');
      const pw = await bcrypt.hash('Hhtradingcorp1!', 10);
      const [newAdmin] = await db
        .insert(users)
        .values({ email: 'aznxsyko@gmail.com', password: `${pw}` })
        .returning({ id: users.id });
      console.log('inserted user', newAdmin);
    }
    const newManufacturers = await db
      .insert(manufacturers)
      .values([
        { name: 'dat', contact: 'wechatid:asdfasd' },
        { name: 'china', contact: 'guangzhou' },
      ])
      .returning({ id: manufacturers.id });
    console.log('inserted manufacturers', newManufacturers);
    const newProducts = await db
      .insert(products)
      .values([
        {
          name: 'fuhouan',
          commonName: 'stomach relief',
          manufacturedBy: newManufacturers[1].id,
        },
        {
          name: 'yunanbaiyao',
          commonName: 'bloodstaunching',
          manufacturedBy: newManufacturers[0].id,
        },
      ])
      .returning();
    console.log('inserted products', newProducts);
    const newCustomers = await db
      .insert(customers)
      .values([
        {
          name: 'michael',
          location: 'flushing',
        },
        {
          name: 'yizhou',
          location: 'mucho',
        },
      ])
      .returning({ id: customers.id });
    console.log('inserted customers', newCustomers);
    const newOrders = await db
      .insert(orders)
      .values([
        {
          name: 'test',
          createdById: '1b0f9b35-5657-4398-adfe-78aa57ca6bf1',
          customerId: `${newCustomers[0].id}`,
          totalCents: 0,
          status: false,
        },
        {
          name: 'test2',
          createdById: '1b0f9b35-5657-4398-adfe-78aa57ca6bf1',
          customerId: `${newCustomers[0].id}`,
          totalCents: 1000,
          status: true,
        },
      ])
      .returning();
    console.log('inserted orders', newOrders);
    const newPurchaseOrder = await db
      .insert(purchaseOrders)
      .values([
        {
          orderDate: '2026-2-15',
          status: 'pending',
          shippingInfo: 'n/a',
          shipper: 'china',
        },
        {
          orderDate: '2026-1-13',
          status: 'received',
          shippingInfo: '1zasd23258d890789asdf',
          shipper: 'hk',
        },
      ])
      .returning();
    console.log('inserted purchase orders', newPurchaseOrder);
  } catch (err) {
    console.error('failed db seeding', err);
  }
};

seedDb();
