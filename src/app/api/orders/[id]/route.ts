import { NextRequest, NextResponse } from "next/server";

import { getOrderById, updateOrderStatus } from "~/api/orders/service";
import { getCurrentUser } from "~/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch order", success: false },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = (await request.json()) as any;

    const updated = await updateOrderStatus(id, {
      fulfillmentStatus: body.fulfillmentStatus,
      paymentStatus: body.paymentStatus,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Order not found or update failed", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json({ order: updated, success: true });
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update order", success: false },
      { status: 500 },
    );
  }
}
