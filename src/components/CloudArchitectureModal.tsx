import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Terminal, 
  Layers, 
  HardDrive, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { POSTGRES_SCHEMA_SQL, SUPABASE_SETUP_GUIDE_MD } from '../lib/sqlSchema';
import { 
  getSavedSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  resetSupabaseInstance 
} from '../lib/supabaseClient';
import { SupabaseConfig } from '../types';

interface CloudArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConfig: SupabaseConfig;
  onConfigUpdated: () => void;
}

export const CloudArchitectureModal: React.FC<CloudArchitectureModalProps> = ({
  isOpen,
  onClose,
  supabaseConfig,
  onConfigUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'auth' | 'storage' | 'connect'>('schema');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);

  // Live Supabase connection tester state
  const saved = getSavedSupabaseConfig();
  const [inputUrl, setInputUrl] = useState(saved.url || '');
  const [inputKey, setInputKey] = useState(saved.anonKey || '');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_GUIDE_MD);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || !inputKey) {
      setTestStatus({ loading: false, success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }

    setTestStatus({ loading: true });
    try {
      const result = await testSupabaseConnection(inputUrl.trim(), inputKey.trim());
      setTestStatus({ loading: false, success: result.success, message: result.message });
      if (result.success) {
        saveSupabaseConfig(inputUrl.trim(), inputKey.trim());
        resetSupabaseInstance();
        onConfigUpdated();
      }
    } catch (err: any) {
      setTestStatus({ loading: false, success: false, message: err.message || 'Connection test failed' });
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    resetSupabaseInstance();
    setInputUrl('');
    setInputKey('');
    setTestStatus(null);
    onConfigUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden my-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Supabase Cloud Architecture & SQL Schema</h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Production Blueprint
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete PostgreSQL Schema, Auth Triggers, SHA-256 Deduplication & Storage Policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>PostgreSQL Schema & Triggers</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'auth'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Google OAuth Credentials Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>Supabase Storage (book-pdfs) & RLS</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'connect'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Connect Live Project</span>
            {supabaseConfig.isConnected && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            )}
          </button>
        </div>

        {/* Tab 1: PostgreSQL Schema */}
        {activeTab === 'schema' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300 font-medium">
                  Run this in the Supabase SQL Editor to provision tables, triggers, and Row Level Security.
                </p>
                <p className="text-[11px] text-slate-500">
                  Includes profiles table, books table with UNIQUE file_hash, downloads audit, and on_auth_user_created trigger.
                </p>
              </div>
              <button
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
              >
                {copiedSchema ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                <span>{copiedSchema ? 'SQL Copied!' : 'Copy Full SQL'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-indigo-200/90 leading-relaxed shadow-inner">
              <pre className="whitespace-pre">{POSTGRES_SCHEMA_SQL}</pre>
            </div>
          </div>
        )}

        {/* Tab 2: Google OAuth Setup Guide */}
        {activeTab === 'auth' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Google OAuth 2.0 Credentials Integration</h3>
              <button
                onClick={handleCopyGuide}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                {copiedGuide ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>Copy Instructions</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Google Cloud Console</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to console.cloud.google.com &gt; APIs & Services &gt; Credentials. Create an OAuth 2.0 Client ID for Web Applications.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Authorized Callback URI</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Add your Supabase callback URL in Google console:
                </p>
                <code className="block text-[11px] font-mono bg-slate-900 p-2 rounded-lg text-amber-300 break-all border border-slate-800">
                  https://&lt;your-ref&gt;.supabase.co/auth/v1/callback
                </code>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Supabase Provider Config</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Supabase Dashboard &gt; Authentication &gt; Providers &gt; Google. Paste Client ID & Client Secret and toggle Enable.
                </p>
              </div>
            </div>

            {/* How signup trigger gives 5 free downloads */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Automated 5-Credit Allocation Trigger</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a user completes Google OAuth login, Supabase fires the PostgreSQL trigger <code className="text-indigo-400 font-mono">on_auth_user_created</code> which immediately inserts their row into <code className="text-indigo-400 font-mono">public.profiles</code> with <code className="text-emerald-400 font-mono">download_credits = 5</code> and <code className="text-indigo-400 font-mono">upload_count = 0</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Supabase Storage & RLS */}
        {activeTab === 'storage' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Supabase Storage Configuration (`book-pdfs`)</h3>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Bucket Specification</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Bucket ID:</strong> <code className="font-mono text-indigo-400">book-pdfs</code></li>
                  <li><strong>Public:</strong> <code className="font-mono text-emerald-400">true</code> (Allows direct download stream)</li>
                  <li><strong>Allowed MIME types:</strong> <code className="font-mono text-slate-300">application/pdf</code></li>
                  <li><strong>Max File Size Limit:</strong> 50 MB</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Storage Row Level Security (RLS)</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Only authenticated users can upload new PDFs to the bucket, while all visitors have read access to download files:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800">
                  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'book-pdfs');<br/>
                  CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-pdfs' AND auth.role() = 'authenticated');
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Connect Live Project */}
        {activeTab === 'connect' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Connect Your Live Supabase Project</h3>
              <p className="text-xs text-slate-400 mt-1">
                Optionally connect your personal Supabase instance to test real cloud PostgreSQL queries, Auth and storage bucket integration.
              </p>
            </div>

            <form onSubmit={handleTestAndSave} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {testStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  testStatus.success 
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}>
                  {testStatus.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  ) : testStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={testStatus?.loading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {testStatus?.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Test Connection & Save</span>
                </button>

                {saved.url && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="rounded-xl border border-rose-800 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    Disconnect (Revert to Demo DB)
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
