import { Book, UserProfile, DownloadRecord, StripeTransaction, SiteSettings } from '../types';
import { getSupabase } from './supabaseClient';
import { INITIAL_SEED_BOOKS } from './mockSeedData';
import { computeFileSHA256 } from './crypto';

const LOCAL_STORAGE_BOOKS = 'vishalpdf_books_store';
const LOCAL_STORAGE_USER = 'vishalpdf_current_user';
const LOCAL_STORAGE_DOWNLOADS = 'vishalpdf_downloads_store';
const LOCAL_STORAGE_TRANSACTIONS = 'vishalpdf_transactions_store';
const LOCAL_STORAGE_SETTINGS = 'vishalpdf_site_settings';
const LOCAL_STORAGE_USERS_REGISTRY = 'vishalpdf_users_registry';

// Cross-tab and live sync broadcast channel
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('vishalpdf_sync_channel') 
  : null;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: 'Vishalpdf',
  announcement_banner: {
    enabled: true,
    text: '⚡ Instant Access: Every Google sign-in receives 5 verified PDF download credits with zero card needed!',
    type: 'promo',
    link_text: 'Claim 5 Free Credits',
    link_action: 'pricing',
  },
  hero_headline: 'High-Performance PDF Library with Smart Quotas',
  hero_subheadline: 'Explore, upload, and read verified academic, tech, and business books. Protected against duplicate uploads using cryptographic SHA-256 hashing.',
  hero_badge_text: 'SHA-256 Deduplicated Document Repository',
  starter_free_credits: 5,
  uploads_per_credit: 2,
  unlimited_price: 17,
  pack_price: 9,
  maintenance_mode: false,
  allow_guest_downloads: false,
  updated_at: new Date().toISOString(),
  updated_by: 'Dev Admin',
};

// ==========================================
// SITE SETTINGS MANAGEMENT (LIVE BROADCAST)
// ==========================================

export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading site settings', e);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: SiteSettings): void {
  try {
    const updated = {
      ...settings,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(updated));

    // Broadcast immediately to current window
    window.dispatchEvent(new CustomEvent('vishalpdf_settings_changed', { detail: updated }));

    // Broadcast to other tabs/windows
    if (syncChannel) {
      syncChannel.postMessage({ type: 'SETTINGS_UPDATED', payload: updated });
    }
  } catch (e) {
    console.error('Error saving site settings', e);
  }
}

// Broadcast event listeners
export function subscribeToSyncEvents(onUpdate: (event: { type: string; payload: any }) => void): () => void {
  const handleLocal = (e: any) => {
    if (e.detail) {
      onUpdate({ type: 'LOCAL_SETTINGS', payload: e.detail });
    }
  };

  const handleChannel = (msg: MessageEvent) => {
    if (msg.data) {
      onUpdate(msg.data);
    }
  };

  window.addEventListener('vishalpdf_settings_changed', handleLocal);
  window.addEventListener('vishalpdf_books_changed', handleLocal);
  if (syncChannel) {
    syncChannel.addEventListener('message', handleChannel);
  }

  return () => {
    window.removeEventListener('vishalpdf_settings_changed', handleLocal);
    window.removeEventListener('vishalpdf_books_changed', handleLocal);
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleChannel);
    }
  };
}

// ==========================================
// BOOKS STORAGE & RETRIEVAL
// ==========================================

export function getLocalBooks(): Book[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local books', e);
  }
  // Initialize with seed data
  localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(INITIAL_SEED_BOOKS));
  return INITIAL_SEED_BOOKS;
}

export function saveLocalBooks(books: Book[]): void {
  localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(books));
  window.dispatchEvent(new CustomEvent('vishalpdf_books_changed', { detail: books }));
  if (syncChannel) {
    syncChannel.postMessage({ type: 'BOOKS_UPDATED', payload: books });
  }
}

// ==========================================
// USER REGISTRY & SESSIONS
// ==========================================

export function getAllRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_REGISTRY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // Seed with developer admin and reader accounts
  const initialUsers: UserProfile[] = [
    {
      id: 'usr_admin_vishal',
      email: 'malivishal9924752@gmail.com',
      full_name: 'Vishal Mali (Developer & Architect)',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Vishal+Mali&backgroundColor=4f46e5,0284c7',
      download_credits: 5,
      upload_count: 3,
      is_unlimited: true,
      is_admin: true,
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr_student_alex',
      email: 'reader@example.com',
      full_name: 'Alex Chen (Reader)',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Chen&backgroundColor=0d9488',
      download_credits: 5,
      upload_count: 1,
      is_unlimited: false,
      is_admin: false,
      created_at: '2026-09-20T12:00:00Z',
    }
  ];

  localStorage.setItem(LOCAL_STORAGE_USERS_REGISTRY, JSON.stringify(initialUsers));
  return initialUsers;
}

