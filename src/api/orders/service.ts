import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "~/db";
import { orderItemsTable, ordersTable } from "~/db/schema";
import type { OrderWithItems } from "~/db/schema/orders/types";

export interface CreateOrderItemInput {
  category?: string;
  image?: string;
  name: string;
  price: number;
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  city: string;
  country?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: CreateOrderItemInput[];
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  postalCode: string;
  shippingAddress: string;
  userId?: string | null;
}

// Fallback in-memory storage for demonstration and offline/testing scenarios
const memoryOrdersStore: Map<string, OrderWithItems> = new Map();

// Helper to seed initial sample orders for demonstration if store is empty
function seedSampleOrdersIfEmpty() {
  if (memoryOrdersStore.size > 0) return;

  const sampleOrder1Id = "sample-ord-1";
  const sampleOrder1: OrderWithItems = {
    city: "San Francisco",
    country: "US",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
    currency: "USD",
    customerEmail: "alex.demo@example.com",
    customerName: "Alex Morgan",
    customerPhone: "+1 (555) 234-5678",
    fulfillmentStatus: "processing",
    id: sampleOrder1Id,
    orderNumber: "ORD-20261115-1082",
    paymentMethod: "card",
    paymentStatus: "paid",
    postalCode: "94107",
    shipping: 0,
    shippingAddress: "456 Market St, Suite 300",
    subtotal: 199.99,
    tax: 16.0,
    total: 215.99,
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000),
    userId: null,
    items: [
      {
        category: "Audio",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000),
        id: "item-101",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        name: "Premium Wireless Headphones",
        orderId: sampleOrder1Id,
        price: 199.99,
        productId: "1",
        quantity: 1,
      },
    ],
  };

  const sampleOrder2Id = "sample-ord-2";
  const sampleOrder2: OrderWithItems = {
    city: "New York",
    country: "US",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
    currency: "USD",
    customerEmail: "jordan.taylor@example.com",
    customerName: "Jordan Taylor",
    customerPhone: "+1 (555) 876-5432",
    fulfillmentStatus: "shipped",
    id: sampleOrder2Id,
    orderNumber: "ORD-20261114-0491",
    paymentMethod: "card",
    paymentStatus: "paid",
    postalCode: "10001",
    shipping: 10.0,
    shippingAddress: "789 5th Avenue",
    subtotal: 299.99,
    tax: 24.0,
    total: 333.99,
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000),
    userId: null,
    items: [
      {
        category: "Wearables",
        createdAt: new Date(Date.now() - 48 * 3600 * 1000),
        id: "item-102",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        name: "Smart Watch Series 5",
        orderId: sampleOrder2Id,
        price: 299.99,
        productId: "2",
        quantity: 1,
      },
    ],
  };

  memoryOrdersStore.set(sampleOrder1.id, sampleOrder1);
  memoryOrdersStore.set(sampleOrder2.id, sampleOrder2);
}

/**
 * Create a new order with its items
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  const orderId = uuidv4();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

  const subtotal = Number(
    input.items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2),
  );
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const now = new Date();
  const paymentStatus = input.paymentStatus || "paid";
  const fulfillmentStatus = "processing";

  const orderRecord = {
    city: input.city,
    country: input.country || "US",
    createdAt: now,
    currency: "USD",
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    customerPhone: input.customerPhone || null,
    fulfillmentStatus,
    id: orderId,
    orderNumber,
    paymentMethod: input.paymentMethod || "card",
    paymentStatus,
    postalCode: input.postalCode,
    shipping,
    shippingAddress: input.shippingAddress,
    subtotal,
    tax,
    total,
    updatedAt: now,
    userId: input.userId || null,
  };

  const itemRecords = input.items.map((item) => ({
    category: item.category || "General",
    createdAt: now,
    id: uuidv4(),
    image: item.image || "",
    name: item.name,
    orderId,
    price: Number(item.price.toFixed(2)),
    productId: item.productId,
    quantity: item.quantity,
  }));

  const fullOrder: OrderWithItems = {
    ...orderRecord,
    items: itemRecords,
  };

  // Always keep in memory store
  memoryOrdersStore.set(orderId, fullOrder);

  // Attempt database persistence
  try {
    await db.insert(ordersTable).values(orderRecord);
    if (itemRecords.length > 0) {
      await db.insert(orderItemsTable).values(itemRecords);
    }
  } catch (error) {
    console.warn("DB write skipped or failed, fallback to in-memory order store:", error);
  }

  return fullOrder;
}

/**
 * List orders with optional user filtering
 */
export async function getOrders(userId?: string | null): Promise<OrderWithItems[]> {
  seedSampleOrdersIfEmpty();

  try {
    const query = db.query.ordersTable.findMany({
      where: userId ? eq(ordersTable.userId, userId) : undefined,
      orderBy: [desc(ordersTable.createdAt)],
      with: {
        items: true,
      },
    });

    const dbOrders = (await query) as unknown as OrderWithItems[];
    if (dbOrders && dbOrders.length > 0) {
      return dbOrders;
    }
  } catch (error) {
    console.warn("DB read skipped or failed, returning in-memory orders:", error);
  }

  const allOrders = Array.from(memoryOrdersStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (userId) {
    return allOrders.filter((o) => o.userId === userId);
  }
  return allOrders;
}

/**
 * Retrieve an order by its ID or orderNumber
 */
export async function getOrderById(idOrNumber: string): Promise<OrderWithItems | null> {
  seedSampleOrdersIfEmpty();

  try {
    const dbOrder = (await db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, idOrNumber),
      with: {
        items: true,
      },
    })) as unknown as OrderWithItems | undefined;

    if (dbOrder) {
      return dbOrder;
    }

    const dbOrderByNumber = (await db.query.ordersTable.findFirst({
      where: eq(ordersTable.orderNumber, idOrNumber),
      with: {
        items: true,
      },
    })) as unknown as OrderWithItems | undefined;

    if (dbOrderByNumber) {
      return dbOrderByNumber;
    }
  } catch (error) {
    console.warn("DB read order failed, falling back to in-memory lookup:", error);
  }

  if (memoryOrdersStore.has(idOrNumber)) {
    return memoryOrdersStore.get(idOrNumber) || null;
  }

  for (const order of memoryOrdersStore.values()) {
    if (order.orderNumber === idOrNumber) {
      return order;
    }
  }

  return null;
}

/**
 * Update order status (payment status or fulfillment status)
 */
export async function updateOrderStatus(
  orderId: string,
  updates: {
    fulfillmentStatus?: string;
    paymentStatus?: string;
  },
): Promise<OrderWithItems | null> {
  const now = new Date();

  try {
    await db
      .update(ordersTable)
      .set({
        ...updates,
        updatedAt: now,
      })
      .where(eq(ordersTable.id, orderId));
  } catch (error) {
    console.warn("DB update skipped or failed, updating memory store:", error);
  }

  const order = memoryOrdersStore.get(orderId);
  if (order) {
    if (updates.fulfillmentStatus) {
      order.fulfillmentStatus = updates.fulfillmentStatus;
    }
    if (updates.paymentStatus) {
      order.paymentStatus = updates.paymentStatus;
    }
    order.updatedAt = now;
    memoryOrdersStore.set(orderId, order);
    return order;
  }

  return null;
}
