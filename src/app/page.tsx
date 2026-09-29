"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, PlanTier, ProductCategory } from "@/types";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { 
  Zap, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Lock, 
  Key, 
  RefreshCw,
  HelpCircle,
  ChevronDown
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<(Product & { stockCount: number })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [activeModalTier, setActiveModalTier] = useState<PlanTier | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error("Failed to load products:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = ["All", "AI & Developer", "Design & Video", "Streaming", "Productivity", "Education & Learning"];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetails = (product: Product, tier: PlanTier) => {
    setActiveModalProduct(product);
    setActiveModalTier(tier);
  };

  const faqs = [
    {
      q: "How does automated instant delivery work?",
      a: "Our system maintains a secure, encrypted inventory vault. As soon as your payment is processed by our gateway, an unassigned credential payload (login email, password, and private profile/PIN) is atomically leased to your account and displayed right on your screen in less than 1 second."
    },
    {
      q: "Are these shared accounts or private dedicated profiles?",
      a: "Depending on the product, you receive either a 100% private direct master account or a private dedicated profile protected by your own personal 4-digit PIN code. No one else has access to your streaming history or private chat prompts."
    },
    {
      q: "What is your replacement warranty guarantee?",
      a: "Every single subscription sold on SubVault includes our automated warranty (ranging from 30 days to 365 days). If an account ever loses access, you can trigger an automated credential re-issue with one click from your subscriber dashboard."
    },
    {
      q: "What payment methods are supported?",
      a: "We support major Credit & Debit cards (Visa, Mastercard, Amex), Apple Pay, and leading cryptocurrencies (USDT, BTC, ETH) with zero KYC friction."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] bg-grid-pattern relative">
      {/* Background ambient glow circles */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-10 w-[450px] h-[450px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-cyan-500/10">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Automated Credential Engine Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Premium Digital Accounts.{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Instant Vault Delivery.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Access high-tier AI models, streaming 4K platforms, VPNs, and developer software up to 75% off. 
          Credentials revealed immediately on-screen post checkout.
        </p>

        {/* Hero CTA buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#catalog"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Explore Account Catalog
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            Manage My Subscriptions
          </Link>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-white font-mono">0.5 Sec</div>
              <div className="text-xs text-slate-400">Instant Automated Reveal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-white font-mono">100%</div>
              <div className="text-xs text-slate-400">Replacement Guarantee</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/20 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-white font-mono">450+</div>
              <div className="text-xs text-slate-400">Stocked Vault Accounts</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-white font-mono">4.9 / 5.0</div>
              <div className="text-xs text-slate-400">Verified Customer Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="catalog" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Available Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Subscription Tiers & Digital Accounts
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher Gemini, Canva, Spotify, CapCut, Office 365, Notion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse p-6"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 p-6 rounded-2xl bg-slate-900/40 border border-white/5">
            <p className="text-slate-400 text-sm">No accounts found matching your query.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-cyan-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* How Automated Delivery Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Automated Architecture
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            How SubVault Delivers Accounts Instantly
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No waiting on Telegram sellers or manual emails. Fully automated key distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="text-4xl font-black text-white/10 font-mono absolute top-4 right-4">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Select Duration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from 1-month trial tiers up to 1-year or lifetime licenses with live vault stock checks.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="text-4xl font-black text-white/10 font-mono absolute top-4 right-4">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secure Checkout</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete your payment via Card, Apple Pay, or Crypto with 256-bit SSL transaction encryption.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="text-4xl font-black text-white/10 font-mono absolute top-4 right-4">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Instant Auto-Reveal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your credentials, email, password, and private profile PIN are unlocked immediately on-screen.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative">
            <span className="text-4xl font-black text-white/10 font-mono absolute top-4 right-4">
              04
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Active Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage all active accounts in your Subscriber Dashboard with auto-renewal and warranty protection.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <span className="text-sm font-bold text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductModal
        product={activeModalProduct}
        initialTier={activeModalTier}
        isOpen={!!activeModalProduct}
        onClose={() => {
          setActiveModalProduct(null);
          setActiveModalTier(null);
        }}
      />
    </div>
  );
}
