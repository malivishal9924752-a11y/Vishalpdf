import React from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Download, 
  UploadCloud, 
  Lock, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { UserProfile, SiteSettings } from '../types';

interface PricingSectionProps {
  currentUser: UserProfile | null;
  onOpenStripe: () => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  siteSettings: SiteSettings;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  currentUser,
  onOpenStripe,
  onOpenUpload,
  onOpenAuth,
  siteSettings,
}) => {
  return (
    <div className="py-16 bg-slate-50/50 border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 mb-3 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
            <span>Fair & Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Start Free, Earn via Community, or Go Unlimited
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Every user starts with {siteSettings.starter_free_credits} free downloads. Keep earning credits by uploading unique PDFs, or unlock lifetime unlimited access for just ${siteSettings.unlimited_price}.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Free Starter Tier */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-7 border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Starter Tier
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Default
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">$0</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">Free Forever</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Granted instantly when signing in with Google.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span><strong>{siteSettings.starter_free_credits} Free PDF Downloads</strong> at signup</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Full access to search & browse catalog</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>In-browser PDF preview reader</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>SHA-256 duplicate verification</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              {currentUser ? (
                <div className="rounded-xl bg-slate-50 p-2.5 text-center text-xs font-medium text-slate-600">
                  Current Balance: <strong>{currentUser.download_credits} credits</strong>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full rounded-xl border-2 border-slate-200 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Sign in with Google (Get {siteSettings.starter_free_credits} Free)
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Earn-Via-Upload Tier */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-b from-indigo-50/60 to-white p-7 border-2 border-indigo-200 shadow-sm relative">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Community Contributor
                </span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  Earn Credits
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-indigo-900">Upload {siteSettings.uploads_per_credit}</span>
                <span className="text-xs font-bold text-indigo-600 uppercase">= 1 Free Credit</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Share books and research to keep downloading for free!
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span><strong>+1 Download Credit</strong> for every {siteSettings.uploads_per_credit} unique uploads</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Zero cash cost — 100% community powered</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Strict anti-duplicate SHA-256 algorithm</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Automated credit balance increment trigger</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-100">
              <button
                onClick={onOpenUpload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload a PDF Now</span>
              </button>
            </div>
          </div>

          {/* Card 3: $17 (or dynamic price) Unlimited Lifetime (Featured) */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-7 text-white shadow-xl relative border-2 border-amber-400">
            {/* Best Value Badge */}
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Unlimited Pro
                </span>
                <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-white">${siteSettings.unlimited_price}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase">One-Time / Lifetime</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Single payment. Never worry about quotas again.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span><strong>Unlimited Lifetime Downloads</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Zero download throttling or daily quotas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Instant access to newly uploaded releases</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>256-bit encrypted Stripe checkout</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800">
              {currentUser?.is_unlimited ? (
                <div className="rounded-xl bg-amber-400/20 border border-amber-400/30 p-2.5 text-center text-xs font-bold text-amber-300">
                  👑 Unlimited Plan Active
                </div>
              ) : (
                <button
                  onClick={onOpenStripe}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-400/25 hover:from-amber-300 hover:to-orange-300 transition-all active:scale-[0.98]"
                >
                  <Zap className="h-4 w-4 fill-slate-950" />
                  <span>Unlock Unlimited for ${siteSettings.unlimited_price}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
