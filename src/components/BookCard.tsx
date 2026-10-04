import React from 'react';
import { Book, UserProfile } from '../types';
import { 
  Download, 
  FileText, 
  Calendar, 
  HardDrive, 
  Eye, 
  User as UserIcon,
} from 'lucide-react';
import { formatBytes } from '../lib/crypto';

interface BookCardProps {
  book: Book;
  currentUser: UserProfile | null;
  onDownload: (book: Book) => void;
  onPreview: (book: Book) => void;
  onViewDetails: (book: Book) => void;
  isDownloading?: boolean;
}

// Generate deterministic beautiful gradient per category
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Computer Science': 'from-blue-600 via-indigo-600 to-violet-700',
  'Artificial Intelligence': 'from-purple-600 via-pink-600 to-rose-700',
  'Engineering': 'from-cyan-600 via-teal-600 to-emerald-700',
  'Mathematics': 'from-amber-500 via-orange-600 to-red-600',
  'Business & Finance': 'from-emerald-600 via-teal-700 to-slate-800',
  'Self Development': 'from-sky-500 via-blue-600 to-indigo-700',
  'Science': 'from-teal-600 via-cyan-600 to-blue-700',
  'Fiction & Literature': 'from-rose-500 via-pink-600 to-purple-700',
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  currentUser,
  onDownload,
  onPreview,
  onViewDetails,
  isDownloading = false,
}) => {
  const gradient = CATEGORY_GRADIENTS[book.category] || 'from-indigo-600 to-slate-800';

  const uploadDate = new Date(book.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-200 overflow-hidden">
      
      {/* Book Cover Header Graphic */}
      <div 
        onClick={() => onViewDetails(book)}
        className={`relative h-44 w-full bg-gradient-to-tr ${gradient} p-5 text-white flex flex-col justify-between cursor-pointer overflow-hidden`}
      >
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white border border-white/20 shadow-2xs">
              {book.category}
            </span>
            {book.is_featured && (
              <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                ★ Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-md bg-black/25 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white/90">
            <Download className="h-3 w-3" />
            <span>{book.downloads_count}</span>
          </div>
        </div>

        {/* Center / Cover Title Typography */}
        <div className="relative z-10 my-auto">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white drop-shadow-xs group-hover:underline">
            {book.title}
          </h3>
          <p className="mt-1 text-xs text-white/80 font-medium truncate">
            by {book.author}
          </p>
        </div>

        {/* Bottom Cover Strip */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/75 pt-2 border-t border-white/15">
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatBytes(book.file_size)}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            ~{book.page_count} pages
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {book.description || 'Verified PDF stored in Vishalpdf community cloud storage.'}
        </p>

        {/* Metadata Row */}
        <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400 mb-4 pt-1">
          <span className="flex items-center gap-1 truncate max-w-[130px]" title={book.uploader_name || 'Contributor'}>
            <UserIcon className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{book.uploader_name || 'Curator'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {uploadDate}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          
          <button
            onClick={() => onPreview(book)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none"
            title="Read / Preview PDF in browser"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onDownload(book)}
            disabled={isDownloading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 focus:outline-none"
            title="Download PDF file (Quota verified)"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isDownloading ? 'Processing...' : 'Download'}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
