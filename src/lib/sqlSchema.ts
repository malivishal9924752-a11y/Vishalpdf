/**
 * Vishalpdf - Production Supabase PostgreSQL Schema, Triggers, RLS, Storage & OAuth Setup.
 * 
 * This file exports full SQL strings and markdown setup guides that can be copied directly
 * into the Supabase SQL Editor and Project Settings.
 */

export const POSTGRES_SCHEMA_SQL = `-- ==============================================================================
-- VISHALPDF COMPLETE DATABASE SCHEMA, RLS POLICIES, STORAGE & TRIGGERS
-- Target: Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: PROFILES
-- Stores user account info, download credits, upload count, and unlimited status.
-- Automatically created via trigger when a user signs in via Google OAuth.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    download_credits INTEGER DEFAULT 5 NOT NULL CHECK (download_credits >= 0),
    upload_count INTEGER DEFAULT 0 NOT NULL CHECK (upload_count >= 0),
    is_unlimited BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies:
-- 1. Users can read their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 2. Users can update basic profile info
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Public read-only for public uploader names (if needed for catalog)
CREATE POLICY "Public profiles can be viewed by anyone"
    ON public.profiles
    FOR SELECT
    USING (true);


-- ==============================================================================
-- TABLE 2: BOOKS
-- Stores PDF metadata with a strict UNIQUE constraint on file_hash (SHA-256).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Unknown Author',
    description TEXT,
    category TEXT DEFAULT 'General',
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 64-char Hex (Prevents Duplicates)
    file_size BIGINT DEFAULT 0,
    page_count INTEGER DEFAULT 1,
    downloads_count INTEGER DEFAULT 0 NOT NULL CHECK (downloads_count >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for lightning-fast search and duplicate verification
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_file_hash ON public.books(file_hash);
CREATE INDEX IF NOT EXISTS idx_books_title_search ON public.books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_downloads ON public.books(downloads_count DESC);

-- Enable Row Level Security (RLS) on books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books RLS Policies:
-- 1. Anyone (even unauthenticated guests) can view and search books
CREATE POLICY "Allow public read access to books"
    ON public.books
    FOR SELECT
    USING (true);

-- 2. Authenticated users can insert new books
CREATE POLICY "Allow authenticated users to insert books"
    ON public.books
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own uploaded books
CREATE POLICY "Allow users to update own books"
    ON public.books
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Users can only delete their own uploaded books
CREATE POLICY "Allow users to delete own books"
    ON public.books
    FOR DELETE
    USING (auth.uid() = user_id);


-- ==============================================================================
-- TABLE 3: DOWNLOADS
-- Tracks user download history and audit trail.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_book_id ON public.downloads(book_id);

-- Enable Row Level Security (RLS) on downloads
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Downloads RLS Policies:
-- 1. Users can view their own download records
CREATE POLICY "Users can view their own download history"
    ON public.downloads
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Authenticated users can record downloads
CREATE POLICY "Authenticated users can record downloads"
    ON public.downloads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ==============================================================================
-- TABLE 4: TRANSACTIONS (Optional Stripe audit logging)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE,
    amount INTEGER NOT NULL, -- in cents
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'succeeded',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);


-- ==============================================================================
-- POSTGRESQL TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 1. Trigger Function: Automatically create profile upon Google OAuth signup
-- Sets initial free download quota = 5, upload count = 0
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        download_credits,
        upload_count,
        is_unlimited
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        5,  -- Initial Free Tier: 5 free downloads
        0,  -- Initial upload count
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Trigger Function: When a book is downloaded, increment books.downloads_count
CREATE OR REPLACE FUNCTION public.handle_book_downloaded()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.books
    SET downloads_count = downloads_count + 1
    WHERE id = NEW.book_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_download_recorded ON public.downloads;
CREATE TRIGGER on_download_recorded
    AFTER INSERT ON public.downloads
    FOR EACH ROW EXECUTE FUNCTION public.handle_book_downloaded();


-- 3. Stored Procedure: Atomic Download Request with Credit Decrement
CREATE OR REPLACE FUNCTION public.process_book_download(p_book_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_credits INT;
    v_unlimited BOOLEAN;
    v_file_url TEXT;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to download PDFs';
    END IF;

    -- Fetch user profile status
    SELECT download_credits, is_unlimited 
    INTO v_credits, v_unlimited
    FROM public.profiles
    WHERE id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- Fetch book URL
    SELECT file_url INTO v_file_url FROM public.books WHERE id = p_book_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Book not found';
    END IF;

    -- Check Quota
    IF NOT v_unlimited AND v_credits <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'QUOTA_EXHAUSTED',
            'message', 'Download quota reached. Upload 2 books or upgrade to Unlimited.'
        );
    END IF;

    -- Deduct credit if not unlimited
    IF NOT v_unlimited THEN
        UPDATE public.profiles
        SET download_credits = download_credits - 1,
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- Record download
    INSERT INTO public.downloads (user_id, book_id)
    VALUES (v_user_id, p_book_id);

    RETURN jsonb_build_object(
        'success', true,
        'file_url', v_file_url,
        'remaining_credits', CASE WHEN v_unlimited THEN -1 ELSE v_credits - 1 END,
        'is_unlimited', v_unlimited
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Stored Procedure: Handle Book Upload and Reward +1 Credit for Every 2 Uploads
CREATE OR REPLACE FUNCTION public.process_book_upload(
    p_title TEXT,
    p_author TEXT,
    p_description TEXT,
    p_category TEXT,
    p_file_url TEXT,
    p_file_hash VARCHAR(64),
    p_file_size BIGINT,
    p_page_count INT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_existing_id UUID;
    v_new_upload_count INT;
    v_earned_credit BOOLEAN := FALSE;
    v_book_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to upload PDFs';
    END IF;

    -- 1. Check for Duplicate Hash
    SELECT id INTO v_existing_id FROM public.books WHERE file_hash = p_file_hash;
    IF v_existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'DUPLICATE_HASH',
            'message', 'This PDF has already been uploaded.',
            'existing_book_id', v_existing_id
        );
    END IF;

    -- 2. Insert new book
    INSERT INTO public.books (
        user_id, title, author, description, category,
        file_url, file_hash, file_size, page_count
    ) VALUES (
        v_user_id, p_title, p_author, p_description, p_category,
        p_file_url, p_file_hash, p_file_size, p_page_count
    ) RETURNING id INTO v_book_id;

    -- 3. Update user upload count & award 1 credit for every 2 uploads
    UPDATE public.profiles
    SET upload_count = upload_count + 1,
        download_credits = CASE 
            WHEN (upload_count + 1) % 2 = 0 THEN download_credits + 1 
            ELSE download_credits 
        END,
        updated_at = NOW()
    WHERE id = v_user_id
    RETURNING upload_count, (upload_count % 2 = 0) INTO v_new_upload_count, v_earned_credit;

    RETURN jsonb_build_object(
        'success', true,
        'book_id', v_book_id,
        'upload_count', v_new_upload_count,
        'earned_credit', v_earned_credit
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & SECURITY POLICIES
-- Bucket Name: book-pdfs
-- ==============================================================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-pdfs', 'book-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy 1: Anyone can download/view files from public bucket
CREATE POLICY "Public Access to book-pdfs"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'book-pdfs');

-- Storage Policy 2: Authenticated users can upload PDFs (restricted to pdf mimetype)
CREATE POLICY "Authenticated users can upload to book-pdfs"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'book-pdfs' 
        AND auth.role() = 'authenticated'
        AND (LOWER(storage.extension(name)) = 'pdf' OR metadata->>'mimetype' = 'application/pdf')
    );
`;

