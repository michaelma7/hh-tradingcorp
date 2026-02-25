'use server';
import { db } from '@/db/db';
import { eq, sql, desc } from 'drizzle-orm';
import {
  orders,
  orderItems,
  products,
  customers,
  users,
  inventoryTransactions,
} from '@/db/schema';
import { z } from 'zod/v4';
import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';
import { inventoryTransaction } from './products';

export interface orderData {
  id: string;
  name: string;
  createdBy: string;
  customer: string;
  totalCents: number;
  status: boolean;
}

export type orderItemData = {
  id?: string;
  productId: string;
  quantity?: number;
  price?: number;
};

export type OrderFormState = {
  message?: string | null;
  errors?: {
    formErrors: string[];
    fieldErrors: {
      name?: string[];
      createdBy?: string[];
      customer?: string[];
      totalCents?: string[];
      status?: string[];
    };
  };
} | null;

export type OrderItemFormState = {
  message?: string | null;
  errors?: {
    formErrors: string[];
    fieldErrors: (string[] | undefined)[];
  };
} | null;

const orderItemSchema = z.object({
  orderId: z.uuid(),
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
  id: z.uuid(),
});

export async function createOrder(
  prevState: OrderFormState | OrderItemFormState,
  formData: FormData,
): Promise<OrderFormState | OrderItemFormState> {
  try {
    const data = {
      name: formData.get('name'),
      createdBy: formData.get('createdBy'),
      customer: formData.get('customer'),
      totalCents: Number(formData.get('totalCents')),
      status: formData.get('status') as string,
    };
    const order = orderSchema.safeParse(data);
    if (!order.success) return { errors: z.flattenError(order.error) };
    await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ userId: users.id })
        .from(users)
        .where(eq(users.email, `${order.data.createdBy}`));
      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.name, `${order.data.customer}`));
      const newOrder: typeof orders.$inferInsert = {
        name: order.data.name,
        createdById: user.userId,
        customerId: customer.id,
        status: order.data.status,
        totalCents: order.data.totalCents,
      };

      const [newId] = await tx
        .insert(orders)
        .values(newOrder)
        .onConflictDoNothing()
        .returning({ id: orders.id });

      // order line item data
      const itemData = {
        productId: formData.getAll('productId'),
        quantity: formData.getAll('quantity'),
        price: formData.getAll('price'),
      };
      // check for items
      if (itemData.productId[0] === '') return { newId };
      else {
        // create array of items to insert
        const items = [];
        for (let i = 0; i < itemData.productId.length; i++) {
          items.push({
            orderId: newId.id,
            productId: itemData.productId[i],
            quantity: itemData.quantity[i],
            priceCents: Number(itemData.price[i]) * 100,
          });
        }
        const verifiedItems = orderItemsSchema.safeParse(items);
        if (!verifiedItems.success)
          return { errors: z.flattenError(verifiedItems.error) };
        await tx
          .insert(orderItems)
          .values(verifiedItems.data)
          .onConflictDoNothing();
        for (const item of verifiedItems.data) {
          const change: inventoryTransaction = {
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
  redirect('/dashboard/orders');
}

export async function updateOrder(
  prevState: OrderFormState | OrderItemFormState,
  formData: FormData,
): Promise<OrderFormState> {
  try {
    const data = {
      id: formData.get('id'),
      name: formData.get('name'),
      createdBy: formData.get('createdBy'),
      customer: formData.get('customer'),
      totalCents: Number(formData.get('totalCents')),
      status: formData.get('status') as string,
    };
    const order = updateSchema.safeParse(data);
    if (!order.success) return { errors: z.flattenError(order.error) };

    await db.transaction(async (tx) => {
      const [customerId] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.name, `${order.data.customer}`));
      const updatedOrder: typeof orders.$inferInsert = {
        id: order.data.id,
        name: order.data.name,
        createdById: order.data.createdBy,
        customerId: customerId.id,
        status: order.data.status,
        totalCents: order.data.totalCents,
      };
      await tx
        .update(orders)
        .set(updatedOrder)
        .where(eq(orders.id, `${updatedOrder.id}`));
      if (updatedOrder.status) {
        const items = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, `${order.data.id}`));
        await tx
          .update(inventoryTransactions)
          .set({ transaction: 'sale' })
          .where(eq(inventoryTransactions.referenceId, `${order.data.id}`));
        for (const item of items) {
          const deliveredItem: inventoryTransaction = {
            productId: item.productId,
            transaction: 'sale',
            quantity: item.quantity!,
            referenceId: updatedOrder.id!,
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
  redirect('/dashboard/orders');
}

export async function modifyOrderItems(
  prevState: OrderItemFormState | OrderFormState,
  formData: FormData,
): Promise<OrderItemFormState> {
  try {
    // order line item data
    const itemData = {
      productId: formData.getAll('productId'),
      quantity: formData.getAll('quantity'),
      price: formData.getAll('price'),
    };
    const id = formData.get('id');
    // check for removing all items and no items to update case
    if (itemData.productId[0] === '') {
      await db.transaction(async (tx) => {
        const remove = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, `${id}`));
        if (remove) {
          remove.forEach(
            async (item) =>
              await tx
                .delete(orderItems)
                .where(eq(orderItems.id, `${item.id}`)),
          );
        }
      });
      return { message: 'Items Deleted' };
    } else {
      // create array of items to upsert & delete
      const items = [];
      for (let i = 0; i < itemData.productId.length; i++) {
        items.push({
          orderId: id,
          productId: itemData.productId[i],
          quantity: itemData.quantity[i],
          priceCents: Number(itemData.price[i]) * 100,
        });
      }
      const verifiedItems = orderItemsSchema.safeParse(items);
      if (!verifiedItems.success)
        return { errors: z.flattenError(verifiedItems.error) };
      await db.transaction(async (tx) => {
        // get current list of items and find rows removed
        const currentItems = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, `${id}`));
        for (let i = 0; i < currentItems.length; i++) {
          if (!itemData.productId.includes(currentItems[i].productId)) {
            tx.delete(orderItems).where(
              eq(orderItems.id, `${currentItems[i].id}`),
            );
          }
        }
        // upsert all other items
        verifiedItems.data.forEach(async (item) => {
          await tx
            .insert(orderItems)
            .values(item)
            .onConflictDoUpdate({
              target: [orderItems.id, orderItems.productId],
              set: { ...item },
            });
        });
      });
      return { message: 'Order Items successfully changed' };
    }
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
  redirect('/dashboard/orders');
}

export const getOrdersForDashboard = unstable_cache(
  async () => {
    const data = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 25,
      columns: { lastUpdated: false, createdAt: false, createdById: false },
      with: {
        customers: {
          columns: {
            name: true,
          },
        },
      },
    });
    return data ?? [];
  },
  [],
  {
    tags: ['orders'],
    revalidate: 120,
  },
);

export async function getOneOrder(orderId: string) {
  try {
    return await db.query.orders.findFirst({
      where: eq(orders.id, `${orderId}`),
      with: {
        ordersToOrderItems: {
          columns: {
            productId: false,
            orderId: false,
          },
          with: {
            product: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
        customers: {
          columns: {
            id: true,
            name: true,
          },
        },
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
