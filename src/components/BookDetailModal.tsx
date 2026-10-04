import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Eye, 
  HardDrive, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles, 
  Share2
} from 'lucide-react';
import { Book, UserProfile } from '../types';
import { formatBytes } from '../lib/crypto';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onDownload: (book: Book) => void;
  onPreview: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  currentUser,
  onDownload,
  onPreview,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !book) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(book.file_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const uploadDate = new Date(book.created_at).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
              {book.category}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              SHA-256 Verified
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">{book.title}</h2>
          <p className="mt-1 text-sm text-indigo-200 font-medium">by {book.author}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5 text-indigo-500" />
                File Size
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">{formatBytes(book.file_size)}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                Pages
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">~{book.page_count} pages</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Download className="h-3.5 w-3.5 text-indigo-500" />
                Downloads
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">{book.downloads_count}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                Uploaded
              </span>
              <p className="mt-1 text-xs font-bold text-slate-900">{uploadDate}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              About This Document
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              {book.description || 'No detailed description provided by the uploader. This document is authenticated and stored in the Vishalpdf digital archive.'}
            </p>
          </div>

          {/* SHA-256 Cryptographic Checksum Box */}
          <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>SHA-256 Unique Integrity Digest</span>
              </div>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
              >
                {copiedHash ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {book.file_hash}
            </p>
            <p className="text-[11px] text-slate-400">
              This 256-bit cryptographic digest prevents duplicate files from ever entering Vishalpdf.
            </p>
          </div>

          {/* Uploader info */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserIcon className="h-4 w-4" />
              </div>
              <span>Uploaded by <strong>{book.uploader_name || 'Community Member'}</strong></span>
            </div>
            {currentUser && (
              <span className="text-slate-600">
                {currentUser.is_unlimited ? (
                  <span className="font-semibold text-amber-600">👑 Unlimited Plan Active</span>
                ) : (
                  <span>Credits remaining: <strong>{currentUser.download_credits}</strong></span>
                )}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onPreview(book);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Eye className="h-4 w-4 text-slate-500" />
              <span>Read in Browser</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDownload(book);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
