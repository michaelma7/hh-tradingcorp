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

export const manufacturers = sqliteTable(
  'manufacturers',
  {
    id: id(),
    name: text('name').notNull(),
    contact: text('contact'),
  },
  (table) => [unique().on(table.name)]
);

export const manufacturerRelations = relations(manufacturers, ({ many }) => ({
  products: many(products),
}));

export const products = sqliteTable('products', {
  id: id(),
  name: text('name').notNull(),
  commonName: text('common_name'),
  manufacturedBy: text('manufactured_by').notNull(),
  imageLink: text('link'),
  quantity: integer('quantity'),
  reserved: integer('reserved'),
  lastUpdated: date('last_updated'),
});

export const productRelations = relations(products, ({ many, one }) => ({
  orderItems: many(orderItems),
  purchaseOrderItems: many(purchaseOrderItems),
  transactions: many(inventoryTransactions),
  manufacturedBy: one(manufacturers, {
    references: [manufacturers.name],
    fields: [products.manufacturedBy],
  }),
}));

export const orders = sqliteTable(
  'orders',
  {
    id: id(),
    createdAt: createdAt(),
    updatedAt: date('updated_at'),
    name: text('name').notNull(),
    createdById: text('created_by_id').notNull(),
    customerId: text('customer_id').references(() => customers.id),
    totalCents: integer('total_cents').notNull(),
    status: boolean('delivered').default(false).notNull(),
    deliveredDate: date('delivery_date'),
  },
  (table) => [unique().on(table.createdById, table.name)]
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  ordersToOrderItems: many(orderItems),
  customers: one(customers, {
    references: [customers.id],
    fields: [orders.customerId],
  }),
  createdBy: one(users, {
    references: [users.id],
    fields: [orders.createdById],
  }),
}));

export const orderItems = sqliteTable('order_items', {
  id: id(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity'),
  priceCents: integer('price_cents'),
  subtotal: integer('subtotal'),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: id(),
  createdAt: createdAt(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  transaction: text('transaction', {
    enum: ['sale', 'return', 'received'],
  }).notNull(),
  quantity: integer('quantity'),
  referenceId: text('reference_id'),
});

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    inventory: one(products, {
      fields: [inventoryTransactions.productId],
      references: [products.id],
    }),
  })
);

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: id(),
  orderDate: date('order_date').notNull(),
  status: text('status', {
    enum: ['received', 'shipped', 'pending'],
  })
    .default('pending')
    .notNull(),
});

export const purchaseOrderRelations = relations(purchaseOrders, ({ many }) => ({
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: id(),
  purchaseOrderId: text('purchase_order_id')
    .notNull()
    .references(() => purchaseOrders.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity'),
  priceCents: integer('price_cents'),
  expirationDate: date('expiration_date'),
});

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    product: one(products, {
      fields: [purchaseOrderItems.productId],
      references: [products.id],
    }),
  })
);
