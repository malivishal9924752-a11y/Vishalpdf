/**
 * Vishalpdf - Modern PDF Library, SHA-256 Deduplication & Smart Quota System
 * Full-stack App with Supabase PostgreSQL, Storage, Google OAuth & Stripe Checkout
 * Enhanced with Real-Time Developer Admin Panel & Live Site Broadcaster
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  Book, 
  BookCategory, 
  SupabaseConfig, 
  StripeTransaction,
  SiteSettings
} from './types';
import { 
  getCurrentUser, 
  signInWithGoogle,
  signOutUser, 
  fetchBooks, 
  processDownload, 
  getLocalBooks,
  getSiteSettings,
  getAllRegisteredUsers,
  subscribeToSyncEvents
} from './lib/db';
import { getSavedSupabaseConfig } from './lib/supabaseClient';
import { generateSimplePdfBlob, triggerFileDownload } from './lib/pdfHelper';

// Components
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BookCard } from './components/BookCard';
import { UploadModal } from './components/UploadModal';
import { QuotaActionRequiredModal } from './components/QuotaActionRequiredModal';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { BookDetailModal } from './components/BookDetailModal';
import { PdfReaderModal } from './components/PdfReaderModal';
import { UserDashboard } from './components/UserDashboard';
import { PricingSection } from './components/PricingSection';
import { CloudArchitectureModal } from './components/CloudArchitectureModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';

import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  Search, 
  ArrowUpDown,
  Zap,
  AlertTriangle,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Current user state (starts with demo / saved session)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Site Settings (Configurable live from Admin Panel)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'title'>('popular');

  // Navigation View
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'pricing'>('home');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string>('Sign in with Google to claim your free PDF downloads.');
  const [isQuotaOpen, setIsQuotaOpen] = useState(false);
  const [attemptedBook, setAttemptedBook] = useState<Book | null>(null);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [readerBook, setReaderBook] = useState<Book | null>(null);

  // Downloading button loader state
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Supabase connection state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    isConnected: false,
    isCustom: false,
  });

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      // Load Supabase config
      const conf = getSavedSupabaseConfig();
      setSupabaseConfig({
        url: conf.url,
        anonKey: conf.anonKey,
        isConnected: Boolean(conf.url && conf.anonKey),
        isCustom: Boolean(conf.url),
      });

      // Load Site Settings
      const loadedSettings = getSiteSettings();
      setSiteSettings(loadedSettings);

      // Load User session
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Load Books catalog and Users list
      const loadedBooks = await fetchBooks();
      setBooks(loadedBooks);
      const loadedUsers = getAllRegisteredUsers();
      setUsers(loadedUsers);

      setIsLoading(false);
    };

    initApp();

    // Subscribe to cross-tab / real-time live events
    const unsubscribe = subscribeToSyncEvents((event) => {
      if (event.type === 'SETTINGS_UPDATED' || event.type === 'LOCAL_SETTINGS') {
        setSiteSettings(event.payload);
        addToast('info', 'Live Site Updated', 'Changes by admin have been applied in real-time.');
      } else if (event.type === 'BOOKS_UPDATED') {
        setBooks(event.payload);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshSupabaseConfig = () => {
    const conf = getSavedSupabaseConfig();
    setSupabaseConfig({
      url: conf.url,
      anonKey: conf.anonKey,
      isConnected: Boolean(conf.url && conf.anonKey),
      isCustom: Boolean(conf.url),
    });
  };

  const refreshBooks = async () => {
    const fresh = await fetchBooks();
    setBooks(fresh);
  };

  const refreshUsers = () => {
    const freshUsers = getAllRegisteredUsers();
    setUsers(freshUsers);
  };

  // Sign out handler
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setActiveView('home');
    addToast('info', 'Signed Out', 'You can continue exploring books as a visitor.');
  };

  // Download Trigger & Credit Quota Handler
  const handleInitiateDownload = async (book: Book) => {
    // Check maintenance mode
    if (siteSettings.maintenance_mode && !currentUser?.is_admin) {
      addToast('warning', 'Maintenance Mode', 'Downloads are temporarily paused for maintenance.');
      return;
    }

    if (!currentUser && !siteSettings.allow_guest_downloads) {
      setAuthReason(`Sign in with Google to download "${book.title}". You will receive ${siteSettings.starter_free_credits} free downloads!`);
      setIsAuthOpen(true);
      return;
    }

    setDownloadingBookId(book.id);

    try {
      const result = await processDownload(book.id, currentUser);

      if (!result.success) {
        if (result.requiresAuth) {
          setAuthReason('Sign in to download PDFs.');
          setIsAuthOpen(true);
        } else if (result.quotaExceeded) {
          setAttemptedBook(book);
          setIsQuotaOpen(true);
          addToast('warning', 'Quota Reached', 'You have used all free download credits.');
        } else {
          addToast('error', 'Download Error', result.message);
        }
        setDownloadingBookId(null);
        return;
      }

      if (currentUser && !currentUser.is_unlimited) {
        const newCredits = result.remainingCredits ?? Math.max(0, currentUser.download_credits - 1);
        setCurrentUser({
          ...currentUser,
          download_credits: newCredits,
        });
      }

      // Refresh books downloads count
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, downloads_count: (b.downloads_count || 0) + 1 } : b));

      // Trigger the physical PDF file download
      const pdfBlob = generateSimplePdfBlob(book.title, book.author, book.file_hash, book.category);
      triggerFileDownload(pdfBlob, `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

      if (currentUser?.is_unlimited) {
        addToast('success', 'Download Complete!', `"${book.title}" downloaded (Unlimited Plan).`);
      } else {
        const remaining = result.remainingCredits ?? ((currentUser?.download_credits || 1) - 1);
        addToast('success', 'PDF Downloaded!', `Remaining quota: ${remaining} ${remaining === 1 ? 'credit' : 'credits'}.`);
      }

    } catch (err: any) {
      addToast('error', 'Download Failed', err.message || 'Could not complete download.');
    } finally {
      setDownloadingBookId(null);
    }
  };

  // Re-download without spending credits
  const handleRedownload = (book: Book) => {
    const pdfBlob = generateSimplePdfBlob(book.title, book.author, book.file_hash, book.category);
    triggerFileDownload(pdfBlob, `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    addToast('info', 'File Re-downloaded', `"${book.title}" has been saved.`);
  };

  // Handle successful upload
  const handleUploadSuccess = (newBook: Book, earnedCredit?: boolean) => {
    refreshBooks();
    refreshUsers();
    if (currentUser) {
      const newUploadCount = (currentUser.upload_count || 0) + 1;
      const newCredits = earnedCredit 
        ? (currentUser.download_credits || 0) + 1 
        : (currentUser.download_credits || 0);

      setCurrentUser({
        ...currentUser,
        upload_count: newUploadCount,
        download_credits: newCredits,
      });

      if (earnedCredit) {
        addToast('success', 'Earned +1 Download Credit! 🎉', `You have uploaded ${siteSettings.uploads_per_credit} unique PDFs and received a free download credit.`);
      } else {
        addToast('success', 'Book Published!', `"${newBook.title}" is now available in the library.`);
      }
    }
  };

  // Handle successful Stripe payment
  const handleStripeSuccess = (updatedUser: UserProfile, tx: StripeTransaction) => {
    setCurrentUser(updatedUser);
    refreshUsers();
    addToast('success', 'Payment Successful! 👑', `Upgraded to ${tx.plan_name}. Enjoy unlimited access!`);
  };

  // Filtered & Sorted Books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !q ||
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q) ||
          book.category.toLowerCase().includes(q) ||
          book.file_hash.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Pinned/Featured books appear at the top
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;

        if (sortBy === 'popular') return (b.downloads_count || 0) - (a.downloads_count || 0);
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [books, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Global Announcement Banner (Editable Live from Admin Panel) */}
      <AnnouncementBanner
        settings={siteSettings}
        onActionClick={(action) => {
          if (action === 'pricing') setIsStripeOpen(true);
          else if (action === 'upload') {
            if (!currentUser) setIsAuthOpen(true);
            else setIsUploadOpen(true);
          } else {
            setActiveView('home');
          }
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={currentUser?.is_admin}
      />

      {/* 2. Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthReason(`Sign in with Google to get ${siteSettings.starter_free_credits} free downloads instantly.`);
          setIsAuthOpen(true);
        }}
        onSignOut={handleSignOut}
        onOpenUpload={() => {
          if (!currentUser) {
            setAuthReason('Sign in with Google to upload PDF documents.');
            setIsAuthOpen(true);
          } else {
            setIsUploadOpen(true);
          }
        }}
        onOpenDashboard={() => setActiveView('dashboard')}
        onOpenStripe={() => setIsStripeOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateHome={() => setActiveView('home')}
        supabaseConfig={supabaseConfig}
        siteSettings={siteSettings}
        activeView={activeView}
      />

      {/* Maintenance Mode Alert if Active */}
      {siteSettings.maintenance_mode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Website is currently in Developer Maintenance Mode. Admin controls are unlocked.</span>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="underline ml-2"
          >
            Open Admin Panel
          </button>
        </div>
      )}

      {/* Main Content Area based on active view */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div>
            {/* Dynamic Hero Section with Search & Badges */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              totalBooksCount={books.length}
              onOpenUpload={() => {
                if (!currentUser) {
                  setAuthReason('Sign in with Google to upload PDFs and earn free download credits.');
                  setIsAuthOpen(true);
                } else {
                  setIsUploadOpen(true);
                }
              }}
              onOpenStripe={() => setIsStripeOpen(true)}
              siteSettings={siteSettings}
            />

            {/* Catalog Controls & Books Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
              
              {/* Filter / Sort bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {selectedCategory === 'All' ? 'Curated PDF Collection' : selectedCategory}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'document' : 'documents'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="rounded-lg border border-slate-300 bg-white py-1 px-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="popular">Most Downloaded</option>
                      <option value="newest">Recently Added</option>
                      <option value="title">Alphabetical (A-Z)</option>
                    </select>
                  </div>

                  {/* Upload CTA button */}
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setAuthReason('Sign in with Google to upload PDFs and earn free download credits.');
                        setIsAuthOpen(true);
                      } else {
                        setIsUploadOpen(true);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload PDF</span>
                  </button>
                </div>
              </div>

              {/* Books Grid */}
              {isLoading ? (
                <div className="py-24 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent align-[-0.125em]" />
                  <p className="mt-3 text-xs text-slate-500">Loading verified PDF library...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 my-6">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No matching PDFs found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    {searchQuery ? `No documents matched "${searchQuery}".` : 'Be the first to upload a document to this category!'}
                  </p>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setAuthReason('Sign in with Google to contribute.');
                        setIsAuthOpen(true);
                      } else {
                        setIsUploadOpen(true);
                      }
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      currentUser={currentUser}
                      onDownload={handleInitiateDownload}
                      onPreview={(b) => setReaderBook(b)}
                      onViewDetails={(b) => setDetailBook(b)}
                      isDownloading={downloadingBookId === book.id}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Dynamic Pricing / Tiers Section */}
            <PricingSection
              currentUser={currentUser}
              onOpenStripe={() => setIsStripeOpen(true)}
              onOpenUpload={() => {
                if (!currentUser) {
                  setAuthReason('Sign in with Google to upload PDFs.');
                  setIsAuthOpen(true);
                } else {
                  setIsUploadOpen(true);
                }
              }}
              onOpenAuth={() => {
                setAuthReason(`Sign in with Google to get ${siteSettings.starter_free_credits} free downloads instantly.`);
                setIsAuthOpen(true);
              }}
              siteSettings={siteSettings}
            />
          </div>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenStripe={() => setIsStripeOpen(true)}
            onPreviewBook={(b) => setReaderBook(b)}
            onRedownloadBook={handleRedownload}
          />
        )}

        {/* Pricing View */}
        {activeView === 'pricing' && (
          <div className="py-8">
            <PricingSection
              currentUser={currentUser}
              onOpenStripe={() => setIsStripeOpen(true)}
              onOpenUpload={() => {
                if (!currentUser) {
                  setAuthReason('Sign in with Google to upload PDFs.');
                  setIsAuthOpen(true);
                } else {
                  setIsUploadOpen(true);
                }
              }}
              onOpenAuth={() => {
                setAuthReason(`Sign in with Google to get ${siteSettings.starter_free_credits} free downloads.`);
                setIsAuthOpen(true);
              }}
              siteSettings={siteSettings}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      
      {/* 1. Developer Admin Panel (Live Website Controller) */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        siteSettings={siteSettings}
        onSettingsUpdated={(newSettings) => {
          setSiteSettings(newSettings);
          addToast('success', 'Changes Applied!', 'Live site updated immediately.');
        }}
        books={books}
        onBooksUpdated={refreshBooks}
        users={users}
        onUsersUpdated={refreshUsers}
        onNavigateHome={() => setActiveView('home')}
      />

      {/* 2. Upload Modal with SHA-256 Duplicate Check */}
      {currentUser && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          currentUser={currentUser}
          onUploadSuccess={handleUploadSuccess}
          onOpenAuth={() => {
            setAuthReason('Sign in with Google to upload PDFs.');
            setIsAuthOpen(true);
          }}
          onViewBookDetails={(b) => setDetailBook(b)}
        />
      )}

      {/* 3. Download Quota Gating Action Required Modal */}
      {currentUser && (
        <QuotaActionRequiredModal
          isOpen={isQuotaOpen}
          onClose={() => {
            setIsQuotaOpen(false);
            setAttemptedBook(null);
          }}
          currentUser={currentUser}
          attemptedBook={attemptedBook}
          onChooseUpload={() => {
            setIsUploadOpen(true);
          }}
          onChooseUnlock={() => {
            setIsStripeOpen(true);
          }}
          siteSettings={siteSettings}
        />
      )}

      {/* 4. Stripe Checkout Modal */}
      {currentUser && (
        <StripeCheckoutModal
          isOpen={isStripeOpen}
          onClose={() => setIsStripeOpen(false)}
          currentUser={currentUser}
          onSuccess={handleStripeSuccess}
          onOpenAuth={() => {
            setAuthReason('Sign in with Google to upgrade your account.');
            setIsAuthOpen(true);
          }}
          siteSettings={siteSettings}
        />
      )}

      {/* 5. Google Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          refreshUsers();
          if (user.is_admin) {
            addToast('success', 'Developer Mode Active! ⚡', 'Welcome Vishal Mali. Admin Panel & Developer Tools are unlocked.');
          } else {
            addToast('success', 'Signed In Successfully!', `Your ${siteSettings.starter_free_credits} free download credits are ready.`);
          }
        }}
        triggerReason={authReason}
      />

      {/* 6. Book Details Modal */}
      <BookDetailModal
        book={detailBook}
        isOpen={Boolean(detailBook)}
        onClose={() => setDetailBook(null)}
        currentUser={currentUser}
        onDownload={handleInitiateDownload}
        onPreview={(b) => {
          setDetailBook(null);
          setReaderBook(b);
        }}
      />

      {/* 7. In-Browser PDF Reader Modal */}
      <PdfReaderModal
        book={readerBook}
        isOpen={Boolean(readerBook)}
        onClose={() => setReaderBook(null)}
        onDownload={handleInitiateDownload}
      />

      {/* 8. Cloud Architecture & SQL Modal */}
      <CloudArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        supabaseConfig={supabaseConfig}
        onConfigUpdated={refreshSupabaseConfig}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <Footer
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenStripe={() => setIsStripeOpen(true)}
        onOpenUpload={() => {
          if (!currentUser) {
            setAuthReason('Sign in with Google to upload PDFs.');
            setIsAuthOpen(true);
          } else {
            setIsUploadOpen(true);
          }
        }}
        onNavigateHome={() => setActiveView('home')}
        onOpenDeveloperAuth={() => {
          setAuthReason('Sign in as Developer (Vishal Mali) to unlock the Admin Panel.');
          setIsAuthOpen(true);
        }}
        isDeveloperAdmin={Boolean(currentUser && (currentUser.is_admin || currentUser.email === 'malivishal9924752@gmail.com'))}
      />

    </div>
  );
}
