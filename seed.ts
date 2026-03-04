import { db } from '@/db/db';
import { users, products, manufacturers, customers } from '@/db/schema';
import bcrypt from 'bcrypt';

const seedDb = async () => {
  try {
    const newUser = await db.query.users.findFirst();
    if (!newUser) {
      console.error('create an account first');
      const pw = await bcrypt.hash('Hhtradingcorp1!', 10);
      const newAdmin = await db
        .insert(users)
        .values({ email: 'aznxsyko@gmail.com', password: `${pw}` })
        .returning();
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
          location: 'lul',
        },
        {
          name: 'yizhou',
          location: 'mucho',
        },
      ])
      .returning();
    console.log('inserted customers', newCustomers);
  } catch (err) {
    console.error('failed db seeding', err);
  }
};

seedDb();