export const SUPABASE_SETUP_GUIDE_MD = `# Vishalpdf - Supabase Setup & Google OAuth Guide

### Step 1: Create Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and click **"New Project"**.
2. Note your **Project URL** and **anon / public key** from *Settings > API*.

---

### Step 2: Configure Google OAuth in Supabase
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials**.
3. Create an **OAuth 2.0 Client ID** with Application type **Web application**.
4. In **Authorized redirect URIs**, add your Supabase Auth callback URL:
   \`\`\`
   https://<your-project-ref>.supabase.co/auth/v1/callback
   \`\`\`
5. Copy the generated **Client ID** and **Client Secret**.
6. In Supabase Dashboard, go to **Authentication > Providers > Google**.
7. Toggle **Enable Google provider**, paste your **Client ID** and **Client Secret**, and click **Save**.

---

### Step 3: Run Database Schema & Triggers
1. Open the Supabase **SQL Editor** tab.
2. Paste the SQL script provided above and click **RUN**.
3. This creates:
   - \`profiles\` table with default 5 download credits.
   - \`books\` table with unique SHA-256 hash constraint and full-text search.
   - \`downloads\` table for quota auditing.
   - Automatic trigger \`on_auth_user_created\` for Google OAuth signups.
   - Atomic functions \`process_book_download\` and \`process_book_upload\`.
   - \`book-pdfs\` storage bucket with secure RLS policies.

---

### Step 4: Stripe Checkout Setup ($17 Lifetime & 100-Pack)
1. In your Stripe Dashboard, create a Product named **Vishalpdf Unlimited Pass** ($17 one-time payment).
2. Create a webhook endpoint in your backend pointing to \`/api/stripe/webhook\`.
3. Listening events: \`checkout.session.completed\`.
4. On webhook trigger, update \`profiles.is_unlimited = TRUE\` where \`id = user_id\`.
`;
