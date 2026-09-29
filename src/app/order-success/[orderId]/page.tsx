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
  Clock, 
  Key,
  Mail,
  Smartphone,
  Landmark,
  Coins,
  AlertCircle
} from "lucide-react";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/format";

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

  const [order, setOrder] = useState<Order | null>(null);
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
        colors: ["#06b6d4", "#f59e0b", "#10b981", "#ffffff"],
      });
    } catch {
      // Ignored if canvas-confetti fails in test environment
    }

    // Load from sessionStorage
    if (typeof window !== "undefined") {
      const storedCreds = sessionStorage.getItem(`subvault_order_${orderId}`);
      if (storedCreds) {
        try {
          setCredentials(JSON.parse(storedCreds));
        } catch (e) {
          console.error(e);
        }
      }

      const storedOrder = sessionStorage.getItem(`subvault_order_details_${orderId}`);
      if (storedOrder) {
        try {
          setOrder(JSON.parse(storedOrder));
        } catch (e) {
          console.error(e);
        }
      }
    }
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

  const isManualPayment = order?.paymentMethod === "baridimob" || 
                          order?.paymentMethod === "ccp" || 
                          order?.paymentMethod === "binance";

  const getMethodBadge = () => {
    if (order?.paymentMethod === "baridimob") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          Paiement BaridiMob (Algérie Poste)
        </span>
      );
    }
    if (order?.paymentMethod === "ccp") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold">
          <Landmark className="w-3.5 h-3.5" />
          Versement Mandat CCP
        </span>
      );
    }
    if (order?.paymentMethod === "binance") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/80 border border-yellow-500/40 text-yellow-400 text-xs font-semibold">
          <Coins className="w-3.5 h-3.5" />
          Paiement Binance USDT (TRC-20)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
        <Zap className="w-3.5 h-3.5" />
        Paiement Instantané
      </span>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Top Banner Celebration */}
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {getMethodBadge()}
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono">
            Commande #{orderId}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isManualPayment ? "Commande Enregistrée avec Succès !" : "Paiement Validé & Identifiants Débloqués !"}
        </h1>

        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {isManualPayment ? (
            <>Votre reçu de paiement a été transmis à notre équipe d&apos;administration. Vos accès sont réservés et seront activés sous peu.</>
          ) : (
            <>Votre compte numérique est actif. Retrouvez ci-dessous vos identifiants de connexion, profils et détails de garantie.</>
          )}
        </p>
      </div>

      {/* Manual Verification Info Banner (BaridiMob / CCP / Binance) */}
      {isManualPayment && (
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Statut : En cours de validation par l&apos;administrateur
                </h3>
                <p className="text-xs text-slate-400">
                  Délai moyen de vérification : 5 à 15 minutes (7j/7)
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30 uppercase">
              Vérification en cours
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
              <span className="text-slate-400 text-[11px] block">Référence de paiement fournie :</span>
              <span className="text-white font-bold select-all break-all">
                {order?.paymentProofRef || "Référence enregistrée"}
              </span>
            </div>

            {order?.paymentSenderInfo && (
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">Informations expéditeur :</span>
                <span className="text-white font-bold select-all">
                  {order.paymentSenderInfo}
                </span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
              <span className="text-slate-400 text-[11px] block">Montant de la commande :</span>
              <span className="text-emerald-400 font-bold">
                {order ? formatCurrency(order.total) : "—"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
              <span className="text-slate-400 text-[11px] block">Email de réception :</span>
              <span className="text-cyan-300 font-bold select-all">
                {order?.userEmail || "Votre adresse email"}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-white/5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Dès confirmation du virement par notre administrateur, votre abonnement basculera en <strong>Actif</strong> et vos identifiants complets vous seront également envoyés par email. Vous pouvez également suivre le statut en direct dans votre espace client.
            </p>
          </div>
        </div>
      )}

      {/* Allocated Credentials Cards (Instant card or preview for user) */}
      {credentials.length > 0 && (
        <div className="space-y-6 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              {isManualPayment ? "Aperçu de vos comptes réservés" : "Vos identifiants privés"}
            </h2>
            <span className="text-xs text-slate-400">
              {credentials.length} {credentials.length === 1 ? "Compte" : "Comptes"}
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
                    Garantie Active
                  </span>
                </div>
              </div>

              {/* Secret Payload Fields */}
              <div className="py-5 space-y-4">
                {/* Email / Username */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Identifiant / Email du compte
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                    <span className="font-mono text-sm text-cyan-300 font-bold select-all truncate mr-3">
                      {cred.accountEmail}
                    </span>
                    <button
                      onClick={() => copyToClipboard(`email_${idx}`, cred.accountEmail)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
                      title="Copier Email"
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
                    Mot de passe
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                    <span className="font-mono text-sm text-white font-bold select-all truncate mr-3">
                      {isManualPayment && !revealedPasswords[idx]
                        ? "•••••••••••••••• (Disponible après validation)"
                        : revealedPasswords[idx]
                        ? cred.accountPassword
                        : "••••••••••••••••"}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => togglePasswordReveal(idx)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title={revealedPasswords[idx] ? "Masquer" : "Afficher"}
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
                        title="Copier mot de passe"
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
                      Instructions & Profil assigné
                    </label>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/10">
                      <span className="font-mono text-xs text-amber-300 font-medium select-all truncate mr-3">
                        {cred.additionalInfo}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`info_${idx}`, cred.additionalInfo || "")}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
                        title="Copier Instructions"
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
                    Garantie de remplacement active jusqu&apos;au{" "}
                    <strong className="text-white">
                      {new Date(cred.warrantyUntil).toLocaleDateString()}
                    </strong>
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  Enregistré dans votre Coffre-Fort Client
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Email Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/20">
            <Mail className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-300">
            Un accusé de réception et les informations de suivi sont enregistrés sur votre compte SubVault.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          Accéder à mon Espace Client
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
