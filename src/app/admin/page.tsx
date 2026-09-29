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
  Copy 
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function AdminPage() {
  const { user, login } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "subscriptions" | "orders">("overview");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const [overviewRes, productsRes, inventoryRes, subsRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/products"),
        fetch("/api/admin/inventory"),
        fetch("/api/admin/subscriptions"),
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
            Vault Inventory & Subscription Operations
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Vault Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {formatCurrency(stats?.totalRevenue ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Gross platform volume
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {stats?.activeSubscriptions ?? 0}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            Live client leases
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Available Vault Stock</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-2">
            {stats?.availableStock ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Ready for instant auto-release
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-2">
            {stats?.totalCustomers ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Active customer accounts
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Stock Overview & Import
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "inventory"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Vault Items ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "subscriptions"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Customer Subscriptions ({subscriptions.length})
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "orders"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Recent Transactions
        </button>
      </div>

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
                    placeholder={`netflix_slot44@domain.com:Password992!:Profile 4 [PIN 8821]\nnetflix_slot45@domain.com:Password441!:Profile 2 [PIN 1928]`}
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
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase">
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

      {/* Tab: Orders */}
      {activeTab === "orders" && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-white">
              Platform Transaction Logs
            </h3>
          </div>

          <div className="divide-y divide-white/5">
            {stats?.recentOrders?.map((ord: Order) => (
              <div key={ord.id} className="p-5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-cyan-400 font-bold">#{ord.id}</span>
                  <p className="text-white font-sans font-medium mt-0.5">
                    {ord.userName} ({ord.userEmail})
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {ord.items.map((i) => i.productName).join(", ")}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-400 block">
                    {formatCurrency(ord.total)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {ord.paymentMethod.toUpperCase()} • {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
