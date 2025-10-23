import { db } from '@/db/db';
import { users, products, manufacturers } from '@/db/schema';
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
      .returning();
    console.log('inserted manufacturers', newManufacturers);
    const newProducts = await db
      .insert(products)
      .values([
        {
          name: 'fuhouan',
          commonName: 'stomach relief',
          manufacturedBy: 'dat',
        },
        {
          name: 'yunanbaiyao',
          commonName: 'bloodstaunching',
          manufacturedBy: 'china',
        },
      ])
      .returning();
    console.log('inserted products', newProducts);
  } catch (err) {
    console.error('failed db seeding', err);
  }
};

seedDb();
