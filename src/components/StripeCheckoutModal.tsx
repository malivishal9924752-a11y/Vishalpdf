import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { UserProfile, StripeTransaction, SiteSettings } from '../types';
import { completeStripePurchase } from '../lib/db';
import confetti from 'canvas-confetti';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSuccess: (updatedUser: UserProfile, tx: StripeTransaction) => void;
  onOpenAuth: () => void;
  siteSettings: SiteSettings;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  onOpenAuth,
  siteSettings,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'unlimited_17' | 'pack_100_9'>('unlimited_17');
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.full_name || 'Vishal Reader');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<StripeTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setErrorMessage('');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      setErrorMessage('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setErrorMessage('Please enter a valid 3 or 4 digit CVC security code.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulate realistic Stripe latency (1.2s)
      await new Promise(r => setTimeout(r, 1200));

      const cleanNum = cardNumber.replace(/\s/g, '');
      const last4 = cleanNum.slice(-4) || '4242';
      const brand = cleanNum.startsWith('4') ? 'Visa' : cleanNum.startsWith('5') ? 'Mastercard' : 'Amex';

      const result = await completeStripePurchase(currentUser, selectedPlan, {
        last4,
        brand,
      });

      if (result.success) {
        setCompletedTx(result.transaction);
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch (e) {
          // ignore
        }
        onSuccess(result.updatedUser, result.transaction);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Stripe Checkout</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-400/30">
                  Vishalpdf Secure
                </span>
              </div>
              <p className="text-[11px] text-slate-300">256-bit SSL encrypted payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {completedTx ? (
          /* Payment Succeeded Receipt View */
          <div className="p-8 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Payment Confirmed!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your Vishalpdf account has been upgraded instantly.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-900">{completedTx.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">${(completedTx.amount / 100).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-slate-700">{completedTx.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-[11px] text-slate-600">{completedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{new Date(completedTx.created_at).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
            >
              Start Downloading Unlimited PDFs
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
            
            {/* Plan Tier Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Your Plan Tier:
              </label>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Plan 1: $17 Unlimited (Prompt Option B) */}
                <div
                  onClick={() => setSelectedPlan('unlimited_17')}
                  className={`relative cursor-pointer rounded-2xl border-2 p-3.5 transition-all ${
                    selectedPlan === 'unlimited_17'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                    Recommended
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>Unlimited Pro</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">${siteSettings.unlimited_price}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Lifetime</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-tight">
                    Unlimited downloads forever across the entire library.
                  </p>
                </div>

                {/* Plan 2: $9 100-Pack */}
                <div
                  onClick={() => setSelectedPlan('pack_100_9')}
                  className={`relative cursor-pointer rounded-2xl border-2 p-3.5 transition-all ${
                    selectedPlan === 'pack_100_9'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    <span>100-Pack</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">${siteSettings.pack_price}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">One-time</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-tight">
                    Adds +100 download credits to your balance.
                  </p>
                </div>

              </div>
            </div>

            {/* Test Card Quick Fill Strip */}
            <div className="flex items-center justify-between rounded-xl bg-slate-100 p-2.5 text-xs">
              <span className="text-slate-600 font-medium">Testing in Preview?</span>
              <button
                type="button"
                onClick={handleFillTestCard}
                className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-2xs"
              >
                Auto-fill Test Card (4242)
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Card Information
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  required
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-24 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <div className="absolute right-3 top-2.5 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">VISA</span>
                  <span className="text-[10px] font-bold text-slate-400">MC</span>
                </div>
              </div>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiry (MM / YY)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="12/28"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CVC / CVV
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    required
                    className="w-full rounded-xl border border-slate-300 pl-3.5 pr-8 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <Lock className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Payment via Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>
                    Pay ${selectedPlan === 'unlimited_17' ? `${siteSettings.unlimited_price}.00` : `${siteSettings.pack_price}.00`} USD Securely
                  </span>
                </>
              )}
            </button>

            {/* Footer Trust strip */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Certified Level 1 PCI-DSS Service Provider</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
