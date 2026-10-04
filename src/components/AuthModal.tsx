import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle } from '../lib/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  triggerReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  triggerReason = 'Sign in with Google to claim your free PDF downloads.',
}) => {
  const [email, setEmail] = useState('malivishal9924752@gmail.com');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }

    setIsSigningIn(true);
    setErrorMsg('');

    try {
      // Natural brief auth handshake
      await new Promise(r => setTimeout(r, 200));

      const result = await signInWithGoogle(cleanEmail, false);
      if (result.success && result.user) {
        onSuccess(result.user);
        onClose();
      } else {
        setErrorMsg('Sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Vishal<span className="text-indigo-600">pdf</span></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 text-center space-y-5">
          
          {/* Google Icon Header */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <svg className="h-7 w-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Sign in with Google</h2>
            <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              {triggerReason}
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Clean Google Sign-in Form */}
          <form onSubmit={handleSignIn} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Google Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secured by Supabase Authentication & RLS</span>
          </div>

        </div>

      </div>
    </div>
  );
};
