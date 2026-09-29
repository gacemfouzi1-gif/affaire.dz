import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllSubscriptions, updateSubscriptionStatus } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const subscriptions = getAllSubscriptions();
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Admin subscriptions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { subscriptionId, status } = await request.json();
    if (!subscriptionId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = updateSubscriptionStatus(subscriptionId, status);
    if (!updated) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error("Admin update subscription error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
