import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  Info,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { UserProfile, Book } from '../types';
import { computeFileSHA256, formatBytes, truncateHash } from '../lib/crypto';
import { uploadBookWithDuplicateCheck, fetchBooks } from '../lib/db';
import confetti from 'canvas-confetti';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUploadSuccess: (newBook: Book, earnedCredit?: boolean) => void;
  onOpenAuth: () => void;
  onViewBookDetails: (book: Book) => void;
}

const CATEGORIES = [
  'Computer Science',
  'Artificial Intelligence',
  'Engineering',
  'Mathematics',
  'Business & Finance',
  'Self Development',
  'Science',
  'Fiction & Literature',
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUploadSuccess,
  onOpenAuth,
  onViewBookDetails,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Hashing and Duplicate checking state
  const [isHashing, setIsHashing] = useState(false);
  const [computedHash, setComputedHash] = useState('');
  const [duplicateBook, setDuplicateBook] = useState<Book | null>(null);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag over state
  const [isDragging, setIsDragging] = useState(false);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setTitle('');
      setAuthor('');
      setDescription('');
      setComputedHash('');
      setDuplicateBook(null);
      setErrorMessage('');
      setIsHashing(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process file selection and perform SHA-256 computation + duplicate check
  const handleFileSelection = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF document (.pdf).');
      return;
    }

    setErrorMessage('');
    setFile(selectedFile);
    setDuplicateBook(null);

    // Auto-populate title if empty
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Compute SHA-256 hash
    setIsHashing(true);
    try {
      const hash = await computeFileSHA256(selectedFile);
      setComputedHash(hash);

      // Verify duplicate against existing database
      const allBooks = await fetchBooks();
      const existing = allBooks.find(b => b.file_hash.toLowerCase() === hash.toLowerCase());

      if (existing) {
        setDuplicateBook(existing);
      } else {
        setDuplicateBook(null);
      }
    } catch (err: any) {
      setErrorMessage('Failed to compute file SHA-256 hash: ' + (err.message || ''));
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a PDF file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please enter a title for the PDF.');
      return;
    }
    if (duplicateBook) {
      setErrorMessage('This PDF has already been uploaded.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await uploadBookWithDuplicateCheck({
        file,
        title: title.trim(),
        author: author.trim() || 'Community Contributor',
        description: description.trim(),
        category,
        currentUser,
      });

      if (!result.success) {
        if (result.duplicate && result.existingBook) {
          setDuplicateBook(result.existingBook);
          setErrorMessage('This PDF has already been uploaded.');
        } else {
          setErrorMessage(result.message || 'Upload failed.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success celebration!
      if (result.earnedCredit) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }

      onUploadSuccess(result.book!, result.earnedCredit);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
      setIsSubmitting(false);
    }
  };

  // Upload quota math
  const currentUploads = currentUser.upload_count || 0;
  const uploadsTowardsNextCredit = currentUploads % 2;
  const uploadsNeeded = 2 - uploadsTowardsNextCredit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload PDF to Vishalpdf</h2>
              <p className="text-xs text-slate-500">Cryptographically verified & deduplicated via SHA-256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Incentive Banner */}
        <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-blue-50 px-6 py-3 border-b border-indigo-100/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-indigo-950 font-medium">
              Upload 2 PDFs = <strong>+1 Free Download Credit</strong>
            </span>
          </div>
          <span className="font-semibold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200">
            {uploadsTowardsNextCredit === 1 ? '1 more upload needed' : '2 uploads needed'}
          </span>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select PDF Document *
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : file
                  ? duplicateBook 
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="pdf-file-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setComputedHash('');
                      setDuplicateBook(null);
                    }}
                    className="text-xs text-slate-400 hover:text-rose-600 p-1"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="py-3">
                  <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse or drag & drop your PDF here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports books, research papers, manuals (PDF up to 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Hash Status Indicator */}
          {isHashing && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-700 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Computing SHA-256 cryptographic digest of PDF...</span>
            </div>
          )}

          {computedHash && !isHashing && (
            <div className={`rounded-xl p-3 text-xs border font-mono ${
              duplicateBook 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <div className="flex items-center justify-between font-sans mb-1 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  {duplicateBook ? 'Duplicate Detected' : 'SHA-256 Verified Unique'}
                </span>
                <span className="text-[10px] font-mono">{truncateHash(computedHash, 8, 8)}</span>
              </div>
              <p className="text-[10px] break-all font-mono opacity-80">{computedHash}</p>
            </div>
          )}

          {/* PROMINENT DUPLICATE ALERT BANNER */}
          {duplicateBook && (
            <div className="rounded-xl bg-rose-50 border-2 border-rose-300 p-4 text-xs text-rose-900 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-sm text-rose-900">
                    This PDF has already been uploaded.
                  </p>
                  <p className="text-xs text-rose-700">
                    A file with the identical cryptographic SHA-256 digest is already preserved in Vishalpdf. To maintain a clean, zero-duplicate library, duplicate submissions are rejected.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-rose-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-rose-900 truncate">Existing: "{duplicateBook.title}"</p>
                      <p className="text-[11px] text-rose-600">
                        Uploaded on {new Date(duplicateBook.created_at).toLocaleDateString()} • {duplicateBook.downloads_count} downloads
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewBookDetails(duplicateBook);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 shadow-2xs"
                    >
                      <span>View Existing</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errorMessage && !duplicateBook && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book / Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Designing Data-Intensive Applications"
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Author and Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author / Publisher
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Martin Kleppmann"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or table of contents of this PDF..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isHashing || !!duplicateBook || !file}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading to Bucket...</span>
                </>
              ) : duplicateBook ? (
                <span>Duplicate Blocked</span>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Publish PDF</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
