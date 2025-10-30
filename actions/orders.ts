'use server';
import { db } from '@/db/db';
import { eq, asc, and } from 'drizzle-orm';
import { orders, orderItems } from '@/db/schema';
import { updateInventory } from './products';
import { z } from 'zod';
import { unstable_cache } from 'next/cache';

export interface orderData {
  name: string;
  createdById: string;
  customerId?: string;
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
  productId: z.string().uuid(),
  quantity: z.number().optional(),
  priceCents: z.number().optional(),
});

const orderItemsSchema = z.array(orderItemSchema);

const orderSchema = z.object({
  name: z.string().trim(),
  createdById: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  totalCents: z.number(),
  status: z.boolean(),
  items: orderItemsSchema,
});

const updateSchema = orderSchema.extend({
  id: z.string().uuid(),
});

export async function createOrder(data: FormData) {
  try {
    const order = orderSchema.parse({
      name: data.get('name'),
      createdById: data.get('createdBy'),
      customerId: data.get('customer'),
      totalCents: data.get('total'),
      status: data.get('status'),
      items: data.get('items'),
    });
    return await db.transaction(async (tx) => {
      const newOrder: typeof orders.$inferInsert = {
        name: order.name,
        createdById: order.createdById,
        customerId: order.customerId,
        status: order.status,
        totalCents: order.totalCents,
      };

      const [newId] = await tx
        .insert(orders)
        .values(newOrder)
        .onConflictDoNothing()
        .returning({ id: orders.id });

      const itemsWithId = order.items.map((item) => ({
        orderId: newId.id,
        productId: item.productId,
        quantity: item.quantity || 0,
        priceCents: item.priceCents || 0,
      }));

      await tx.insert(orderItems).values(itemsWithId).onConflictDoNothing();

      const inventoryChanges = order.items.map(
        (item) =>
          ({
            productId: item.productId,
            transaction: 'ordered',
            quantity: item.quantity!,
            referenceId: newId.id,
          } as const)
      );
      for (const change of inventoryChanges) await updateInventory(change);
      return { newId };
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Order insertion error: ${err}`);
    throw err;
  }
}

export async function updateOrder(data: FormData) {
  try {
    const order = updateSchema.parse({
      id: data.get('id'),
      name: data.get('name'),
      createdById: data.get('createdBy'),
      customerId: data.get('customer'),
      totalCents: data.get('total'),
      status: data.get('status'),
    });
    const updatedOrder: typeof orders.$inferInsert = {
      id: order.id,
      name: order.name,
      createdById: order.createdById,
      customerId: order.customerId,
      status: order.status,
      totalCents: order.totalCents,
    };
    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set(updatedOrder)
        .where(eq(orders.id, `${updatedOrder.id}`))
        .returning({ id: orders.id });
      if (updatedOrder.status) {
        const items = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, `${updatedOrder.id}`));
        for (const item of items) {
          const deliveredItem = {
            productId: item.productId,
            transaction: 'sale',
            quantity: item.quantity!,
            referenceId: updatedOrder.id,
          } as const;
          await updateInventory(deliveredItem);
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) console.error(`${err.issues}`);
    console.error(`Order update Error ${err}`);
    throw err;
  }
}

export async function modifyOrderItems(
  orderId: string,
  data: orderItemChanges
) {
  try {
    const addOrUpdate = orderItemsSchema.parse(data.addOrUpdate);
    const remove = orderItemsSchema.parse(data.remove);
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
                eq(orderItems.orderId, `${orderId}`),
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
    return await db.select().from(orders);
  } catch (err) {
    console.error(`Product data fetch error ${err}`);
    throw err;
  }
}
