import React from 'react';
import { 
  X, 
  AlertCircle, 
  UploadCloud, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Zap, 
  FileText
} from 'lucide-react';
import { UserProfile, Book, SiteSettings } from '../types';

interface QuotaActionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  attemptedBook: Book | null;
  onChooseUpload: () => void;
  onChooseUnlock: () => void;
  siteSettings: SiteSettings;
}

export const QuotaActionRequiredModal: React.FC<QuotaActionRequiredModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  attemptedBook,
  onChooseUpload,
  onChooseUnlock,
  siteSettings,
}) => {
  if (!isOpen) return null;

  const currentUploads = currentUser.upload_count || 0;
  const ratio = siteSettings.uploads_per_credit || 2;
  const progressTowardsCredit = currentUploads % ratio;
  const uploadsNeeded = ratio - progressTowardsCredit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-xs">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Action Required
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Download Quota Limit Reached (0 Credits Left)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Attempted Book Context */}
        {attemptedBook && (
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="truncate max-w-md">
              Target Download: <strong className="text-slate-900">"{attemptedBook.title}"</strong>
            </span>
            <span className="shrink-0 text-slate-400">PDF Document</span>
          </div>
        )}

        {/* Modal Description */}
        <div className="px-6 pt-5 pb-3">
          <p className="text-sm text-slate-600">
            You have used all {siteSettings.starter_free_credits} free starter download credits. To download this document and continue accessing {siteSettings.site_name}, choose one of the two options below:
          </p>
        </div>

        {/* The Two Options Cards */}
        <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* OPTION A: EARN VIA UPLOAD */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white p-5 shadow-xs hover:border-indigo-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  Option A • 100% Free
                </span>
                <UploadCloud className="h-5 w-5 text-indigo-600" />
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Upload {ratio} New PDFs to Earn 1 Free Credit
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Contribute unique books, guides, or papers to our repository. Every {ratio} non-duplicate uploads automatically grants you 1 free download credit.
              </p>

              {/* Upload Progress Bar */}
              <div className="rounded-xl bg-white p-3 border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Upload Progress:</span>
                  <span className="font-bold text-indigo-700">{progressTowardsCredit} / {ratio} uploaded</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300" 
                    style={{ width: `${(progressTowardsCredit / ratio) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload {uploadsNeeded} more unique PDF to unlock your next download.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onChooseUpload();
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload a PDF Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* OPTION B: PAID UNLOCK VIA STRIPE */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-xs hover:border-amber-400 transition-all">
            {/* Best Value Badge */}
            <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              Instant Access
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  Option B • Stripe Checkout
                </span>
                <Sparkles className="h-5 w-5 text-amber-600 fill-amber-500" />
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">${siteSettings.unlimited_price}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">One-time / Lifetime</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Pay ${siteSettings.unlimited_price} for Unlimited Downloads
                </h3>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited lifetime downloads on any PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Zero quota restrictions or daily limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Priority fast cloud server downloads</span>
                </li>
              </ul>

              <div className="rounded-xl bg-amber-100/40 p-2 text-[11px] text-amber-900 border border-amber-200">
                Or choose ${siteSettings.pack_price} for 100-pack download credits in checkout.
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onChooseUnlock();
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 py-3 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Unlock Unlimited (${siteSettings.unlimited_price})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Secure Stripe 256-bit SSL encrypted checkout
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-medium"
          >
            Decide later
          </button>
        </div>

      </div>
    </div>
  );
};
