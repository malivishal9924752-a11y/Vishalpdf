import React from 'react';
import { FileText, ShieldCheck, Heart, Database, Sparkles, Lock } from 'lucide-react';

interface FooterProps {
  onOpenArchitecture: () => void;
  onOpenStripe: () => void;
  onOpenUpload: () => void;
  onNavigateHome: () => void;
  onOpenDeveloperAuth?: () => void;
  isDeveloperAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenArchitecture,
  onOpenStripe,
  onOpenUpload,
  onNavigateHome,
  onOpenDeveloperAuth,
  isDeveloperAdmin,
}) => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Vishal<span className="text-indigo-600">pdf</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Curated PDF Document Library protected by cryptographic SHA-256 deduplication and backed by Supabase & Stripe.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-semibold text-slate-700">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Platform</p>
              <ul className="space-y-1.5">
                <li><button onClick={onNavigateHome} className="hover:text-indigo-600">Explore Books</button></li>
                <li><button onClick={onOpenUpload} className="hover:text-indigo-600">Upload PDF</button></li>
                <li><button onClick={onOpenStripe} className="hover:text-indigo-600">Unlock Unlimited</button></li>
              </ul>
            </div>

            {isDeveloperAdmin ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Cloud & Architecture</p>
                <ul className="space-y-1.5">
                  <li><button onClick={onOpenArchitecture} className="hover:text-indigo-600">Supabase SQL Schema</button></li>
                  <li><button onClick={onOpenArchitecture} className="hover:text-indigo-600">Google OAuth Guide</button></li>
                  <li><button onClick={onOpenArchitecture} className="hover:text-indigo-600">Storage RLS Policies</button></li>
                </ul>
              </div>
            ) : (
              onOpenDeveloperAuth && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Access</p>
                  <ul className="space-y-1.5">
                    <li>
                      <button 
                        onClick={onOpenDeveloperAuth} 
                        className="hover:text-amber-600 flex items-center gap-1 text-slate-400 hover:text-amber-500 transition-colors"
                        title="Log in as Developer to reveal Admin Panel & Cloud Architecture"
                      >
                        <Lock className="h-3 w-3" />
                        <span>Developer Access</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )
            )}
          </div>

        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>100% Cryptographically Verified SHA-256 Deduplication</span>
          </div>
          <div>
            Built with React, Next.js architecture, Supabase & Stripe
          </div>
        </div>
      </div>
    </footer>
  );
};
