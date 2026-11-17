import { integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

import { userTable } from "../users/tables";

export const ordersTable = pgTable("orders", {
  city: text("city").notNull(),
  country: text("country").notNull().default("US"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  currency: text("currency").notNull().default("USD"),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  fulfillmentStatus: text("fulfillment_status").notNull().default("unfulfilled"),
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  paymentMethod: text("payment_method").notNull().default("card"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  postalCode: text("postal_code").notNull(),
  shipping: real("shipping").notNull().default(0),
  shippingAddress: text("shipping_address").notNull(),
  subtotal: real("subtotal").notNull(),
  tax: real("tax").notNull().default(0),
  total: real("total").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id").references(() => userTable.id, { onDelete: "set null" }),
});

export const orderItemsTable = pgTable("order_items", {
  category: text("category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  price: real("price").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});
