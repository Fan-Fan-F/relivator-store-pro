import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { orderItemsTable, ordersTable } from "./tables";

export type Order = InferSelectModel<typeof ordersTable>;
export type NewOrder = InferInsertModel<typeof ordersTable>;

export type OrderItem = InferSelectModel<typeof orderItemsTable>;
export type NewOrderItem = InferInsertModel<typeof orderItemsTable>;

export type OrderWithItems = Order & {
  items: OrderItem[];
};
