import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = getUserOrders(user.id);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
