"use client";

import React, { useState } from "react";
import { Product, PlanTier } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";
import { 
  Tv, 
  Brain, 
  Radio, 
  Shield, 
  Sparkles, 
  Palette, 
  Code2, 
  Gamepad2, 
  Check, 
  Zap, 
  ShoppingCart, 
  Info,
  Clock,
  Video,
  Layers,
  BookOpen,
  Music,
  FileText,
  Box,
  Layout
} from "lucide-react";

interface ProductCardProps {
  product: Product & { stockCount?: number };
  onOpenDetails: (product: Product, selectedTier: PlanTier) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<PlanTier>(
    product.tiers.find((t) => t.popular) || product.tiers[0]
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Brain": return <Brain className="w-6 h-6 text-white" />;
      case "Palette": return <Palette className="w-6 h-6 text-white" />;
      case "Video": return <Video className="w-6 h-6 text-white" />;
      case "Radio": return <Radio className="w-6 h-6 text-white" />;
      case "Layers": return <Layers className="w-6 h-6 text-white" />;
      case "BookOpen": return <BookOpen className="w-6 h-6 text-white" />;
      case "Music": return <Music className="w-6 h-6 text-white" />;
      case "FileText": return <FileText className="w-6 h-6 text-white" />;
      case "Box": return <Box className="w-6 h-6 text-white" />;
      case "Layout": return <Layout className="w-6 h-6 text-white" />;
      case "Tv": return <Tv className="w-6 h-6 text-white" />;
      case "Shield": return <Shield className="w-6 h-6 text-white" />;
      case "Sparkles": return <Sparkles className="w-6 h-6 text-white" />;
      case "Code2": return <Code2 className="w-6 h-6 text-white" />;
      case "Gamepad2": return <Gamepad2 className="w-6 h-6 text-white" />;
      default: return <Zap className="w-6 h-6 text-white" />;
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedTier);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const stock = product.stockCount ?? 5;
  const savingsPercent = selectedTier.originalPrice
    ? Math.round(((selectedTier.originalPrice - selectedTier.price) / selectedTier.originalPrice) * 100)
    : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group">
      {/* Top Banner & Category */}
      <div className={`p-5 bg-gradient-to-r ${product.color} bg-opacity-20 border-b border-white/10 relative`}>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            {renderIcon(product.icon)}
          </div>

          <div className="flex flex-col items-end gap-1">
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/20 text-white backdrop-blur-md border border-white/30">
                {product.badge}
              </span>
            )}
            <span className="text-[11px] font-mono text-white/80">
              {product.category}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>
      </div>

      {/* Body: Tiers, Stock & Features */}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        {/* Tier Selector Tabs */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Option / Durée
          </label>
          <div className={`grid gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/5 ${
            product.tiers.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}>
            {product.tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all relative ${
                  selectedTier.id === tier.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tier.durationLabel}
                {tier.popular && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Display */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {formatCurrency(selectedTier.price)}
              </span>
              {selectedTier.originalPrice && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  {formatCurrency(selectedTier.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Paiement unique • Garantie incluse
            </span>
          </div>

          {savingsPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              -{savingsPercent}%
            </span>
          )}
        </div>

        {/* Stock & Delivery Guarantee */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-white/5">
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Livraison Instantanée</span>
          </div>

          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{stock > 0 ? `${stock} en stock` : "Disponible"}</span>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-1.5 text-xs text-slate-300 flex-1">
          {product.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => onOpenDetails(product, selectedTier)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center"
            title="Détails & Conditions"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              addedAnimation
                ? "bg-emerald-500 text-slate-950 font-bold scale-[0.98]"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                Ajouté au panier !
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Commander • {formatCurrency(selectedTier.price)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