export function saveRegisteredUsers(users: UserProfile[]): void {
  localStorage.setItem(LOCAL_STORAGE_USERS_REGISTRY, JSON.stringify(users));
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function saveStoredUser(user: UserProfile | null): void {
  if (!user) {
    localStorage.removeItem(LOCAL_STORAGE_USER);
  } else {
    // Check developer status: strictly only malivishal9924752@gmail.com is admin
    user.is_admin = user.email.toLowerCase() === 'malivishal9924752@gmail.com';
    localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));

    // Update in registry as well
    const users = getAllRegisteredUsers();
    const idx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.unshift(user);
    }
    saveRegisteredUsers(users);
  }
}

export function getLocalDownloads(userId?: string): DownloadRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DOWNLOADS);
    if (raw) {
      const all: DownloadRecord[] = JSON.parse(raw);
      if (!userId) return all;
      return all.filter(d => d.user_id === userId);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveLocalDownload(record: DownloadRecord): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DOWNLOADS);
    const all: DownloadRecord[] = raw ? JSON.parse(raw) : [];
    all.unshift(record);
    localStorage.setItem(LOCAL_STORAGE_DOWNLOADS, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}

export function getLocalTransactions(userId?: string): StripeTransaction[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
    if (raw) {
      const all: StripeTransaction[] = JSON.parse(raw);
      if (!userId) return all;
      return all.filter(t => t.user_id === userId);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveLocalTransaction(tx: StripeTransaction): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
    const all: StripeTransaction[] = raw ? JSON.parse(raw) : [];
    all.unshift(tx);
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email || user.email || '',
            full_name: profile.full_name || user.user_metadata?.full_name || 'Vishal Reader',
            avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || '',
            download_credits: profile.download_credits ?? 5,
            upload_count: profile.upload_count ?? 0,
            is_unlimited: profile.is_unlimited ?? false,
            is_admin: profile.email === 'malivishal9924752@gmail.com' || Boolean(profile.is_admin),
            created_at: profile.created_at || new Date().toISOString(),
          };
          saveStoredUser(userProfile);
          return userProfile;
        }
      }
    } catch (e) {
      console.warn('Supabase auth check failed, falling back to local session', e);
    }
  }

  const stored = getStoredUser();
  if (stored) {
    if (stored.email === 'malivishal9924752@gmail.com') {
      stored.is_admin = true;
    }
    return stored;
  }
  return null;
}

