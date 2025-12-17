'use server';
import { db } from '@/db/db';
import { eq, asc, and, sql } from 'drizzle-orm';
import {
  orders,
  orderItems,
  products,
  customers,
  users,
  inventoryTransactions,
} from '@/db/schema';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export interface orderData {
  name: string;
  createdBy: string;
  customer: string;
  totalCents: number;
  status: boolean;
}

export type orderItemData = {
  orderId: string;
  productId: string;
  quantity?: number;
  priceCents?: number;
};

export type orderItemChanges = {
  addOrUpdate: orderItemData[];
  remove: orderItemData[];
};

const orderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string(),
  quantity: z.coerce.number().optional(),
  priceCents: z.coerce.number().optional(),
});

const orderItemsSchema = z.array(orderItemSchema);

const orderSchema = z.object({
  name: z.string().trim(),
  createdBy: z.string(),
  customer: z.string(),
  totalCents: z.coerce.number(),
  status: z.coerce.boolean(),
});

const updateSchema = orderSchema.extend({
  id: z.string().uuid(),
});

export async function createOrder(prevState: any, formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      createdBy: formData.get('createdBy'),
      customer: formData.get('customer'),
      totalCents: Number(formData.get('totalCents')),
      status: JSON.parse(formData.get('status')),
    };
    const order = orderSchema.parse(data);

    await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ userId: users.id })
        .from(users)
        .where(eq(users.email, order.createdBy));
      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.name, order.customer));
      const newOrder: typeof orders.$inferInsert = {
        name: order.name,
        createdById: user.userId,
        customerId: customer.id,
        status: order.status,
        totalCents: order.totalCents,
      };

      const [newId] = await tx
        .insert(orders)
        .values(newOrder)
        .onConflictDoNothing()
        .returning({ id: orders.id });

      // order line item data
      const itemData = {
        productName: formData.getAll('productName'),
        quantity: formData.getAll('quantity'),
        price: formData.getAll('price'),
      };
      // check for items
      if (itemData.productName[0] === '') return { newId };
      else {
        // switch product names to product ids
        const items = [];
        for (let i = 0; i < itemData.productName.length; i++) {
          const [id] = await tx
            .select({ id: products.id })
            .from(products)
            .where(eq(products.name, itemData.productName[i]));
          items.push({
            orderId: newId.id,
            productId: id.id,
            quantity: itemData.quantity[i],
            priceCents: Number(itemData.price[i]) * 100,
          });
        }
        const verifiedItems = orderItemsSchema.parse(items);

        await tx.insert(orderItems).values(verifiedItems).onConflictDoNothing();
        for (const item of verifiedItems) {
          const change = {
            productId: item.productId,
            transaction: newOrder.status ? 'sale' : 'ordered',
            quantity: item.quantity!,
            referenceId: item.orderId,
          };
          await tx
            .insert(inventoryTransactions)
            .values(change)
            .onConflictDoNothing();
          if (newOrder.status) {
            await tx
              .update(products)
              .set({
                quantity: sql`${products.quantity} - ${change.quantity}`,
              })
              .where(eq(products.id, `${change.productId}`));
          } else {
            await tx
              .update(products)
              .set({ reserved: sql`${products.reserved} + ${change.quantity}` })
              .where(eq(products.id, `${change.productId}`));
          }
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Order insertion error: ${err}`);
    throw err;
  }
  redirect('/dashboard');
}

export async function updateOrder(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get('id'),
      name: formData.get('name'),
      createdBy: formData.get('createdBy'),
      customer: formData.get('customer'),
      totalCents: Number(formData.get('totalCents')),
      status: JSON.parse(formData.get('status')),
    };
    const order = updateSchema.parse(data);
    const updatedOrder: typeof orders.$inferInsert = {
      name: order.name,
      createdById: order.createdBy,
      customerId: order.customer,
      status: order.status,
      totalCents: order.totalCents,
    };
    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set(updatedOrder)
        .where(eq(orders.id, `${order.id}`))
        .returning({ id: orders.id });
      if (updatedOrder.status) {
        const items = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, `${order.id}`));
        await tx
          .update(inventoryTransactions)
          .set({ transaction: 'sale' })
          .where(eq(inventoryTransactions.referenceId, order.id));
        for (const item of items) {
          const deliveredItem = {
            productId: item.productId,
            transaction: 'sale',
            quantity: item.quantity!,
            referenceId: updatedOrder.id,
          };
          await tx
            .update(products)
            .set({
              quantity: sql`${products.quantity} - ${deliveredItem.quantity}`,
              reserved: sql`${products.reserved} - ${deliveredItem.quantity}`,
            })
            .where(eq(products.id, `${deliveredItem.productId}`));
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Order update Error ${err}`);
    throw err;
  }
}

export async function modifyOrderItems(data: FormData) {
  try {
    // transform formdata to zod schema
    const removals = JSON.parse(data.get('remove'));
    const changes = JSON.parse(data.get('changes'));
    const id = data.get('id');
    const addOrUpdate = orderItemsSchema.parse(changes);
    const remove = orderItemsSchema.parse(removals);
    return await db.transaction(async (tx) => {
      // insert/update each new item
      if (addOrUpdate.length) {
        for (let i = 0; i < addOrUpdate.length; i++) {
          await tx
            .insert(orderItems)
            .values(addOrUpdate[i])
            .onConflictDoUpdate({
              target: [orderItems.id, orderItems.productId],
              set: { ...addOrUpdate[i] },
            });
        }
      }
      // delete
      if (remove.length) {
        for (let i = 0; i < remove.length; i++)
          await tx
            .delete(orderItems)
            .where(
              and(
                eq(orderItems.orderId, `${id}`),
                eq(orderItems.productId, `${remove[i].productId}`)
              )
            );
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error('OrderItems update error', err);
    throw err;
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(orders).where(eq(orders.id, `${orderId}`));
      await tx.delete(orderItems).where(eq(orderItems.orderId, `${orderId}`));
      return;
    });
  } catch (err) {
    console.error(`Order delete Error ${err}`);
    throw err;
  }
}

export const getOrdersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.orders.findMany({
      orderBy: [asc(orders.createdAt)],
      limit: 25,
      columns: { lastUpdated: false, createdAt: false, createdById: false },
    });
    return data ?? [];
  },
  [],
  {
    tags: ['orders'],
    revalidate: 120,
  }
);

export async function getOneOrder(orderId: string) {
  try {
    return await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        ordersToOrderItems: true,
        customers: true,
      },
    });
  } catch (err) {
    console.error(`Look up failed ${err}`);
    throw err;
  }
}

export async function getAllOrders() {
  try {
    return await db
      .select({
        Name: orders.name,
        Updated: orders.lastUpdated,
        Customer: customers.name,
        Delivered: orders.status,
        Total: orders.totalCents,
        id: orders.id,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id));
  } catch (err) {
    console.error(`Order data fetch error ${err}`);
    throw err;
  }
}
