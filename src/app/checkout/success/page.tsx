"use client";

import { CheckCircle, ArrowRight, Package, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/ui/primitives/card";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "ORD-20261117-9821";
  const [estimatedDelivery] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center border-green-200/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
            <CheckCircle className="h-10 w-10" />
          </div>
          <Badge className="mx-auto bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 mb-2">
            Order Confirmed & Paid
          </Badge>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Thank you for your order!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment has been processed and your order is now being prepared for fulfillment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="rounded-lg bg-muted/60 p-4 text-left space-y-2 border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-foreground">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className="text-green-600 font-semibold">Authorized & Paid</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                {estimatedDelivery}
              </span>
            </div>
          </div>

          <div className="rounded-lg border p-4 text-left space-y-2 bg-card">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              What happens next?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              1. A confirmation receipt has been sent to your email address.<br />
              2. Our warehouse team is packaging your order.<br />
              3. You can monitor the fulfillment status in real-time in the admin dashboard or your profile orders.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link className="w-full sm:w-auto" href="/products">
            <Button className="w-full sm:w-auto gap-2" variant="outline">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <Link className="w-full sm:w-auto" href="/admin/orders">
            <Button className="w-full sm:w-auto gap-2">
              View Order in Admin
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto py-24 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      }
    >
      <OrderSuccessContent />
    </React.Suspense>
  );
}
