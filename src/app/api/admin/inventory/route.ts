import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, addInventoryItem, bulkAddInventory } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    const db = readDb();
    let items = db.inventory;

    if (productId) {
      items = items.filter((i) => i.productId === productId);
    }
    if (status) {
      items = items.filter((i) => i.status === status);
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Admin inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { mode, productId, tierId, item, bulkEntries } = body;

    if (!productId || !tierId) {
      return NextResponse.json(
        { error: "Product and Tier IDs are required" },
        { status: 400 }
      );
    }

    if (mode === "bulk" && Array.isArray(bulkEntries)) {
      const added = bulkAddInventory(productId, tierId, bulkEntries);
      return NextResponse.json({ success: true, count: added });
    } else if (item && item.accountEmail && item.accountPassword) {
      const created = addInventoryItem({
        productId,
        tierId,
        accountEmail: item.accountEmail,
        accountPassword: item.accountPassword,
        additionalInfo: item.additionalInfo,
        licenseKey: item.licenseKey,
      });
      return NextResponse.json({ success: true, item: created });
    }

    return NextResponse.json(
      { error: "Invalid inventory payload" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Add inventory error:", error);
    return NextResponse.json({ error: "Failed to add inventory" }, { status: 500 });
  }
}
