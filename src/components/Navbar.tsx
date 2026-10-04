import React from 'react';
import { UserProfile, SupabaseConfig, SiteSettings } from '../types';
import { 
  FileText, 
  Upload, 
  Download, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Database, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  Zap,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenUpload: () => void;
  onOpenDashboard: () => void;
  onOpenStripe: () => void;
  onOpenArchitecture: () => void;
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
  supabaseConfig: SupabaseConfig;
  siteSettings: SiteSettings;
  activeView: 'home' | 'dashboard' | 'pricing';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenUpload,
  onOpenDashboard,
  onOpenStripe,
  onOpenArchitecture,
  onOpenAdmin,
  onNavigateHome,
  supabaseConfig,
  siteSettings,
  activeView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Show Admin Panel ONLY when developer is logged in
  const isDeveloperAdmin = Boolean(
    currentUser && (currentUser.is_admin || currentUser.email === 'malivishal9924752@gmail.com')
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 shadow-md shadow-indigo-500/20 text-white transition-transform group-hover:scale-105">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {siteSettings.site_name || 'Vishalpdf'}
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/60">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">SHA-256 Verified PDF Library</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onNavigateHome}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeView === 'home'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Explore Books
            </button>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Upload className="h-4 w-4 text-indigo-500" />
              Upload PDF
            </button>
            <button
              onClick={onOpenStripe}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeView === 'pricing'
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Unlimited (${siteSettings.unlimited_price})</span>
            </button>
            {/* Supabase & Architecture - SAW ONLY FOR DEVELOPER */}
            {isDeveloperAdmin && (
              <button
                onClick={onOpenArchitecture}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="View Supabase PostgreSQL Schema, RLS & Google OAuth Setup"
              >
                <Database className="h-4 w-4 text-emerald-600" />
                <span className="hidden lg:inline">Supabase & Architecture</span>
                <span className="lg:hidden">Architecture</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Section */}
        <div className="flex items-center gap-2.5">
          
          {/* Admin Panel Quick Trigger Button - VISIBLE ONLY WHEN DEVELOPER LOGS IN */}
          {isDeveloperAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/10 border border-amber-300 hover:border-amber-400 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Open Developer Admin Panel to change website content, quotas, books & users live!"
            >
              <Zap className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
              <span>Admin Panel</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>
          )}

          {/* Supabase Connection Status Pill - VISIBLE ONLY WHEN DEVELOPER LOGS IN */}
          {isDeveloperAdmin && (
            <button
              onClick={onOpenArchitecture}
              className={`hidden xl:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title={supabaseConfig.isConnected ? 'Connected to live Supabase project' : 'Running in Local / Demo mode (Click to connect live Supabase)'}
            >
              <span className={`h-2 w-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{supabaseConfig.isConnected ? 'Supabase Live' : 'Demo DB'}</span>
            </button>
          )}

          {/* User Credits / Unlimited Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.is_unlimited ? (
                <div 
                  onClick={onOpenDashboard}
                  className="cursor-pointer flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800 shadow-xs hover:border-amber-400 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                  <span>Unlimited Pro</span>
                </div>
              ) : (
                <div 
                  onClick={onOpenDashboard}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs transition-colors ${
                    currentUser.download_credits > 1
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                      : currentUser.download_credits === 1
                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                  title={`${currentUser.download_credits} downloads remaining. Click to view dashboard.`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{currentUser.download_credits} {currentUser.download_credits === 1 ? 'Credit' : 'Credits'}</span>
                </div>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-none"
                >
                  {currentUser.avatar_url ? (
                    <img 
                      src={currentUser.avatar_url} 
                      alt={currentUser.full_name} 
                      className="h-8 w-8 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-medium text-xs">
                      {currentUser.full_name.charAt(0) || 'U'}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <span>Upload count:</span>
                        <span className="font-semibold text-indigo-600">{currentUser.upload_count} PDFs</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isDeveloperAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <Zap className="h-4 w-4 text-amber-600 fill-amber-500" />
                          Developer Admin Panel
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Dashboard & Quota
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenUpload();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Upload PDF Document
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenStripe();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <CreditCard className="h-4 w-4 text-amber-500" />
                        Upgrade / Buy Credits (${siteSettings.unlimited_price})
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {isDeveloperAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex w-full items-center gap-2 py-2 text-sm font-bold text-amber-800 bg-amber-50 px-3 rounded-lg"
            >
              <Zap className="h-4 w-4 fill-amber-500 text-amber-600" />
              Developer Admin Panel
            </button>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigateHome();
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Explore Books
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenUpload();
            }}
            className="flex w-full items-center gap-2 py-2 text-sm font-medium text-slate-700"
          >
            <Upload className="h-4 w-4 text-indigo-500" />
            Upload PDF
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenStripe();
            }}
            className="flex w-full items-center gap-2 py-2 text-sm font-medium text-amber-700"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Unlimited Downloads (${siteSettings.unlimited_price})
          </button>
          {isDeveloperAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenArchitecture();
              }}
              className="flex w-full items-center gap-2 py-2 text-sm font-medium text-emerald-700"
            >
              <Database className="h-4 w-4" />
              Supabase SQL & Setup Docs
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDashboard();
              }}
              className="flex w-full items-center gap-2 py-2 text-sm font-medium text-indigo-600 border-t border-slate-100 pt-3"
            >
              <UserIcon className="h-4 w-4" />
              View User Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
