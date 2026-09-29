import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/db";

export async function GET() {
  try {
    const products = getAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
