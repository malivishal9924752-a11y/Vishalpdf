import React from 'react';
import { Search, Sparkles, ShieldCheck, UploadCloud, Download, Check, X } from 'lucide-react';
import { BookCategory, SiteSettings } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: BookCategory;
  onCategoryChange: (cat: BookCategory) => void;
  totalBooksCount: number;
  onOpenUpload: () => void;
  onOpenStripe: () => void;
  siteSettings: SiteSettings;
}

const CATEGORIES: BookCategory[] = [
  'All',
  'Computer Science',
  'Artificial Intelligence',
  'Engineering',
  'Mathematics',
  'Business & Finance',
  'Self Development',
  'Science',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalBooksCount,
  onOpenUpload,
  onOpenStripe,
  siteSettings,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-10 pb-12 border-b border-slate-200/60">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-tr from-indigo-200/40 via-sky-200/30 to-purple-200/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Dynamic Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
          {siteSettings.hero_headline || 'High-Performance PDF Library with Smart Quotas'}
        </h1>

        {/* Dynamic Hero Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
          {siteSettings.hero_subheadline || 'Explore, upload, and read verified academic, tech, and business books. Protected against duplicate uploads using cryptographic SHA-256 hashing.'}
        </p>

        {/* Central Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-lg shadow-indigo-500/5 rounded-2xl bg-white border border-slate-300/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
            <div className="pl-4 pr-2 text-slate-400">
              <Search className="h-5 w-5 text-indigo-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search books by title, author, topic, or SHA-256 hash..."
              className="w-full py-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-2 text-slate-400 hover:text-slate-600 mr-2"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="pr-3 hidden sm:block">
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {totalBooksCount} available
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20 ring-2 ring-slate-900/10'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-slate-200/70 text-left">
          
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Zero Duplicates</p>
              <p className="text-[11px] text-slate-500">SHA-256 hash checks prevent repeated uploads</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700 shrink-0">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{siteSettings.starter_free_credits} Free Downloads</p>
              <p className="text-[11px] text-slate-500">Awarded automatically upon Google Sign-in</p>
            </div>
          </div>

          <div 
            onClick={onOpenUpload}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="rounded-lg bg-sky-100 p-2 text-sky-700 shrink-0">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Earn Free Credits</p>
              <p className="text-[11px] text-slate-500">Every {siteSettings.uploads_per_credit} uploads grant +1 download</p>
            </div>
          </div>

          <div 
            onClick={onOpenStripe}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-amber-200/80 shadow-2xs cursor-pointer hover:bg-amber-50/50 transition-colors"
          >
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">${siteSettings.unlimited_price} Unlimited Pass</p>
              <p className="text-[11px] text-slate-500">Lifetime unmetered downloads via Stripe</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
