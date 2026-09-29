"use client";

import React, { useState } from "react";
import { Product, PlanTier } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";
import { 
  X, 
  Check, 
  ShieldCheck, 
  Zap, 
  ShoppingCart, 
  AlertTriangle 
} from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  initialTier?: PlanTier | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({
  product,
  initialTier,
  isOpen,
  onClose,
}: ProductModalProps) {
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<PlanTier | null>(null);

  // Sync initial tier
  React.useEffect(() => {
    if (product) {
      setSelectedTier(initialTier || product.tiers[0]);
    }
  }, [product, initialTier]);

  if (!isOpen || !product || !selectedTier) return null;

  const handleBuy = () => {
    addToCart(product, selectedTier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${product.color} bg-opacity-20 border-b border-white/10 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-white/20 text-white backdrop-blur-md">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {product.badge}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-white mt-2">
            {product.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {product.tagline}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Présentation
            </h4>
            <p className="leading-relaxed text-slate-200">
              {product.description}
            </p>
          </div>

          {/* Select Tier */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Choisir votre formule
            </h4>
            <div className={`grid gap-3 ${product.tiers.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {product.tiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTier.id === tier.id
                      ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/60 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {tier.durationLabel}
                    </span>
                    {tier.popular && (
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-white font-mono">
                      {formatCurrency(tier.price)}
                    </span>
                    {tier.originalPrice && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {formatCurrency(tier.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Fonctionnalités incluses
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Delivery & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex gap-3">
              <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Livraison Instantanée</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Identifiants et détails d&apos;accès débloqués immédiatement sur votre écran dès confirmation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">Garantie Totale {product.warrantyDays} Jours</h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  En cas d&apos;interruption, réémission ou remplacement immédiat garanti.
                </p>
              </div>
            </div>
          </div>

          {/* Rules & Guidelines */}
          {product.rules && product.rules.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Règles d&apos;utilisation</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {product.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total ({selectedTier.durationLabel})</span>
            <span className="text-xl font-black text-cyan-400 font-mono">
              {formatCurrency(selectedTier.price)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleBuy}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
