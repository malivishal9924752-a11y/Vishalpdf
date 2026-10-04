export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  download_credits: number; // default 5
  upload_count: number;     // default 0
  is_unlimited: boolean;    // default false
  is_admin?: boolean;       // developer / admin role
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  uploader_name?: string;
  title: string;
  author: string;
  description: string;
  category: string;
  file_url: string;
  file_hash: string;        // SHA-256 hex string (UNIQUE)
  file_size: number;        // in bytes
  page_count: number;
  downloads_count: number;
  is_featured?: boolean;    // pinned by admin
  created_at: string;
}

export interface DownloadRecord {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  file_hash: string;
  file_size: number;
  created_at: string;
}

export interface StripeTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  plan_name: string;
  status: 'succeeded' | 'pending' | 'failed';
  payment_method: string;
  receipt_url?: string;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustom: boolean;
}

export interface SiteSettings {
  site_name: string;
  announcement_banner: {
    enabled: boolean;
    text: string;
    type: 'promo' | 'info' | 'warning';
    link_text?: string;
    link_action?: 'pricing' | 'upload' | 'explore';
  };
  hero_headline: string;
  hero_subheadline: string;
  hero_badge_text: string;
  starter_free_credits: number; // default 5
  uploads_per_credit: number;   // default 2
  unlimited_price: number;      // default 17 ($)
  pack_price: number;           // default 9 ($)
  maintenance_mode: boolean;
  allow_guest_downloads: boolean;
  updated_at: string;
  updated_by?: string;
}

export type BookCategory = 
  | 'All'
  | 'Computer Science'
  | 'Artificial Intelligence'
  | 'Engineering'
  | 'Mathematics'
  | 'Business & Finance'
  | 'Science'
  | 'Fiction & Literature'
  | 'Self Development';
