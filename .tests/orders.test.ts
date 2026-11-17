import { describe, expect, test } from "bun:test";

import { createOrder, getOrderById, getOrders, updateOrderStatus } from "../src/api/orders/service";

describe("Order System Service", () => {
  test("createOrder calculates totals correctly and records order", async () => {
    const order = await createOrder({
      city: "Seattle",
      country: "US",
      customerEmail: "tester@example.com",
      customerName: "Test Buyer",
      customerPhone: "+1-555-1234",
      items: [
        {
          category: "Audio",
          image: "https://example.com/test.jpg",
          name: "Test Headphones",
          price: 100.0,
          productId: "test-prod-1",
          quantity: 2,
        },
      ],
      paymentMethod: "card",
      postalCode: "98101",
      shippingAddress: "100 Pine Street",
    });

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^ORD-\d+-\d+$/);
    expect(order.subtotal).toBe(200.0);
    // Subtotal > 150 gets free shipping (0)
    expect(order.shipping).toBe(0);
    // Tax is 8% = 16.0
    expect(order.tax).toBe(16.0);
    expect(order.total).toBe(216.0);
    expect(order.items.length).toBe(1);
    expect(order.items[0].name).toBe("Test Headphones");
    expect(order.paymentStatus).toBe("paid");
  });

  test("getOrders retrieves order list", async () => {
    const orders = await getOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });

  test("getOrderById retrieves an order by its ID or orderNumber", async () => {
    const all = await getOrders();
    const first = all[0];
    const foundById = await getOrderById(first.id);
    expect(foundById).not.toBeNull();
    expect(foundById?.id).toBe(first.id);

    const foundByNumber = await getOrderById(first.orderNumber);
    expect(foundByNumber).not.toBeNull();
    expect(foundByNumber?.orderNumber).toBe(first.orderNumber);
  });

  test("updateOrderStatus updates fulfillment status", async () => {
    const all = await getOrders();
    const target = all[0];
    const updated = await updateOrderStatus(target.id, {
      fulfillmentStatus: "shipped",
    });

    expect(updated).not.toBeNull();
    expect(updated?.fulfillmentStatus).toBe("shipped");
  });
});