export async function signInWithGoogle(
  customEmail?: string, 
  useRealRedirect: boolean = false
): Promise<{ success: boolean; user?: UserProfile; redirecting?: boolean }> {
  const supabase = getSupabase();
  
  if (supabase && useRealRedirect) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (!error) {
        return { success: true, redirecting: true };
      }
    } catch (e) {
      console.warn('Supabase OAuth failed, using local login mode', e);
    }
  }

  const settings = getSiteSettings();
  const email = customEmail?.trim() || 'reader@example.com';
  const isAdmin = email.toLowerCase() === 'malivishal9924752@gmail.com';
  
  const nameParts = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
  const displayName = isAdmin 
    ? 'Vishal Mali' 
    : nameParts ? nameParts.charAt(0).toUpperCase() + nameParts.slice(1) : 'Vishal Reader';

  // Check if profile already exists in registry to preserve credits/uploads
  const existingUsers = getAllRegisteredUsers();
  const existing = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    existing.is_admin = isAdmin;
    saveStoredUser(existing);
    return { success: true, user: existing };
  }

  const newUser: UserProfile = {
    id: isAdmin ? 'usr_admin_vishal' : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: email,
    full_name: displayName,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=${isAdmin ? '4f46e5,0284c7' : '0d9488,6366f1'}`,
    download_credits: settings.starter_free_credits,
    upload_count: 0,
    is_unlimited: isAdmin, // Developer gets instant unlimited access
    is_admin: isAdmin,
    created_at: new Date().toISOString(),
  };

  saveStoredUser(newUser);
  return { success: true, user: newUser };
}

export async function signOutUser(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
  saveStoredUser(null);
}

// ==========================================
// BOOKS CATALOG
// ==========================================

export async function fetchBooks(): Promise<Book[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Book[];
      }
    } catch (e) {
      console.warn('Failed to fetch from live Supabase, using local store', e);
    }
  }
  return getLocalBooks();
}

export interface UploadBookParams {
  file: File;
  title: string;
  author: string;
  description: string;
  category: string;
  currentUser: UserProfile;
}

export interface UploadResult {
  success: boolean;
  duplicate?: boolean;
  existingBook?: Book;
  message: string;
  book?: Book;
  earnedCredit?: boolean;
  newUploadCount?: number;
  newCredits?: number;
}

export async function uploadBookWithDuplicateCheck(params: UploadBookParams): Promise<UploadResult> {
  const { file, title, author, description, category, currentUser } = params;

  let fileHash = '';
  try {
    fileHash = await computeFileSHA256(file);
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to compute SHA-256 cryptographic hash of the PDF: ' + (err.message || ''),
    };
  }

  const existingBooks = await fetchBooks();
  const duplicate = existingBooks.find(b => b.file_hash.toLowerCase() === fileHash.toLowerCase());

  if (duplicate) {
    return {
      success: false,
      duplicate: true,
      existingBook: duplicate,
      message: 'This PDF has already been uploaded.',
    };
  }

  let fileUrl = '';
  const supabase = getSupabase();

  if (supabase) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('book-pdfs')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('book-pdfs')
          .getPublicUrl(uploadData.path);
        fileUrl = publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error, fallback to data url', err);
    }
  }

  if (!fileUrl) {
    fileUrl = URL.createObjectURL(file);
  }

  const estimatedPages = Math.max(1, Math.round(file.size / 55000));

  const newBook: Book = {
    id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: currentUser.id,
    uploader_name: currentUser.full_name || currentUser.email.split('@')[0],
    title: title.trim(),
    author: author.trim() || 'Community Contributor',
    description: description.trim() || 'Uploaded to Vishalpdf document collection.',
    category: category || 'General',
    file_url: fileUrl,
    file_hash: fileHash,
    file_size: file.size,
    page_count: estimatedPages,
    downloads_count: 0,
    created_at: new Date().toISOString(),
  };

  const currentBooks = getLocalBooks();
  currentBooks.unshift(newBook);
  saveLocalBooks(currentBooks);

  if (supabase) {
    try {
      await supabase.from('books').insert({
        id: newBook.id,
        user_id: currentUser.id,
        title: newBook.title,
        author: newBook.author,
        description: newBook.description,
        category: newBook.category,
        file_url: newBook.file_url,
        file_hash: newBook.file_hash,
        file_size: newBook.file_size,
        page_count: newBook.page_count,
        downloads_count: 0,
      });
    } catch (e) {
      console.warn('Could not insert book to Supabase table:', e);
    }
  }

  // Quota calculation based on dynamic settings
  const settings = getSiteSettings();
  const ratio = settings.uploads_per_credit || 2;
  const updatedUploadCount = (currentUser.upload_count || 0) + 1;
  const earnedCredit = updatedUploadCount % ratio === 0;
  const updatedCredits = earnedCredit 
    ? (currentUser.download_credits || 0) + 1 
    : (currentUser.download_credits || 0);

  const updatedProfile: UserProfile = {
    ...currentUser,
    upload_count: updatedUploadCount,
    download_credits: updatedCredits,
  };

  saveStoredUser(updatedProfile);

  return {
    success: true,
    message: earnedCredit 
      ? `PDF uploaded successfully! 🎉 You earned +1 download credit for uploading ${ratio} PDFs!`
      : `PDF uploaded successfully! Upload ${ratio - (updatedUploadCount % ratio)} more to earn +1 download credit.`,
    book: newBook,
    earnedCredit,
    newUploadCount: updatedUploadCount,
    newCredits: updatedCredits,
  };
}

// ==========================================
// DOWNLOAD CONTROLLER
// ==========================================

export interface DownloadResult {
  success: boolean;
  requiresAuth?: boolean;
  quotaExceeded?: boolean;
  message?: string;
  book?: Book;
  remainingCredits?: number;
  isUnlimited?: boolean;
  downloadUrl?: string;
}

export async function processDownload(bookId: string, currentUser: UserProfile | null): Promise<DownloadResult> {
  const settings = getSiteSettings();

  if (!currentUser && !settings.allow_guest_downloads) {
    return {
      success: false,
      requiresAuth: true,
      message: `Please sign in with Google to download PDFs. New users receive ${settings.starter_free_credits} free downloads!`,
    };
  }

  const allBooks = await fetchBooks();
  const book = allBooks.find(b => b.id === bookId);
  if (!book) {
    return {
      success: false,
      message: 'Book not found in library.',
    };
  }

  if (currentUser && !currentUser.is_unlimited && (currentUser.download_credits <= 0)) {
    return {
      success: false,
      quotaExceeded: true,
      message: 'Action Required: You have 0 download credits remaining.',
      book,
    };
  }

  const remainingCredits = currentUser?.is_unlimited 
    ? currentUser.download_credits 
    : Math.max(0, (currentUser?.download_credits || 1) - 1);

  if (currentUser) {
    const updatedProfile: UserProfile = {
      ...currentUser,
      download_credits: remainingCredits,
    };
    saveStoredUser(updatedProfile);
  }

  // Increment book downloads_count
  const updatedBooks = allBooks.map(b => {
    if (b.id === bookId) {
      return { ...b, downloads_count: (b.downloads_count || 0) + 1 };
    }
    return b;
  });
  saveLocalBooks(updatedBooks);

  // Record download
  if (currentUser) {
    const downloadRecord: DownloadRecord = {
      id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: currentUser.id,
      book_id: book.id,
      book_title: book.title,
      book_author: book.author,
      file_hash: book.file_hash,
      file_size: book.file_size,
      created_at: new Date().toISOString(),
    };
    saveLocalDownload(downloadRecord);
  }

  return {
    success: true,
    book: { ...book, downloads_count: (book.downloads_count || 0) + 1 },
    remainingCredits,
    isUnlimited: currentUser?.is_unlimited,
    downloadUrl: book.file_url,
  };
}

// ==========================================
// STRIPE UPGRADE
// ==========================================

export async function completeStripePurchase(
  currentUser: UserProfile, 
  planType: 'unlimited_17' | 'pack_100_9',
  transactionDetails: { last4: string; brand: string }
): Promise<{ success: boolean; updatedUser: UserProfile; transaction: StripeTransaction }> {
  const settings = getSiteSettings();
  const isUnlimitedPlan = planType === 'unlimited_17';
  const amount = isUnlimitedPlan ? settings.unlimited_price * 100 : settings.pack_price * 100;
  const planName = isUnlimitedPlan ? `Unlimited Lifetime Pro Pass ($${settings.unlimited_price})` : `100 Download Credits Pack ($${settings.pack_price})`;

  const updatedUser: UserProfile = {
    ...currentUser,
    is_unlimited: isUnlimitedPlan ? true : currentUser.is_unlimited,
    download_credits: isUnlimitedPlan ? currentUser.download_credits : currentUser.download_credits + 100,
  };

  saveStoredUser(updatedUser);

  const tx: StripeTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    user_id: currentUser.id,
    amount,
    currency: 'USD',
    plan_name: planName,
    status: 'succeeded',
    payment_method: `${transactionDetails.brand.toUpperCase()} ending in ${transactionDetails.last4}`,
    receipt_url: `https://pay.stripe.com/receipts/acct_demo/${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  saveLocalTransaction(tx);

  return { success: true, updatedUser, transaction: tx };
}

