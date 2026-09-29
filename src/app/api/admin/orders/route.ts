import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllOrders, approveOrder, rejectOrder, getOrderById } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const orders = getAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required." }, { status: 400 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (action === "approve") {
      const result = approveOrder(orderId);
      return NextResponse.json({ success: true, ...result });
    } else if (action === "reject") {
      const result = rejectOrder(orderId);
      return NextResponse.json({ success: true, ...result });
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin orders PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
