"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, PlanTier } from "@/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, tier: PlanTier, quantity?: number) => void;
  removeFromCart: (productId: string, tierId: string) => void;
  updateQuantity: (productId: string, tierId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string;
  applyPromoCode: (code: string) => { valid: boolean; message: string };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("subvault_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from storage:", e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("subvault_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to storage:", e);
    }
  }, [items]);

  const addToCart = (product: Product, tier: PlanTier, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.tier.id === tier.id
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, { productId: product.id, product, tier, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, tierId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.tier.id === tierId))
    );
  };

  const updateQuantity = (productId: string, tierId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, tierId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.tier.id === tierId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode("");
    setDiscountPercent(0);
  };

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "SAVE20") {
      setPromoCode("SAVE20");
      setDiscountPercent(20);
      return { valid: true, message: "🎉 20% Discount Applied!" };
    }
    if (cleanCode === "VAULT10") {
      setPromoCode("VAULT10");
      setDiscountPercent(10);
      return { valid: true, message: "✨ 10% Discount Applied!" };
    }
    return { valid: false, message: "Invalid promo code" };
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.tier.price * item.quantity, 0).toFixed(2)
  );
  const discount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const total = Number(Math.max(0, subtotal - discount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discount,
        total,
        promoCode,
        applyPromoCode,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
