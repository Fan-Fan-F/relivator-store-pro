"use client";

import {
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

import type { OrderWithItems } from "~/db/schema/orders/types";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/ui/primitives/table";

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithItems | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = (await res.json()) as {
        orders?: OrderWithItems[];
        success?: boolean;
      };
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newFulfillmentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        body: JSON.stringify({ fulfillmentStatus: newFulfillmentStatus }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Update failed");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, fulfillmentStatus: newFulfillmentStatus } : o)),
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, fulfillmentStatus: newFulfillmentStatus } : null));
      }

      toast.success(`Order status updated to ${newFulfillmentStatus}`);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update status");
    }
  };

  // Stats calculation
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "paid" ? o.total : 0), 0);
  const processingCount = orders.filter((o) => o.fulfillmentStatus === "processing").length;
  const completedCount = orders.filter((o) => o.fulfillmentStatus === "delivered" || o.fulfillmentStatus === "shipped").length;

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "processing") return order.fulfillmentStatus === "processing";
      if (statusFilter === "shipped") return order.fulfillmentStatus === "shipped";
      if (statusFilter === "delivered") return order.fulfillmentStatus === "delivered";
      if (statusFilter === "unfulfilled") return order.fulfillmentStatus === "unfulfilled";
      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Total orders registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Processing</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting dispatch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fulfilled / Shipped</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Dispatched or delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Orders Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Orders Management</CardTitle>
              <CardDescription>
                Review and manage store orders, update shipping progress, and inspect items.
              </CardDescription>
            </div>
            <Button
              className="gap-2 self-start sm:self-auto"
              onClick={fetchOrders}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order #, customer, email..."
                value={searchQuery}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground mr-1" />
              {["all", "processing", "shipped", "delivered"].map((status) => (
                <Button
                  className="rounded-full capitalize text-xs h-8"
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  variant={statusFilter === status ? "default" : "outline"}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try modifying your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium text-xs">
                        {order.orderNumber}
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                          {order.items?.[0]?.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="capitalize text-[11px]"
                          variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize text-[11px] ${
                            order.fulfillmentStatus === "delivered"
                              ? "bg-green-600 hover:bg-green-700"
                              : order.fulfillmentStatus === "shipped"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-amber-600 hover:bg-amber-700"
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          onClick={() => setSelectedOrder(order)}
                          size="sm"
                          variant="ghost"
                        >
                          Details
                        </Button>
                        {order.fulfillmentStatus === "processing" && (
                          <Button
                            onClick={() => handleUpdateStatus(order.id, "shipped")}
                            size="sm"
                            variant="outline"
                          >
                            Ship
                          </Button>
                        )}
                        {order.fulfillmentStatus === "shipped" && (
                          <Button
                            onClick={() => handleUpdateStatus(order.id, "delivered")}
                            size="sm"
                            variant="outline"
                          >
                            Deliver
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal / Drawer Simulation */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>Order: {selectedOrder.orderNumber}</span>
                  <Badge variant="outline">{selectedOrder.fulfillmentStatus}</Badge>
                </CardTitle>
                <CardDescription>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <Button onClick={() => setSelectedOrder(null)} size="icon" variant="ghost">
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Customer</h4>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerPhone}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Shipping To</h4>
                  <p className="font-medium">{selectedOrder.shippingAddress}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.city}, {selectedOrder.postalCode}, {selectedOrder.country}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Purchased Items</h4>
                <div className="divide-y rounded-lg border">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 gap-3">
                      <div className="relative h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        {item.image && (
                          <Image
                            alt={item.name}
                            className="object-cover"
                            fill
                            sizes="48px"
                            src={item.image}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>${selectedOrder.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total Amount</span>
                  <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 justify-end border-t">
                <Button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                  size="sm"
                  variant="outline"
                >
                  Set Processing
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                  size="sm"
                  variant="outline"
                >
                  Set Shipped
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                  size="sm"
                >
                  Set Delivered
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
