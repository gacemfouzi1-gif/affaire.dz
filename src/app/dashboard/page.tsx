"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Subscription, Order } from "@/types";
import { 
  Zap, 
  ShieldCheck, 
  Key, 
  Clock, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ShoppingBag, 
  AlertCircle, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  Lock, 
  Layers, 
  ArrowRight, 
  DollarSign 
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"subscriptions" | "vault" | "orders">("subscriptions");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Masking & copy states
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [updatingSubId, setUpdatingSubId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoadingData(true);
      try {
        const [subsRes, ordersRes] = await Promise.all([
          fetch("/api/user/subscriptions"),
          fetch("/api/user/orders"),
        ]);

        if (subsRes.ok) {
          const subsData = await subsRes.json();
          setSubscriptions(subsData.subscriptions || []);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      loadDashboardData();
    } else {
      setLoadingData(false);
    }
  }, [user]);

  const togglePassword = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  const handleToggleAutoRenew = async (subId: string) => {
    setUpdatingSubId(subId);
    try {
      const res = await fetch("/api/user/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subId,
          action: "toggle_autorenew",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, autoRenew: data.autoRenew } : s))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingSubId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl shadow-cyan-500/10">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Subscriber Vault Access</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Please log in to your SubVault account to view and manage your active subscriptions, reveal digital credentials, and track your renewals.
        </p>

        <div className="w-full space-y-3">
          <Link
            href="/login"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            Sign In with Email
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full py-3 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-white font-medium text-xs flex items-center justify-center"
          >
            Create New Account
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const estimatedSavings = subscriptions.length * 48; // Estimated average savings

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Subscriber Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-slate-400">
              Manage your credentials, auto-renewals, and instant replacements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse More Subscriptions
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Active Subscriptions</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {activeSubs.length}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              100% Operational
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Vault Credentials</span>
              <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              {subscriptions.length}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Encrypted & Unlocked
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Estimated Annual Savings</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
              {formatCurrency(estimatedSavings)}+
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              vs. Standard Retail
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Warranty Status</span>
              <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-2">
              Active
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Full Replacement Protection
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "subscriptions"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          Active Subscriptions ({subscriptions.length})
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "vault"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Key className="w-4 h-4" />
          Digital Vault Passwords
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Order History ({orders.length})
        </button>
      </div>

      {/* Tab 1: Active Subscriptions */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          {loadingData ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-900/40 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel border border-white/10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No active subscriptions yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore our catalog to purchase digital accounts with instant automated delivery.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => {
                const expires = new Date(sub.expiresAt);
                const now = new Date();
                const diffDays = Math.max(
                  0,
                  Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                );

                return (
                  <div
                    key={sub.id}
                    className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 hover:border-cyan-500/40 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                            {sub.durationLabel}
                          </span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {sub.productName}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400 block">
                          {diffDays} Days Left
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Expires {expires.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(10, (diffDays / 90) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Credentials Preview Box */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">User:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-300 font-semibold select-all">
                            {sub.accountEmail}
                          </span>
                          <button
                            onClick={() => copyText(`dash_sub_email_${sub.id}`, sub.accountEmail)}
                            className="p-1 hover:text-white text-slate-400"
                            title="Copy email"
                          >
                            {copiedStates[`dash_sub_email_${sub.id}`] ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Pass:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-semibold select-all">
                            {revealedPasswords[sub.id] ? sub.accountPassword : "••••••••••••"}
                          </span>
                          <button
                            onClick={() => togglePassword(sub.id)}
                            className="p-1 hover:text-white text-slate-400"
                            title="Reveal password"
                          >
                            {revealedPasswords[sub.id] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyText(`dash_sub_pass_${sub.id}`, sub.accountPassword)}
                            className="p-1 hover:text-white text-slate-400"
                            title="Copy password"
                          >
                            {copiedStates[`dash_sub_pass_${sub.id}`] ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {sub.additionalInfo && (
                        <div className="pt-1.5 border-t border-white/5 text-[11px] text-amber-300 flex items-center justify-between">
                          <span className="truncate pr-2">{sub.additionalInfo}</span>
                          <button
                            onClick={() => copyText(`dash_sub_info_${sub.id}`, sub.additionalInfo || "")}
                            className="p-1 hover:text-white text-slate-400 flex-shrink-0"
                            title="Copy instructions"
                          >
                            {copiedStates[`dash_sub_info_${sub.id}`] ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Auto-renew and Warranty Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAutoRenew(sub.id)}
                          disabled={updatingSubId === sub.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                            sub.autoRenew
                              ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
                              : "bg-slate-900 border-white/10 text-slate-400"
                          }`}
                        >
                          <RefreshCw className={`w-3 h-3 ${updatingSubId === sub.id ? "animate-spin" : ""}`} />
                          <span>Auto-Renew: {sub.autoRenew ? "ON" : "OFF"}</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Warranty Protected
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Digital Vault */}
      {activeTab === "vault" && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Encrypted Credentials Table
              </h3>
              <p className="text-xs text-slate-400">
                Direct view of all usernames, passwords, and profile pins in your personal vault.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-white/5 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Tier Duration</th>
                  <th className="py-3.5 px-4">Account Email / Username</th>
                  <th className="py-3.5 px-4">Password</th>
                  <th className="py-3.5 px-4">Profile & Instructions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-white">
                      {sub.productName}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400">
                      {sub.durationLabel}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 select-all">{sub.accountEmail}</span>
                        <button
                          onClick={() => copyText(`vault_tbl_email_${sub.id}`, sub.accountEmail)}
                          className="hover:text-cyan-400 text-slate-500"
                        >
                          {copiedStates[`vault_tbl_email_${sub.id}`] ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white select-all">
                          {revealedPasswords[sub.id] ? sub.accountPassword : "••••••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(sub.id)}
                          className="hover:text-cyan-400 text-slate-500"
                        >
                          {revealedPasswords[sub.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => copyText(`vault_tbl_pass_${sub.id}`, sub.accountPassword)}
                          className="hover:text-cyan-400 text-slate-500"
                        >
                          {copiedStates[`vault_tbl_pass_${sub.id}`] ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {sub.additionalInfo || "Standard Access"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Order History */}
      {activeTab === "orders" && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Receipts & Order Records
            </h3>
          </div>

          <div className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No previous order transactions found.
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        #{ord.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {ord.items.map((i) => `${i.productName} (${i.durationLabel})`).join(", ")}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {new Date(ord.createdAt).toLocaleString()} • Paid via {ord.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-white block">
                        {formatCurrency(ord.total)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Livraison Automatique
                      </span>
                    </div>

                    <Link
                      href={`/order-success/${ord.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-white/10"
                    >
                      View Credentials
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