// ==========================================
// DEVELOPER & ADMIN PANEL OPERATIONS
// ==========================================

export function adminUpdateBook(updatedBook: Book): void {
  const books = getLocalBooks();
  const idx = books.findIndex(b => b.id === updatedBook.id);
  if (idx >= 0) {
    books[idx] = updatedBook;
    saveLocalBooks(books);
  }
}

export function adminDeleteBook(bookId: string): void {
  const books = getLocalBooks();
  const filtered = books.filter(b => b.id !== bookId);
  saveLocalBooks(filtered);
}

export function adminAddBook(newBook: Book): void {
  const books = getLocalBooks();
  books.unshift(newBook);
  saveLocalBooks(books);
}

export function adminToggleFeatured(bookId: string): void {
  const books = getLocalBooks();
  const idx = books.findIndex(b => b.id === bookId);
  if (idx >= 0) {
    books[idx].is_featured = !books[idx].is_featured;
    saveLocalBooks(books);
  }
}

export function adminUpdateUser(userId: string, updates: Partial<UserProfile>): void {
  const users = getAllRegisteredUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    saveRegisteredUsers(users);

    // If current logged-in user is this user, update active session too
    const current = getStoredUser();
    if (current && current.id === userId) {
      saveStoredUser({ ...current, ...updates });
    }
  }
}

export function adminDeleteUser(userId: string): void {
  const users = getAllRegisteredUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveRegisteredUsers(filtered);
}

export function exportAllDataAsJSON(): string {
  const data = {
    exported_at: new Date().toISOString(),
    settings: getSiteSettings(),
    books: getLocalBooks(),
    users: getAllRegisteredUsers(),
    downloads: getLocalDownloads(),
    transactions: getLocalTransactions(),
  };
  return JSON.stringify(data, null, 2);
}

export function resetDemoData(): void {
  localStorage.setItem(LOCAL_STORAGE_BOOKS, JSON.stringify(INITIAL_SEED_BOOKS));
  localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(DEFAULT_SITE_SETTINGS));
  localStorage.removeItem(LOCAL_STORAGE_DOWNLOADS);
  localStorage.removeItem(LOCAL_STORAGE_TRANSACTIONS);
  window.dispatchEvent(new CustomEvent('vishalpdf_settings_changed', { detail: DEFAULT_SITE_SETTINGS }));
  window.dispatchEvent(new CustomEvent('vishalpdf_books_changed', { detail: INITIAL_SEED_BOOKS }));
}
