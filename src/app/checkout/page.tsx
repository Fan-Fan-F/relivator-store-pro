"use client";

import { CheckCircle2, CreditCard, Lock, Package, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "~/lib/hooks/use-cart";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart } = useCart();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    city: "San Francisco",
    country: "United States",
    customerEmail: "",
    customerName: "",
    customerPhone: "+1 (555) 019-2834",
    paymentMethod: "card",
    postalCode: "94103",
    shippingAddress: "123 Market Street, Apt 4B",
    // Mock card fields
    cardNumber: "•••• •••• •••• 4242",
    cardExp: "12/28",
    cardCvc: "123",
  });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const shipping = subtotal > 150 ? 0 : 15;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.customerEmail.trim()) {
      toast.error("Please provide your name and email address.");
      return;
    }

    if (!formData.shippingAddress.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      toast.error("Please fill in complete shipping address information.");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        body: JSON.stringify({
          city: formData.city,
          country: formData.country,
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          items: items.map((item) => ({
            category: item.category,
            image: item.image,
            name: item.name,
            price: item.price,
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod: formData.paymentMethod,
          paymentStatus: "paid",
          postalCode: formData.postalCode,
          shippingAddress: formData.shippingAddress,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = (await response.json()) as {
        error?: string;
        order?: { id: string; orderNumber: string };
        success?: boolean;
      };

      if (!response.ok || !data.success || !data.order) {
        throw new Error(data.error || "Order placement failed");
      }

      toast.success("Payment successful! Your order has been placed.");
      clearCart();
      router.push(`/checkout/success?orderNumber=${data.order.orderNumber}&orderId=${data.order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="container mx-auto min-h-[60vh] flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          You haven&apos;t added any items to your cart yet. Explore our store and find something great!
        </p>
        <Link href="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground mt-1">
          Complete your order with secure payment processing.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Shipping & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Contact Information
                </CardTitle>
                <CardDescription>
                  We&apos;ll send your receipt and tracking info to this address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      required
                      value={formData.customerName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email Address *</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      required
                      type="email"
                      value={formData.customerEmail}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    value={formData.customerPhone}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Shipping Address
                </CardTitle>
                <CardDescription>
                  Where should we ship your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Street Address *</Label>
                  <Input
                    id="shippingAddress"
                    name="shippingAddress"
                    onChange={handleInputChange}
                    placeholder="123 Main St, Apt 4"
                    required
                    value={formData.shippingAddress}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      onChange={handleInputChange}
                      placeholder="San Francisco"
                      required
                      value={formData.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      onChange={handleInputChange}
                      placeholder="94103"
                      required
                      value={formData.postalCode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      onChange={handleInputChange}
                      placeholder="United States"
                      required
                      value={formData.country}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Payment Details
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-green-600" />
                  Sandbox demo mode — no real payment is processed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-accent/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">Credit or Debit Card</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-background">Live / Sandbox</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        onChange={handleInputChange}
                        value={formData.cardNumber}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs" htmlFor="cardExp">Expiry Date</Label>
                        <Input
                          id="cardExp"
                          name="cardExp"
                          onChange={handleInputChange}
                          value={formData.cardExp}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs" htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          name="cardCvc"
                          onChange={handleInputChange}
                          value={formData.cardCvc}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Your payment details are protected with 256-bit SSL encryption.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge variant="secondary">{itemCount} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items List */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="relative h-12 w-12 overflow-hidden rounded bg-muted flex-shrink-0">
                          {item.image ? (
                            <Image
                              alt={item.name}
                              className="object-cover"
                              fill
                              sizes="48px"
                              src={item.image}
                            />
                          ) : (
                            <Package className="h-6 w-6 m-auto text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Calculations */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="font-medium text-foreground">
                        {shipping === 0 ? (
                          <span className="text-green-600 font-semibold">FREE (Over $150)</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Tax (8%)</span>
                      <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Due</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    className="w-full text-base py-6 font-semibold"
                    disabled={isSubmitting}
                    size="lg"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Processing Order...
                      </div>
                    ) : (
                      `Pay $${total.toFixed(2)} & Place Order`
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Free shipping on all orders over $150</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
