"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  ExternalLink,
  Key,
  Mail
} from "lucide-react";

interface RevealedCredential {
  productId: string;
  productName: string;
  tierLabel: string;
  accountEmail: string;
  accountPassword: string;
  additionalInfo?: string;
  licenseKey?: string;
  expiresAt: string;
  warrantyUntil: string;
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const [credentials, setCredentials] = useState<RevealedCredential[]>([]);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: number]: boolean }>({});
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#3b82f6", "#10b981", "#ffffff"],
      });
    } catch {
      // Ignored if canvas-confetti fails in test environment
    }

    // Load from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`subvault_order_${orderId}`);
      if (stored) {
        try {
          setCredentials(JSON.parse(stored));
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fallback: mock delivery credentials for testing
    setCredentials([
      {
        productId: "prod_netflix",
        productName: "Netflix Premium 4K UHD",
        tierLabel: "3 Months",
        accountEmail: "vault_stream_vip82@subvault-stream.com",
        accountPassword: "CinemaVault#2026!",
        additionalInfo: "Profile: Profile 2 [VIP] | PIN: 9021 | 4K HDR enabled",
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
        warrantyUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    ]);
  }, [orderId]);

  const togglePasswordReveal = (idx: number) => {
    setRevealedPasswords((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Top Banner Celebration */}
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Automated Delivery Complete • Order #{orderId}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Payment Successful & Credentials Unlocked!
        </h1>

        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Your digital account is active. Below are your private login credentials, profile instructions, and warranty details.
        </p>
      </div>

      {/* Allocated Credentials Cards */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Your Private Credential Vault
          </h2>
          <span className="text-xs text-slate-400">
            {credentials.length} {credentials.length === 1 ? "Account" : "Accounts"} Ready
          </span>
        </div>

        {credentials.map((cred, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {cred.tierLabel} Tier
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {cred.productName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Warranty Active
                </span>
              </div>
            </div>

            {/* Secret Payload Fields */}
            <div className="py-5 space-y-4">
              {/* Email / Username */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Account Email / Username
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="font-mono text-sm text-cyan-300 font-bold select-all truncate mr-3">
                    {cred.accountEmail}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`email_${idx}`, cred.accountEmail)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
                    title="Copy Email"
                  >
                    {copiedStates[`email_${idx}`] ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Account Password
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                  <span className="font-mono text-sm text-white font-bold select-all truncate mr-3">
                    {revealedPasswords[idx]
                      ? cred.accountPassword
                      : "••••••••••••••••"}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => togglePasswordReveal(idx)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title={revealedPasswords[idx] ? "Hide Password" : "Show Password"}
                    >
                      {revealedPasswords[idx] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`pass_${idx}`, cred.accountPassword)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Copy Password"
                    >
                      {copiedStates[`pass_${idx}`] ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Profile Info / PIN / License Key */}
              {cred.additionalInfo && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Profile & Access Instructions
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/10">
                    <span className="font-mono text-xs text-amber-300 font-medium select-all truncate mr-3">
                      {cred.additionalInfo}
                    </span>
                    <button
                      onClick={() => copyToClipboard(`info_${idx}`, cred.additionalInfo || "")}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
                      title="Copy Instructions"
                    >
                      {copiedStates[`info_${idx}`] ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom info banner */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>
                  Replacement warranty active until{" "}
                  <strong className="text-white">
                    {new Date(cred.warrantyUntil).toLocaleDateString()}
                  </strong>
                </span>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                Stored permanently in your Customer Dashboard
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation & Email Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/20">
            <Mail className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-300">
            A confirmation receipt and encrypted backup copy have also been archived in your Subscriber Dashboard.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          Open Subscriber Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
