import { randomUUID } from 'crypto';
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

const id = () =>
  text('id')
    .primaryKey()
    .$default(() => randomUUID());

const createdAt = () =>
  text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

const date = (name: string) => text(name);

const boolean = (field: string) => integer(field, { mode: 'boolean' });

export const users = sqliteTable('users', {
  id: id(),
  createdAt: createdAt(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const customers = sqliteTable('customers', {
  id: id(),
  createdAt: createdAt(),
  name: text('name').notNull(),
  location: text('location'),
});

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const manufacturer = sqliteTable(
  'manufacturer',
  {
    id: id(),
    name: text('name').notNull(),
    streetNumber: integer('streetNumber'),
    street: text('street'),
    zip: integer('zip'),
    bldg: text('bldg'),
  },
  (table) => [unique().on(table.name)]
);

export const manufacturerRelations = relations(manufacturer, ({ many }) => ({
  products: many(products),
}));

export const products = sqliteTable('products', {
  id: id(),
  name: text('name').notNull(),
  commonName: text('commonName'),
  manufacturedBy: text('manufacturedBy').notNull(),
  imageLink: text('link'),
});

export const productRelations = relations(products, ({ many, one }) => ({
  ordersToProducts: many(ordersToProducts),
  manufacturedBy: one(manufacturer, {
    references: [manufacturer.name],
    fields: [products.manufacturedBy],
  }),
}));

export const orders = sqliteTable(
  'orders',
  {
    id: id(),
    createdAt: createdAt(),
    name: text('name').notNull(),
    createdById: text('createdById').notNull(),
    customer: text('customer'),
    products: text('products'),
    status: boolean('delivered').default(false).notNull(),
    deliveredDate: date('delivery date'),
  },
  (table) => [unique().on(table.createdById, table.name)]
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  ordersToProducts: many(ordersToProducts),
  customers: one(customers, {
    references: [customers.name],
    fields: [orders.customer],
  }),
  createdBy: one(users, {
    references: [users.id],
    fields: [orders.createdById],
  }),
}));

export const ordersToProducts = sqliteTable(
  'orders_to_products',
  {
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
  }
  // (table) => [primaryKey({ columns: [table.orderId, table.productId] })]
);

export const ordersToProductsRelations = relations(
  ordersToProducts,
  ({ one }) => ({
    order: one(orders, {
      fields: [ordersToProducts.orderId],
      references: [orders.id],
    }),
    product: one(products, {
      fields: [ordersToProducts.productId],
      references: [products.id],
    }),
  })
);
