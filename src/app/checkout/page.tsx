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
  Smartphone,
  Landmark,
  Copy,
  Info,
  QrCode
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PaymentMethod } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, promoCode, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("baridimob");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // BaridiMob fields
  const [baridimobRef, setBaridimobRef] = useState("");
  const [baridimobSender, setBaridimobSender] = useState("");

  // CCP fields
  const [ccpRef, setCcpRef] = useState("");
  const [ccpPostOffice, setCcpPostOffice] = useState("");

  // Binance fields
  const [binanceTxId, setBinanceTxId] = useState("");
  const [binanceUser, setBinanceUser] = useState("");

  // Simulated card fields
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("789");

  // Account constants for Algeria
  const BARIDIMOB_RIP = "00799999002345678942";
  const BARIDIMOB_NAME = "GACEM FOUZI";
  const CCP_ACCOUNT = "0021345678";
  const CCP_KEY = "45";
  const CCP_NAME = "GACEM FOUZI";
  const BINANCE_PAY_ID = "849201948";
  const BINANCE_USDT_TRC20 = "TYu89P4v7bK6Z2eQx3RmF1sW9L5aT7cV3d";

  const usdtEquivalent = (total / 240).toFixed(2);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Votre panier est vide</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Sélectionnez un abonnement ou un compte numérique depuis notre catalogue pour finaliser votre commande.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
        >
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const emailToUse = user ? user.email : guestEmail;
    if (!emailToUse || !emailToUse.includes("@")) {
      setErrorMessage("Veuillez saisir une adresse email valide pour la réception de vos identifiants.");
      return;
    }

    let paymentProofRef = "";
    let paymentSenderInfo = "";

    if (paymentMethod === "baridimob") {
      if (!baridimobRef.trim()) {
        setErrorMessage("Veuillez saisir le numéro de transaction ou la référence BaridiMob.");
        return;
      }
      paymentProofRef = baridimobRef.trim();
      paymentSenderInfo = baridimobSender.trim();
    } else if (paymentMethod === "ccp") {
      if (!ccpRef.trim()) {
        setErrorMessage("Veuillez renseigner le numéro de reçu ou bordereau de mandat CCP.");
        return;
      }
      paymentProofRef = ccpRef.trim();
      paymentSenderInfo = ccpPostOffice.trim();
    } else if (paymentMethod === "binance") {
      if (!binanceTxId.trim()) {
        setErrorMessage("Veuillez renseigner le TxID (Hash de transaction) ou le Binance Pay Order ID.");
        return;
      }
      paymentProofRef = binanceTxId.trim();
      paymentSenderInfo = binanceUser.trim();
    } else if (paymentMethod === "card") {
      paymentProofRef = `Card-Sim-${cardNumber.replace(/\s+/g, "").slice(-4)}`;
    }

    setIsProcessing(true);

    try {
      setProcessingStep("1/3 Enregistrement des détails de paiement...");
      await new Promise((r) => setTimeout(r, 500));

      setProcessingStep("2/3 Allocation et réservation des identifiants dans le coffre-fort...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("3/3 Finalisation de votre commande...");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          guestEmail: emailToUse,
          guestName: user ? user.name : guestName || emailToUse.split("@")[0],
          promoCode,
          paymentProofRef,
          paymentSenderInfo,
          paymentNotes: customerNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Échec de traitement de la commande");
      }

      // Save credentials & order info into sessionStorage for display
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `subvault_order_${data.order.id}`,
          JSON.stringify(data.credentials || [])
        );
        sessionStorage.setItem(
          `subvault_order_details_${data.order.id}`,
          JSON.stringify(data.order)
        );
      }

      clearCart();
      router.push(`/order-success/${data.order.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Une erreur est survenue lors de la commande.");
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
        Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Validation de Commande</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Paiement Sécurisé Algérie</span>
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
                  Adresse de livraison des identifiants
                </h3>
                {user ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    Compte connecté
                  </span>
                ) : (
                  <Link href="/login" className="text-xs text-cyan-400 hover:underline">
                    Déjà un compte ? Se connecter
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
                      Nom complet / Pseudo
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Fouzi Gacem"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Adresse Email pour la réception du compte *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="votre.email@gmail.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Vos identifiants et clés d&apos;activation seront archivés dans votre espace personnel et envoyés à cet email.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Mode de Paiement (Algérie & Crypto)
                </h3>
                <span className="text-[11px] text-emerald-400 font-mono">0% Frais cachés</span>
              </div>

              {/* 4 Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("baridimob")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    paymentMethod === "baridimob"
                      ? "bg-amber-950/40 border-amber-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <span className="text-xs">BaridiMob</span>
                  <span className="text-[10px] text-amber-300/80 font-mono">RIP Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("ccp")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    paymentMethod === "ccp"
                      ? "bg-blue-950/40 border-blue-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Landmark className="w-5 h-5 text-blue-400" />
                  <span className="text-xs">CCP Poste</span>
                  <span className="text-[10px] text-blue-300/80 font-mono">Mandat/Versement</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("binance")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    paymentMethod === "binance"
                      ? "bg-yellow-950/40 border-yellow-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs">Binance USDT</span>
                  <span className="text-[10px] text-yellow-300/80 font-mono">Pay ID / TRC20</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    paymentMethod === "card"
                      ? "bg-cyan-950/40 border-cyan-500 shadow-md text-white font-bold"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs">Carte</span>
                  <span className="text-[10px] text-cyan-300/80 font-mono">Instant Test</span>
                </button>
              </div>

              {/* 1. BaridiMob UI */}
              {paymentMethod === "baridimob" && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        Coordonnées BaridiMob Algérie Poste
                      </span>
                      <span className="text-[11px] font-mono font-bold text-white bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
                        Montant: {formatCurrency(total)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">Numéro RIP (Relevé d&apos;Identité Postale) :</span>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-cyan-300 font-bold select-all">
                          <span className="tracking-wider">{BARIDIMOB_RIP}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("rip", BARIDIMOB_RIP)}
                            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedKey === "rip" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier RIP</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">Titulaire du compte :</span>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-white font-semibold select-all">
                          <span>{BARIDIMOB_NAME}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("baridimob_name", BARIDIMOB_NAME)}
                            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedKey === "baridimob_name" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-amber-200/90 leading-relaxed bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
                      <strong>Instructions simples :</strong> Effectuez le virement du montant exact ({formatCurrency(total)}) depuis votre application BaridiMob vers le RIP ci-dessus, puis collez ci-dessous le numéro de transaction / référence du virement.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white font-medium block mb-1">
                        Numéro de transaction / Référence BaridiMob *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: 004928174 ou référence reçue sur le reçu"
                        value={baridimobRef}
                        onChange={(e) => setBaridimobRef(e.target.value)}
                        className="w-full bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Nom de l&apos;expéditeur ou N° de téléphone BaridiMob (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: 0550123456 ou Nom Prénom de votre compte"
                        value={baridimobSender}
                        onChange={(e) => setBaridimobSender(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CCP Algérie Poste UI */}
              {paymentMethod === "ccp" && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-blue-400" />
                        Coordonnées Compte Courant Postal (CCP)
                      </span>
                      <span className="text-[11px] font-mono font-bold text-white bg-blue-900/40 px-2 py-0.5 rounded border border-blue-500/30">
                        Montant: {formatCurrency(total)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">N° Compte CCP & Clé :</span>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-cyan-300 font-bold select-all">
                          <span>{CCP_ACCOUNT} / Clé {CCP_KEY}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("ccp", `${CCP_ACCOUNT} ${CCP_KEY}`)}
                            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedKey === "ccp" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">Titulaire du compte :</span>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-white font-semibold select-all">
                          <span>{CCP_NAME}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("ccp_name", CCP_NAME)}
                            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedKey === "ccp_name" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-blue-200/90 leading-relaxed bg-blue-950/40 p-2.5 rounded-lg border border-blue-500/20">
                      <strong>Instructions :</strong> Effectuez un versement en espèces ou mandat dans n&apos;importe quel bureau de poste Algérie Poste, puis saisissez le numéro de reçu ou bordereau postal ci-dessous.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white font-medium block mb-1">
                        Numéro de reçu / Bordereau de mandat postal *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: N° de transaction ou numéro du bordereau de versement"
                        value={ccpRef}
                        onChange={(e) => setCcpRef(e.target.value)}
                        className="w-full bg-slate-900 border border-blue-500/40 focus:border-blue-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Bureau de poste ou Commune d&apos;émission (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Alger Centre, Oran, Sétif, etc."
                        value={ccpPostOffice}
                        onChange={(e) => setCcpPostOffice(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Binance USDT UI */}
              {paymentMethod === "binance" && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-yellow-500/20 pb-2.5">
                      <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        Paiement Crypto Binance USDT (0% Frais)
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-yellow-900/40 px-2 py-0.5 rounded border border-yellow-500/30">
                        Équivalent: ~ {usdtEquivalent} USDT
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">Binance Pay ID (Sans frais, instantané) :</span>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-yellow-400 font-bold select-all">
                          <span className="tracking-wider">{BINANCE_PAY_ID}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("binance_pay_id", BINANCE_PAY_ID)}
                            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            {copiedKey === "binance_pay_id" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier Pay ID</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="text-slate-400">Adresse USDT - Réseau Tron (TRC-20) :</span>
                          <span className="text-amber-400 font-bold">Réseau : TRC20</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-cyan-300 font-medium text-[11px] select-all break-all">
                          <span className="truncate mr-2">{BINANCE_USDT_TRC20}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("usdt_address", BINANCE_USDT_TRC20)}
                            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-[11px] flex-shrink-0"
                          >
                            {copiedKey === "usdt_address" ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier Adresse</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-yellow-200/90 leading-relaxed bg-yellow-950/40 p-2.5 rounded-lg border border-yellow-500/20">
                      <strong>Instructions :</strong> Envoyez le montant exact ({usdtEquivalent} USDT) via Binance Pay (Pay ID: <strong>{BINANCE_PAY_ID}</strong>) ou sur le réseau TRC-20, puis collez l&apos;identifiant de transaction (TxID) ci-dessous.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white font-medium block mb-1">
                        TxID (Transaction Hash) ou Binance Pay Order ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                        value={binanceTxId}
                        onChange={(e) => setBinanceTxId(e.target.value)}
                        className="w-full bg-slate-900 border border-yellow-500/40 focus:border-yellow-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Votre Binance ID ou pseudo expéditeur (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Fouzi_DZ ou Binance ID"
                        value={binanceUser}
                        onChange={(e) => setBinanceUser(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Simulated Card UI */}
              {paymentMethod === "card" && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300">
                    Mode test & démo instantané actif. Permet de simuler un paiement par carte bancaire (CIB, Edahabia ou Visa/Mastercard internationale).
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Numéro de carte
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
                        Date d&apos;expiration
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
                        Code CVC
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

              {/* Customer Notes */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Remarques ou instructions particulières (Optionnel)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="ex: Merci d'envoyer l'accès sur un second email, ou profil spécifique..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Complete Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                isProcessing
                  ? "bg-slate-800 text-cyan-400 cursor-wait border border-cyan-500/30"
                  : paymentMethod === "baridimob"
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-[1.01]"
                  : paymentMethod === "binance"
                  ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-yellow-500/25 hover:scale-[1.01]"
                  : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-xl shadow-cyan-500/25 hover:scale-[1.01]"
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Traitement de la commande en cours</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300/80">
                    {processingStep}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>
                    {paymentMethod === "baridimob" && `Confirmer le virement BaridiMob (${formatCurrency(total)})`}
                    {paymentMethod === "ccp" && `Valider la commande CCP (${formatCurrency(total)})`}
                    {paymentMethod === "binance" && `Valider la transaction Binance (${formatCurrency(total)} • ~${usdtEquivalent} USDT)`}
                    {paymentMethod === "card" && `Payer ${formatCurrency(total)} & Révéler le compte`}
                  </span>
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
                <div className="text-right">
                  <span className="font-mono text-cyan-400 block">{formatCurrency(total)}</span>
                  {paymentMethod === "binance" && (
                    <span className="text-[11px] font-mono text-yellow-400">≈ {usdtEquivalent} USDT</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Traitement Rapide & Coffre-Fort Sécurisé</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Vos comptes et abonnements sont réservés dès la soumission. Notre équipe valide vos virements BaridiMob, CCP et Binance 7j/7.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              Tous les achats bénéficient de la garantie de remplacement intégrale SubVault.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
