"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Coins,
  Smartphone
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, promoCode, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto" | "applepay">("card");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Simulated card fields
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("789");

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your checkout cart is empty</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Add a subscription or account plan from the catalog to continue with checkout.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const emailToUse = user ? user.email : guestEmail;
    if (!emailToUse || !emailToUse.includes("@")) {
      setErrorMessage("Please provide a valid delivery email address.");
      return;
    }

    setIsProcessing(true);

    try {
      setProcessingStep("1/3 Authorizing secure gateway transaction...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("2/3 Contacting SubVault automated key engine...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("3/3 Allocating account credentials & private profile...");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          guestEmail: emailToUse,
          guestName: user ? user.name : guestName || emailToUse.split("@")[0],
          promoCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // Save credentials into sessionStorage for instantaneous display
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `subvault_order_${data.order.id}`,
          JSON.stringify(data.credentials)
        );
      }

      clearCart();
      router.push(`/order-success/${data.order.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Storefront
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Secure Checkout</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleProcessPayment} className="space-y-6">
            {/* Account / Delivery Email Section */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Delivery Destination
                </h3>
                {user ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    Logged In
                  </span>
                ) : (
                  <Link href="/login" className="text-xs text-cyan-400 hover:underline">
                    Already have an account? Sign in
                  </Link>
                )}
              </div>

              {user ? (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Delivery Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Credentials are unlocked on-screen instantly and archived in your vault.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Gateway Method Selector */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Select Payment Method
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "card"
                      ? "bg-cyan-950/40 border-cyan-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "applepay"
                      ? "bg-cyan-950/40 border-cyan-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <span className="text-xs">Apple / G-Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "crypto"
                      ? "bg-cyan-950/40 border-cyan-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="text-xs">USDT Crypto</span>
                </button>
              </div>

              {/* Dynamic Payment Method UI */}
              {paymentMethod === "card" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Security CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "applepay" && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    One-touch biometric payment authorized. Click complete order below to authorize Apple Pay / Google Pay.
                  </p>
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-mono">
                    <Coins className="w-4 h-4" />
                    <span>TRC-20 USDT Automated Gateway</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Instant 0-confirmation delivery simulation active. Zero network fees.
                  </p>
                </div>
              )}
            </div>

            {/* Complete Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                isProcessing
                  ? "bg-slate-800 text-cyan-400 cursor-wait border border-cyan-500/30"
                  : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-xl shadow-cyan-500/25 hover:scale-[1.01]"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Transaction</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300/80">
                    {processingStep}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Payer {formatCurrency(total)} & Révéler les identifiants</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-white/10">
              Récapitulatif de la commande ({items.length} articles)
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.tier.id}`}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-cyan-400 flex-shrink-0">
                      {item.product.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {item.tier.durationLabel} • Qté {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-white flex-shrink-0">
                    {formatCurrency(item.tier.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Sous-total</span>
                <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Remise ({promoCode})</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Frais de livraison automatisée</span>
                <span className="text-emerald-400 font-mono">GRATUIT (0 DA)</span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                <span>Total à régler</span>
                <span className="font-mono text-cyan-400">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Instant Auto-Fulfillment Guaranteed</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Your credentials are never shared and will be immediately copyable with passwords, pins, and warranty coverage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              All purchases protected by SubVault&apos;s 100% Replacement Warranty.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
