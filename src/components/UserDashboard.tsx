import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Book, 
  DownloadRecord, 
  StripeTransaction 
} from '../types';
import { 
  Download, 
  UploadCloud, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  HardDrive, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Eye, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  RotateCcw
} from 'lucide-react';
import { getLocalDownloads, getLocalTransactions, fetchBooks } from '../lib/db';
import { formatBytes, truncateHash } from '../lib/crypto';

interface UserDashboardProps {
  currentUser: UserProfile;
  onOpenUpload: () => void;
  onOpenStripe: () => void;
  onPreviewBook: (book: Book) => void;
  onRedownloadBook: (book: Book) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onOpenUpload,
  onOpenStripe,
  onPreviewBook,
  onRedownloadBook,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'downloads' | 'billing'>('overview');
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  const [allLibraryBooks, setAllLibraryBooks] = useState<Book[]>([]);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    const all = await fetchBooks();
    setAllLibraryBooks(all);
    const userUploaded = all.filter(b => b.user_id === currentUser.id);
    setMyBooks(userUploaded);

    const userDl = getLocalDownloads(currentUser.id);
    setDownloads(userDl);

    const userTx = getLocalTransactions(currentUser.id);
    setTransactions(userTx);
  };

  const currentUploads = currentUser.upload_count || 0;
  const progressTowardsCredit = currentUploads % 2;
  const uploadsNeeded = 2 - progressTowardsCredit;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      
      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          
          {/* User Details */}
          <div className="flex items-center gap-4">
            {currentUser.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.full_name} 
                className="h-16 w-16 rounded-2xl border-2 border-indigo-400/40 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg">
                {currentUser.full_name.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{currentUser.full_name}</h1>
                {currentUser.is_unlimited ? (
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-0.5 text-xs font-black text-slate-950 uppercase tracking-wider shadow-xs">
                    👑 Unlimited Pro
                  </span>
                ) : (
                  <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-200">
                    Free Starter Tier
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-0.5">{currentUser.email}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Member since {new Date(currentUser.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-all backdrop-blur-xs"
            >
              <UploadCloud className="h-4 w-4 text-indigo-400" />
              <span>Upload PDF</span>
            </button>

            {!currentUser.is_unlimited && (
              <button
                onClick={onOpenStripe}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-400/20 transition-all"
              >
                <Sparkles className="h-4 w-4 fill-slate-950" />
                <span>Go Unlimited ($17)</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Quota & Counter Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Download Credits Remaining */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Download Quota
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Download className="h-5 w-5" />
            </div>
          </div>

          <div className="my-4">
            {currentUser.is_unlimited ? (
              <div>
                <span className="text-3xl font-black text-amber-600">∞ Unlimited</span>
                <p className="text-xs text-slate-500 mt-1">
                  Lifetime Pro Pass active. Zero download limits!
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${
                    currentUser.download_credits > 1 ? 'text-slate-900' : currentUser.download_credits === 1 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {currentUser.download_credits}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Downloads Remaining</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Initial quota: 5 free downloads awarded upon signup.
                </p>
              </div>
            )}
          </div>

          {!currentUser.is_unlimited && (
            <button
              onClick={onOpenStripe}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Get 100 more credits or Unlimited Pass</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Card 2: Upload Quota & Earn Progress Counter */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Earn-Via-Upload Balance
            </span>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
              <UploadCloud className="h-5 w-5" />
            </div>
          </div>

          <div className="my-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {currentUser.upload_count} {currentUser.upload_count === 1 ? 'PDF Uploaded' : 'PDFs Uploaded'}
              </span>
              <span className="text-xs font-bold text-indigo-600">
                {progressTowardsCredit} / 2 towards +1 credit
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
                style={{ width: `${(progressTowardsCredit / 2) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-500">
              {uploadsNeeded === 1 
                ? '🎯 Upload 1 more unique PDF to automatically earn +1 download credit!' 
                : 'Upload 2 unique PDFs to earn +1 download credit.'}
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Upload new PDF document</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Card 3: Library Status & Deduplication Health */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Security & Integrity
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="my-4 space-y-1">
            <span className="text-2xl font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              100% Verified
            </span>
            <p className="text-xs text-slate-500">
              Every document in your account and the repository is protected with 64-char SHA-256 fingerprint verification.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            PostgreSQL Unique Constraints Active
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          My Uploaded Books ({myBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'downloads'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Download History ({downloads.length})
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'billing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Stripe Invoices & Plan
        </button>
      </div>

      {/* Tab 1: My Uploaded Books */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {myBooks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
              <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No PDFs Uploaded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Share a PDF book or paper to earn download credits! Every 2 uploads gives you 1 free download credit.
              </p>
              <button
                onClick={onOpenUpload}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                Upload First PDF
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBooks.map((book) => (
                <div key={book.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
                      {book.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(book.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">{book.title}</h4>
                  <p className="text-xs text-slate-500">{book.author}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                      {book.downloads_count} downloads
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {truncateHash(book.file_hash, 4, 4)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onPreviewBook(book)}
                      className="rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Read
                    </button>
                    <button
                      onClick={() => onRedownloadBook(book)}
                      className="rounded-lg bg-indigo-50 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Get File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Download History */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          {downloads.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
              <Download className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Downloads Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Browse our library and download books using your 5 free credits!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">SHA-256 Digest</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Downloaded On</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {downloads.map((d) => {
                    const originalBook = allLibraryBooks.find(b => b.id === d.book_id);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {d.book_title}
                          <span className="block text-[11px] text-slate-400 font-normal">by {d.book_author}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {truncateHash(d.file_hash, 6, 6)}
                        </td>
                        <td className="py-3 px-4">
                          {formatBytes(d.file_size)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(d.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (originalBook) onRedownloadBook(originalBook);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="Re-download without spending credits"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Re-download</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Billing & Invoices */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">Current Tier Status</h3>
            {currentUser.is_unlimited ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-amber-600 fill-amber-500" />
                  <div>
                    <p className="font-bold text-sm">Unlimited Lifetime Plan Active</p>
                    <p className="text-xs text-amber-800">You have unlimited downloads for life across all books.</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
                  $17 Paid
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-sm text-slate-900">Free Starter Tier ({currentUser.download_credits} credits left)</p>
                  <p className="text-xs text-slate-500">Upgrade to never run out of download credits.</p>
                </div>
                <button
                  onClick={onOpenStripe}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Upgrade to Unlimited ($17)
                </button>
              </div>
            )}
          </div>

          {/* Transactions list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Stripe Invoices & Receipts</h3>
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500">No payment history yet.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{t.plan_name}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{t.id} • {new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">${(t.amount / 100).toFixed(2)} USD</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Paid via Stripe
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
