"use client";

import { ArrowRight, Clock, Package, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import type { OrderWithItems } from "~/db/schema/orders/types";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";

export default function UserOrdersPage() {
  const [orders, setOrders] = React.useState<OrderWithItems[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUserOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = (await res.json()) as {
          orders?: OrderWithItems[];
          success?: boolean;
        };
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track your packages, view past receipts, and monitor delivery progress.
          </p>
        </div>
        <Link href="/products">
          <Button className="gap-2" variant="outline">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/40" />
            <h3 className="text-xl font-semibold">No Orders Placed Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              You haven&apos;t placed any orders yet. Once you make a purchase, it will appear here with live tracking.
            </p>
            <Link href="/products">
              <Button className="mt-2">Browse Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/40 border-b py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Order Reference
                    </span>
                    <div className="font-mono font-bold text-sm sm:text-base">
                      {order.orderNumber}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <span className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <Badge
                      className={`capitalize ${
                        order.fulfillmentStatus === "delivered"
                          ? "bg-green-600"
                          : order.fulfillmentStatus === "shipped"
                          ? "bg-blue-600"
                          : "bg-amber-600"
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {item.image && (
                            <Image
                              alt={item.name}
                              className="object-cover"
                              fill
                              sizes="56px"
                              src={item.image}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="text-xs text-muted-foreground">
                      Delivering to: <span className="font-medium text-foreground">{order.shippingAddress}, {order.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
