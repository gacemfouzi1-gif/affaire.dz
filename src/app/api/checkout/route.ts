import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processAutomatedDelivery } from "@/lib/delivery";
import { findUserByEmail, createUser } from "@/lib/db";
import bcrypt from "bcryptjs";
import { CartItem } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod, guestEmail, guestName, promoCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    let user = await getCurrentUser();

    // If user is not logged in, auto-provision guest account with default password
    if (!user) {
      if (!guestEmail) {
        return NextResponse.json(
          { error: "Please log in or provide an email for account delivery." },
          { status: 400 }
        );
      }

      let existing = findUserByEmail(guestEmail);
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const defaultHash = await bcrypt.hash("Subvault2026!", salt);
        existing = createUser({
          name: guestName || guestEmail.split("@")[0],
          email: guestEmail,
          passwordHash: defaultHash,
          role: "user",
        });
      }

      user = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        createdAt: existing.createdAt,
      };
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (acc: number, item: CartItem) => acc + item.tier.price * item.quantity,
      0
    );

    // Apply promo code if valid
    let discount = 0;
    if (promoCode && promoCode.toUpperCase() === "SAVE20") {
      discount = Number((subtotal * 0.2).toFixed(2));
    } else if (promoCode && promoCode.toUpperCase() === "VAULT10") {
      discount = Number((subtotal * 0.1).toFixed(2));
    }

    const total = Number(Math.max(0, subtotal - discount).toFixed(2));
    const mockPaymentId = `pi_${paymentMethod}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Execute automated vault allocation and instant delivery
    const deliveryResult = await processAutomatedDelivery({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      items,
      subtotal,
      discount,
      total,
      paymentMethod: paymentMethod || "card",
      paymentId: mockPaymentId,
    });

    return NextResponse.json({
      success: true,
      order: deliveryResult.order,
      credentials: deliveryResult.allocatedCredentials,
      emailSentTo: deliveryResult.emailSentTo,
    });
  } catch (error) {
    console.error("Checkout processing error:", error);
    return NextResponse.json(
      { error: "Payment and delivery failed. Please try again." },
      { status: 500 }
    );
  }
}
