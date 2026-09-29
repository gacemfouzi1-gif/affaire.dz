"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Product, InventoryItem, Subscription, Order } from "@/types";
import { 
  ShieldAlert, 
  Layers, 
  Key, 
  PlusCircle, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  RefreshCw, 
  ShoppingBag, 
  Clock, 
  Check, 
  XCircle, 
  Copy,
  Smartphone,
  Landmark,
  Coins,
  CreditCard,
  Eye,
  Filter
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function AdminPage() {
  const { user, login } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "subscriptions" | "orders">("overview");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Orders filter & action state
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "completed" | "refunded">("all");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bulk import state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, productsRes, inventoryRes, subsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/products"),
        fetch("/api/admin/inventory"),
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/orders"),
      ]);

      if (overviewRes.ok) {
        const oData = await overviewRes.json();
        setStats(oData.stats);
      }
      if (productsRes.ok) {
        const pData = await productsRes.json();
        setProducts(pData.products || []);
        if (pData.products?.length > 0 && !selectedProductId) {
          setSelectedProductId(pData.products[0].id);
          setSelectedTierId(pData.products[0].tiers[0]?.id || "");
        }
      }
      if (inventoryRes.ok) {
        const iData = await inventoryRes.json();
        setInventory(iData.items || []);
      }
      if (subsRes.ok) {
        const sData = await subsRes.json();
        setSubscriptions(sData.subscriptions || []);
      }
      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Quick switch product selection to update tier
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.tiers.length > 0) {
      setSelectedTierId(prod.tiers[0].id);
    }
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleApproveOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    setActionSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "approve" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccessMsg(`✅ Commande #${orderId} validée ! Les identifiants sont maintenant activés.`);
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "completed", paymentStatus: "verified" } : o))
        );
        loadAdminData();
      } else {
        alert(data.error || "Échec de validation de la commande");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm("Voulez-vous vraiment rejeter cette commande et libérer les identifiants ?")) {
      return;
    }
    setProcessingOrderId(orderId);
    setActionSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "reject" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccessMsg(`⚠️ Commande #${orderId} rejetée. Les stocks ont été restaurés.`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "refunded", paymentStatus: "rejected" } : o))
        );
        loadAdminData();
      } else {
        alert(data.error || "Échec du rejet");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim() || !selectedProductId || !selectedTierId) return;

    setIsImporting(true);
    setImportStatus(null);

    const lines = bulkText.split("\n").filter((l) => l.trim().length > 0);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk",
          productId: selectedProductId,
          tierId: selectedTierId,
          bulkEntries: lines,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportStatus(`✅ Successfully added ${data.count} new account credentials to the Vault!`);
        setBulkText("");
        loadAdminData();
      } else {
        setImportStatus(`❌ Import failed: ${data.error}`);
      }
    } catch {
      setImportStatus("❌ Network error during import");
    } finally {
      setIsImporting(false);
    }
  };

  // If not logged in as Admin, show 1-click admin login prompt
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4 shadow-xl shadow-purple-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Admin Control Portal</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This area is restricted to Vault Administrators. You can sign in using the administrator credentials.
        </p>

        <button
          onClick={async () => {
            await login("gacemfouzi1@gmail.com", "Evetgac3214.");
          }}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          Connexion Super-Admin Rapide (gacemfouzi1@gmail.com)
        </button>

        <div className="mt-4">
          <Link href="/" className="text-xs text-slate-500 hover:text-white transition-colors">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending_verification" || o.paymentStatus === "pending_review"
  ).length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "pending") {
      return o.status === "pending_verification" || o.paymentStatus === "pending_review";
    }
    if (orderFilter === "completed") {
      return o.status === "completed" && o.paymentStatus !== "pending_review";
    }
    if (orderFilter === "refunded") {
      return o.status === "refunded";
    }
    return true;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vault Inventory & Verification Operations
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Chiffre d&apos;Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {formatCurrency(stats?.totalRevenue ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Volume brut des ventes
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold">Paiements à Vérifier</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            {pendingOrdersCount}
          </div>
          <div className="text-[11px] text-amber-300/80 font-mono mt-1">
            BaridiMob, CCP & Binance en attente
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Comptes en Stock Prêts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
            {stats?.availableStock ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Prêts pour allocation instantanée
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Abonnements Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-2">
            {stats?.activeSubscriptions ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Comptes clients sous garantie
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Stock & Importation
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>Commandes & Vérifications ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold animate-pulse">
              {pendingOrdersCount} à valider
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "inventory"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Comptes du Coffre ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "subscriptions"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Abonnements Clients ({subscriptions.length})
        </button>
      </div>

      {/* Tab: Orders & Verification (Primary Algerie Payment Workflow) */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 mr-2">
                <Filter className="w-3.5 h-3.5" /> Filtrer :
              </span>
              <button
                onClick={() => setOrderFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orderFilter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Toutes ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter("pending")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  orderFilter === "pending"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 text-amber-400 hover:bg-amber-950/40"
                }`}
              >
                <span>En attente de vérification</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono">
                  {pendingOrdersCount}
                </span>
              </button>
              <button
                onClick={() => setOrderFilter("completed")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orderFilter === "completed"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Validées ({orders.filter((o) => o.status === "completed").length})
              </button>
              <button
                onClick={() => setOrderFilter("refunded")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orderFilter === "refunded"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Rejetées ({orders.filter((o) => o.status === "refunded").length})
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Affichage de {filteredOrders.length} commande(s)
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 text-xs">
              Aucune commande trouvée pour ce filtre.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const isPending = ord.status === "pending_verification" || ord.paymentStatus === "pending_review";
                const isApproved = ord.status === "completed" && ord.paymentStatus === "verified";
                const isRejected = ord.status === "refunded";

                return (
                  <div
                    key={ord.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all ${
                      isPending
                        ? "border-amber-500/50 bg-amber-950/10 shadow-lg shadow-amber-500/5"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold text-sm">
                            #{ord.id}
                          </span>

                          {/* Payment Method Badge */}
                          {ord.paymentMethod === "baridimob" && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1 font-mono">
                              <Smartphone className="w-3.5 h-3.5" /> BaridiMob RIP
                            </span>
                          )}
                          {ord.paymentMethod === "ccp" && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-blue-950 border border-blue-500/40 text-blue-300 font-bold text-[11px] flex items-center gap-1 font-mono">
                              <Landmark className="w-3.5 h-3.5" /> Mandat CCP
                            </span>
                          )}
                          {ord.paymentMethod === "binance" && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-yellow-950 border border-yellow-500/40 text-yellow-400 font-bold text-[11px] flex items-center gap-1 font-mono">
                              <Coins className="w-3.5 h-3.5" /> Binance USDT
                            </span>
                          )}
                          {ord.paymentMethod === "card" && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 font-bold text-[11px] flex items-center gap-1 font-mono">
                              <CreditCard className="w-3.5 h-3.5" /> Carte Bancaire
                            </span>
                          )}

                          {/* Status Badge */}
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase font-mono tracking-wide flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" /> À Vérifier
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] uppercase font-mono tracking-wide flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Validé & Livré
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/40 font-bold text-[10px] uppercase font-mono tracking-wide flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Rejeté
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                          <span className="text-white font-semibold">{ord.userName}</span>
                          <span className="text-slate-400">({ord.userEmail})</span>
                          <span className="text-slate-500 font-mono">
                            • {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-left lg:text-right">
                        <span className="text-xl font-black font-mono text-emerald-400 block">
                          {formatCurrency(ord.total)}
                        </span>
                        {ord.paymentMethod === "binance" && (
                          <span className="text-xs font-mono text-yellow-400">
                            ≈ {(ord.total / 240).toFixed(2)} USDT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Submitted Payment Proof Details */}
                    <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono">
                      <div className="md:col-span-8 space-y-2">
                        {/* Transaction ID / Receipt Proof Box */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span>Preuve / Référence de paiement soumise par le client :</span>
                            {ord.paymentProofRef && (
                              <button
                                onClick={() => copyToClipboard(`proof_${ord.id}`, ord.paymentProofRef || "")}
                                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                              >
                                {copiedKey === `proof_${ord.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copié !</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copier la référence</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="text-sm font-bold text-white select-all break-all tracking-wide">
                            {ord.paymentProofRef || "Aucune référence saisie (Paiement direct)"}
                          </div>
                        </div>

                        {/* Sender info & Notes */}
                        {(ord.paymentSenderInfo || ord.paymentNotes) && (
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 text-[11px]">
                            {ord.paymentSenderInfo && (
                              <div>
                                <span className="text-slate-400">Détails expéditeur : </span>
                                <span className="text-slate-200 font-semibold">{ord.paymentSenderInfo}</span>
                              </div>
                            )}
                            {ord.paymentNotes && (
                              <div>
                                <span className="text-slate-400">Remarque client : </span>
                                <span className="text-cyan-300">{ord.paymentNotes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 font-sans">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Articles Commandés :
                        </span>
                        <div className="space-y-1.5">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold text-white">{item.productName}</span>
                              <span className="text-[11px] text-cyan-300 block font-mono">
                                {item.durationLabel} • Qté {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Gateway ID: {ord.paymentId}
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleRejectOrder(ord.id)}
                              disabled={processingOrderId === ord.id}
                              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeter
                            </button>

                            <button
                              onClick={() => handleApproveOrder(ord.id)}
                              disabled={processingOrderId === ord.id}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {processingOrderId === ord.id
                                ? "Validation en cours..."
                                : "Valider le Paiement & Activer les Identifiants"}
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Paiement vérifié • Identifiants débloqués</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Overview & Bulk Import */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Bulk Account Uploader */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Bulk Account Credential Importer
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add fresh accounts into the vault for automated instant delivery. Format one account per line:
                <code className="block mt-1 p-2 rounded bg-slate-950 font-mono text-[11px] text-cyan-400 border border-white/5">
                  email:password:profile_or_pin_info
                </code>
              </p>

              <form onSubmit={handleBulkImport} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Target Product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Target Duration Tier
                    </label>
                    <select
                      value={selectedTierId}
                      onChange={(e) => setSelectedTierId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {selectedProduct?.tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.durationLabel} ({formatCurrency(t.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Paste Account List
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder={`gemini_pro_vip1@domain.com:Password992!:Main + 5 Membres\ncanva_edu_invite@domain.com:Password441!:Invitation Edu 2 Ans`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono border border-white/10">
                    {importStatus}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isImporting}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? "Injecting Into Vault..." : "Inject Accounts Into Vault"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Stock Breakdown by Product */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-4">
                Real-Time Stock Breakdown
              </h3>

              <div className="space-y-3">
                {stats?.inventorySummary?.map((item: any) => {
                  const isLow = item.stock <= 1;
                  return (
                    <div
                      key={item.productId}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                            isLow
                              ? "bg-rose-950/80 text-rose-400 border border-rose-500/30"
                              : "bg-cyan-950/80 text-cyan-400 border border-cyan-500/30"
                          }`}
                        >
                          {item.stock} Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Inventory List */}
      {activeTab === "inventory" && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-white">
              Vault Items Catalog ({inventory.length} total)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-white/5 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Email / Account ID</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-slate-500">{item.id.slice(0, 10)}</td>
                    <td className="py-3 px-4 text-white font-sans font-semibold">
                      {products.find((p) => p.id === item.productId)?.name || item.productId}
                    </td>
                    <td className="py-3 px-4 text-cyan-300">{item.accountEmail}</td>
                    <td className="py-3 px-4">{item.accountPassword}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          item.status === "available"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-white/10"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.assignedToUserId ? item.assignedToUserId : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Subscriptions */}
      {activeTab === "subscriptions" && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-white">
              All Active Client Subscriptions ({subscriptions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-white/5 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Subscription ID</th>
                  <th className="py-3 px-4">Customer Email</th>
                  <th className="py-3 px-4">Product & Tier</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4">Auto-Renew</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-slate-500">{sub.id}</td>
                    <td className="py-3 px-4 text-white font-sans font-medium">
                      {sub.userEmail}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-sans">
                      {sub.productName} ({sub.durationLabel})
                    </td>
                    <td className="py-3 px-4">
                      {new Date(sub.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={sub.autoRenew ? "text-cyan-400" : "text-slate-500"}>
                        {sub.autoRenew ? "ENABLED" : "DISABLED"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          sub.status === "active"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : sub.status === "pending_activation"
                            ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-white/10"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
