import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Book } from '../types';

interface PdfReaderModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (book: Book) => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  book,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen || !book) return null;

  const totalPages = Math.min(12, Math.max(5, book.page_count));

  const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  const zoomIn = () => setZoomLevel(z => Math.min(150, z + 15));
  const zoomOut = () => setZoomLevel(z => Math.max(75, z - 15));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[90vh]'
      }`}>
        
        {/* Reader Top Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 sm:px-6 py-3 text-white">
          <div className="flex items-center gap-3 truncate max-w-sm sm:max-w-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate text-white">{book.title}</h3>
              <p className="text-[11px] text-slate-400 truncate">by {book.author}</p>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-2">
            
            {/* Page Navigation */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-800/80 px-2 py-1 text-xs text-slate-300 border border-slate-700">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-1 hover:text-white disabled:opacity-30"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-mono px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-1 hover:text-white disabled:opacity-30"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-800/80 px-2 py-1 text-xs text-slate-300 border border-slate-700">
              <button onClick={zoomOut} className="p-1 hover:text-white" title="Zoom out">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
              <button onClick={zoomIn} className="p-1 hover:text-white" title="Zoom in">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title={isFullScreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Download button */}
            <button
              onClick={() => onDownload(book)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-1"
            >
              <X className="h-5 w-5" />
            </button>

          </div>
        </div>

        {/* Reader Document Canvas Simulation */}
        <div className="flex-1 overflow-auto bg-slate-900/90 p-4 sm:p-8 flex justify-center items-start">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl text-slate-800 transition-transform duration-200 border border-slate-200 overflow-hidden"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Simulated Page Content */}
            <div className="p-8 sm:p-12 min-h-[720px] flex flex-col justify-between">
              
              {/* Page Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">{book.category}</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>

              {/* Page Body based on page number */}
              <div className="my-auto py-6 space-y-6">
                {currentPage === 1 ? (
                  <div className="text-center space-y-4 py-12">
                    <div className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                      Vishalpdf Verified Edition
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {book.title}
                    </h1>
                    <p className="text-base text-slate-600 font-medium">
                      Author: {book.author}
                    </p>
                    <div className="max-w-md mx-auto pt-6 text-xs text-slate-500 leading-relaxed italic border-t border-slate-100">
                      "{book.description}"
                    </div>
                  </div>
                ) : currentPage === 2 ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 border-b pb-2">
                      Table of Contents
                    </h2>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      <li className="flex justify-between border-b border-dotted pb-1">
                        <span>Chapter 1: Foundational Paradigms & Core Principles</span>
                        <span className="font-mono text-slate-400">pg. 12</span>
                      </li>
                      <li className="flex justify-between border-b border-dotted pb-1">
                        <span>Chapter 2: Cryptographic Hashing & Deduplication</span>
                        <span className="font-mono text-slate-400">pg. 48</span>
                      </li>
                      <li className="flex justify-between border-b border-dotted pb-1">
                        <span>Chapter 3: Quota Allocation & Database Triggers</span>
                        <span className="font-mono text-slate-400">pg. 92</span>
                      </li>
                      <li className="flex justify-between border-b border-dotted pb-1">
                        <span>Chapter 4: Scalable Object Storage with Supabase</span>
                        <span className="font-mono text-slate-400">pg. 145</span>
                      </li>
                      <li className="flex justify-between border-b border-dotted pb-1">
                        <span>Chapter 5: Enterprise Deployment & Stripe Billing</span>
                        <span className="font-mono text-slate-400">pg. 210</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4 text-justify leading-relaxed text-sm text-slate-700">
                    <h3 className="text-lg font-bold text-slate-900">
                      Chapter {currentPage - 2}: System Exploration & Architecture
                    </h3>
                    <p>
                      In distributed document repositories, cryptographic verification plays a paramount role in guaranteeing document uniqueness and storage efficiency. By computing a 256-bit SHA-256 fingerprint of the binary payload at the time of ingest, the storage engine can execute zero-overhead deduplication before committal to persistent object buckets.
                    </p>
                    <p>
                      This ensures that bandwidth, storage capacity, and catalog clarity remain optimal across hundreds of thousands of concurrent readers. Furthermore, with PostgreSQL triggers configured via Supabase, quota increments and download tracking execute in ACID transactions.
                    </p>
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 font-mono text-xs text-slate-600">
                      Digest Verification: {book.file_hash.slice(0, 32)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Page Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  SHA-256 Verified
                </span>
                <span className="font-mono">Vishalpdf Reader</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
