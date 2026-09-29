import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Lock, RefreshCw, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 text-slate-400 mt-auto">
      {/* Trust Badges Bar */}
      <div className="border-b border-white/5 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Instant Auto-Delivery
                </h4>
                <p className="text-xs text-slate-400">Accounts revealed in 0.5s</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/20 text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  256-Bit SSL Checkout
                </h4>
                <p className="text-xs text-slate-400">Stripe & Crypto supported</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Replacement Guarantee
                </h4>
                <p className="text-xs text-slate-400">Full warranty on every plan</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Direct Credential Vault
                </h4>
                <p className="text-xs text-slate-400">Clean, private profiles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SUB<span className="text-cyan-400">VAULT</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              The premier marketplace for premium digital subscriptions, AI tokens, streaming services, and developer tooling accounts. Instant delivery guaranteed.
            </p>
            <div className="text-xs text-slate-500 font-mono">
              Operational Status: <span className="text-emerald-400">● 99.98% Vault Inventory Online</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Catalog
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#streaming" className="hover:text-cyan-400 transition-colors">
                  Streaming & Media
                </Link>
              </li>
              <li>
                <Link href="/#ai" className="hover:text-cyan-400 transition-colors">
                  AI & Developer Accounts
                </Link>
              </li>
              <li>
                <Link href="/#vpn" className="hover:text-cyan-400 transition-colors">
                  VPN & Privacy Tools
                </Link>
              </li>
              <li>
                <Link href="/#gaming" className="hover:text-cyan-400 transition-colors">
                  Gaming Passes & Software
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Customer Hub
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Active Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=vault" className="hover:text-cyan-400 transition-colors">
                  My Credential Vault
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=orders" className="hover:text-cyan-400 transition-colors">
                  Invoices & Receipts
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Security & Policy
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="hover:text-slate-300 transition-colors cursor-pointer">
                  Warranty & Refund Policy
                </span>
              </li>
              <li>
                <span className="hover:text-slate-300 transition-colors cursor-pointer">
                  Delivery Automation Protocol
                </span>
              </li>
              <li>
                <span className="hover:text-slate-300 transition-colors cursor-pointer">
                  Privacy & Data Encryption
                </span>
              </li>
              <li>
                <span className="hover:text-slate-300 transition-colors cursor-pointer">
                  24/7 Priority Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SubVault Inc. All rights reserved. Automated Instant Delivery Engine.</p>
          <div className="flex items-center gap-4">
            <span>Encrypted Payments</span>
            <span>•</span>
            <span>Zero Log System</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">v2.4.0-stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
