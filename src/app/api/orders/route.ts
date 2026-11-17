import { NextRequest, NextResponse } from "next/server";

import { createOrder, getOrders } from "~/api/orders/service";
import { getCurrentUser } from "~/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // Optional user authentication check
    let user = null;
    try {
      user = await getCurrentUser();
    } catch {
      // not logged in
    }

    const targetUserId = userIdParam || (user ? user.id : undefined);
    const orders = await getOrders(targetUserId);

    return NextResponse.json({ orders, success: true });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", success: false },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as any;

    if (!body.customerEmail || !body.customerName || !body.shippingAddress || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order fields", success: false },
        { status: 400 },
      );
    }

    let user = null;
    try {
      user = await getCurrentUser();
    } catch {
      // not logged in
    }

    const order = await createOrder({
      city: body.city || "Default City",
      country: body.country || "US",
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: body.items,
      paymentMethod: body.paymentMethod || "card",
      paymentStatus: body.paymentStatus || "paid",
      postalCode: body.postalCode || "00000",
      shippingAddress: body.shippingAddress,
      userId: user ? user.id : body.userId || null,
    });

    return NextResponse.json({ order, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
    return NextResponse.json(
      { error: "Failed to create order", success: false },
      { status: 500 },
    );
  }
}
