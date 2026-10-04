import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  BookOpen, 
  Users, 
  DollarSign, 
  Sparkles, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  Save, 
  RotateCcw, 
  Download, 
  UploadCloud, 
  Pin, 
  Radio, 
  Search, 
  Eye, 
  AlertTriangle,
  Zap,
  Globe,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings, Book, UserProfile, StripeTransaction } from '../types';
import { 
  saveSiteSettings, 
  adminUpdateBook, 
  adminDeleteBook, 
  adminAddBook, 
  adminToggleFeatured, 
  adminUpdateUser, 
  adminDeleteUser,
  exportAllDataAsJSON,
  resetDemoData,
  getLocalDownloads,
  getLocalTransactions
} from '../lib/db';
import { formatBytes, truncateHash } from '../lib/crypto';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  books: Book[];
  onBooksUpdated: () => void;
  users: UserProfile[];
  onUsersUpdated: () => void;
  onNavigateHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  siteSettings,
  onSettingsUpdated,
  books,
  onBooksUpdated,
  users,
  onUsersUpdated,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'pricing' | 'books' | 'users' | 'analytics' | 'tools'>('content');
  
  // Local form state for site settings
  const [formData, setFormData] = useState<SiteSettings>({ ...siteSettings });
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Book management state
  const [bookSearch, setBookSearch] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [newBookModalOpen, setNewBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Computer Science');
  const [newBookDesc, setNewBookDesc] = useState('');

  // User management state
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  // Handle immediate site settings publish
  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSiteSettings(formData);
    onSettingsUpdated(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  // Quick field updates with instant save option
  const updateSettingField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
  };

  // Save Book Edit
  const handleSaveBookEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    adminUpdateBook(editingBook);
    onBooksUpdated();
    setEditingBook(null);
  };

  // Create Book
  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBook: Book = {
      id: `admin_book_${Date.now()}`,
      user_id: 'usr_admin',
      uploader_name: 'Developer Admin',
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || 'Curator',
      category: newBookCategory,
      description: newBookDesc.trim() || 'Added directly by website developer from Admin Panel.',
      file_url: 'https://example.com/storage/v1/book-pdfs/admin_book.pdf',
      file_hash: fakeHash,
      file_size: 6540000,
      page_count: 240,
      downloads_count: 0,
      is_featured: true,
      created_at: new Date().toISOString(),
    };

    adminAddBook(newBook);
    onBooksUpdated();
    setNewBookModalOpen(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookDesc('');
  };

  // Filtered books
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.category.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // Filtered users
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Download export JSON
  const handleExportJSON = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vishalpdf_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const totalDownloads = books.reduce((acc, b) => acc + (b.downloads_count || 0), 0);
  const transactions = getLocalTransactions();
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden my-auto">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Zap className="h-5 w-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Vishalpdf Developer Control Center</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="h-2.5 w-2.5 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Any change made here immediately updates the website for all visitors across browser sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSavedRecently && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Changes Published!
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              <Save className="h-3.5 w-3.5 fill-slate-950" />
              <span>Publish Changes Now</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Site Content & Banner</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Quota & Pricing Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'books'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Manage Library Books ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users & Credits Quota</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Metrics & Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tools'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Tools & Backups</span>
          </button>
        </div>

        {/* Tab 1: Live Site Content & Announcement Banner */}
        {activeTab === 'content' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            
            {/* Top Live Banner Controller */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="h-4 w-4 text-amber-400" />
                    <span>Global Announcement Banner (Broadcasts to All Pages)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Displays a prominent notification bar at the very top of the site for every visitor.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.announcement_banner.enabled}
                    onChange={(e) => {
                      const updated = {
                        ...formData,
                        announcement_banner: {
                          ...formData.announcement_banner,
                          enabled: e.target.checked,
                        },
                      };
                      setFormData(updated);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {formData.announcement_banner.enabled && (
                <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Banner Announcement Message
                    </label>
                    <input
                      type="text"
                      value={formData.announcement_banner.text}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          announcement_banner: { ...formData.announcement_banner, text: e.target.value }
                        });
                      }}
                      placeholder="e.g. Flash Promo: Get 5 free downloads today!"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Banner Style / Mood
                      </label>
                      <select
                        value={formData.announcement_banner.type}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            announcement_banner: { ...formData.announcement_banner, type: e.target.value as any }
                          });
                        }}
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="promo">Promo / Special (Amber Glow)</option>
                        <option value="info">Info / Announcement (Blue Indigo)</option>
                        <option value="warning">Alert / Maintenance (Rose Accent)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Button / Link Text
                      </label>
                      <input
                        type="text"
                        value={formData.announcement_banner.link_text || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            announcement_banner: { ...formData.announcement_banner, link_text: e.target.value }
                          });
                        }}
                        placeholder="e.g. View Plans"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Button Action
                      </label>
                      <select
                        value={formData.announcement_banner.link_action || 'pricing'}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            announcement_banner: { ...formData.announcement_banner, link_action: e.target.value as any }
                          });
                        }}
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="pricing">Open Pricing / Unlimited Modal</option>
                        <option value="upload">Open Upload PDF Modal</option>
                        <option value="explore">Scroll to Catalog</option>
                      </select>
                    </div>
                  </div>

                  {/* Real-time Preview of the banner */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Live Preview for Visitors:
                    </p>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                      formData.announcement_banner.type === 'promo'
                        ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-amber-500/40 text-amber-200'
                        : formData.announcement_banner.type === 'info'
                        ? 'bg-gradient-to-r from-indigo-500/20 to-sky-500/20 border-indigo-500/40 text-indigo-200'
                        : 'bg-rose-950/40 border-rose-800 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2 truncate">
                        <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                        <span className="truncate">{formData.announcement_banner.text || 'Preview text'}</span>
                      </div>
                      {formData.announcement_banner.link_text && (
                        <span className="underline ml-3 shrink-0 font-bold">
                          {formData.announcement_banner.link_text} &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Landing Page Typography & Copy Customizer */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span>Homepage Hero & Branding Customizer</span>
              </h3>
              <p className="text-xs text-slate-400">
                Change the main headline, subtitle, and badges on the homepage. Changes reflect immediately on save.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={formData.site_name}
                    onChange={(e) => updateSettingField('site_name', e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hero Top Pill Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.hero_badge_text}
                    onChange={(e) => updateSettingField('hero_badge_text', e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Main Hero Headline
                </label>
                <input
                  type="text"
                  value={formData.hero_headline}
                  onChange={(e) => updateSettingField('hero_headline', e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hero Subheadline Description
                </label>
                <textarea
                  rows={2}
                  value={formData.hero_subheadline}
                  onChange={(e) => updateSettingField('hero_subheadline', e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Save Action Bar */}
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">
                Last broadcast: {new Date(formData.updated_at).toLocaleTimeString()}
              </span>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                <Save className="h-4 w-4 fill-slate-950" />
                <span>Save & Broadcast Live to Website</span>
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Quota Rules & Pricing Customizer */}
        {activeTab === 'pricing' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>Business Logic, Quota & Stripe Checkout Configuration</span>
              </h3>
              <p className="text-xs text-slate-400">
                Adjust how many downloads users get for free, the upload-to-credit reward ratio, and Stripe checkout prices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Free Starter Credits */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Initial Free Downloads on Google Sign-in
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Number of download credits newly registered visitors receive.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.starter_free_credits}
                      onChange={(e) => updateSettingField('starter_free_credits', parseInt(e.target.value) || 5)}
                      className="w-24 rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm font-bold text-emerald-400 text-center focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">Credits</span>
                  </div>
                </div>

                {/* Uploads per Credit Ratio */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Uploads Needed to Earn 1 Credit
                  </label>
                  <p className="text-[11px] text-slate-400">
                    "Upload X unique PDFs to earn 1 free download credit."
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.uploads_per_credit}
                      onChange={(e) => updateSettingField('uploads_per_credit', parseInt(e.target.value) || 2)}
                      className="w-24 rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm font-bold text-indigo-400 text-center focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">Unique Uploads</span>
                  </div>
                </div>

                {/* Unlimited Pro Price */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Unlimited Lifetime Plan Price ($)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Charged via Stripe Checkout for unlimited downloads.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-sm font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={formData.unlimited_price}
                      onChange={(e) => updateSettingField('unlimited_price', parseInt(e.target.value) || 17)}
                      className="w-24 rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm font-bold text-amber-400 text-center focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">USD (Default: $17)</span>
                  </div>
                </div>

                {/* 100-Pack Price */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-white">
                    100-Pack Credit Boost Price ($)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Secondary purchase tier in Stripe modal.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-sm font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={formData.pack_price}
                      onChange={(e) => updateSettingField('pack_price', parseInt(e.target.value) || 9)}
                      className="w-24 rounded-lg bg-slate-950 border border-slate-700 p-2 text-sm font-bold text-indigo-400 text-center focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">USD (Default: $9)</span>
                  </div>
                </div>

              </div>

              {/* Maintenance Mode / Guest Access */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900">
                  <div>
                    <p className="text-xs font-bold text-white">Maintenance Mode</p>
                    <p className="text-[11px] text-slate-400">Show maintenance banner to non-admin visitors</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.maintenance_mode}
                    onChange={(e) => updateSettingField('maintenance_mode', e.target.checked)}
                    className="h-4 w-4 rounded text-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900">
                  <div>
                    <p className="text-xs font-bold text-white">Allow Direct Guest Downloads</p>
                    <p className="text-[11px] text-slate-400">Bypasses login requirement for downloading</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allow_guest_downloads}
                    onChange={(e) => updateSettingField('allow_guest_downloads', e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-500"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                <Save className="h-4 w-4 fill-slate-950" />
                <span>Save Quota Rules</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Books Library Manager (CRUD) */}
        {activeTab === 'books' && (
          <div className="flex-1 overflow-auto p-6 space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Filter books by title, author, or category..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={() => setNewBookModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Book Directly</span>
              </button>
            </div>

            {/* Books Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">SHA-256 Digest</th>
                    <th className="py-3 px-4">Downloads</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white line-clamp-1">{book.title}</p>
                        <p className="text-[11px] text-slate-400">{book.author}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-md bg-indigo-950/80 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-800">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {truncateHash(book.file_hash, 5, 5)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {book.downloads_count}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            adminToggleFeatured(book.id);
                            onBooksUpdated();
                          }}
                          className={`p-1 rounded-lg border text-xs flex items-center gap-1 ${
                            book.is_featured 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title="Toggle Featured on homepage"
                        >
                          <Pin className="h-3.5 w-3.5" />
                          <span>{book.is_featured ? 'Pinned' : 'Pin'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingBook(book)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                          title="Edit Book Details"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove "${book.title}" from Vishalpdf?`)) {
                              adminDeleteBook(book.id);
                              onBooksUpdated();
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/60 hover:text-rose-400"
                          title="Delete Book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal: Edit Book */}
            {editingBook && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white">Edit Book Document</h4>
                    <button onClick={() => setEditingBook(null)} className="text-slate-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBookEdit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingBook.title}
                        onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                        required
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                        <input
                          type="text"
                          value={editingBook.author}
                          onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Downloads Count</label>
                        <input
                          type="number"
                          value={editingBook.downloads_count}
                          onChange={(e) => setEditingBook({ ...editingBook, downloads_count: parseInt(e.target.value) || 0 })}
                          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                      <input
                        type="text"
                        value={editingBook.category}
                        onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingBook.description}
                        onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingBook(null)}
                        className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                      >
                        Save Book Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Direct Add Book */}
            {newBookModalOpen && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white">Add New Book to Library</h4>
                    <button onClick={() => setNewBookModalOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateBook} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                      <input
                        type="text"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        placeholder="e.g. Distributed Consensus Systems"
                        required
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                        <input
                          type="text"
                          value={newBookAuthor}
                          onChange={(e) => setNewBookAuthor(e.target.value)}
                          placeholder="Author name"
                          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                        <select
                          value={newBookCategory}
                          onChange={(e) => setNewBookCategory(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Artificial Intelligence">Artificial Intelligence</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Business & Finance">Business & Finance</option>
                          <option value="Self Development">Self Development</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={newBookDesc}
                        onChange={(e) => setNewBookDesc(e.target.value)}
                        placeholder="Book overview..."
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setNewBookModalOpen(false)}
                        className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        Inject Book into Library
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 4: Users & Credits Quota Manager */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-auto p-6 space-y-4">
            
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user accounts by email or name..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Download Credits</th>
                    <th className="py-3 px-4">Uploads</th>
                    <th className="py-3 px-4">Tier Status</th>
                    <th className="py-3 px-4 text-right">Quick Credit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{u.full_name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        {u.is_admin ? (
                          <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold">
                            Developer Admin
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Member</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {u.is_unlimited ? '∞' : u.download_credits} credits
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {u.upload_count} PDFs
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            adminUpdateUser(u.id, { is_unlimited: !u.is_unlimited });
                            onUsersUpdated();
                          }}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition-colors ${
                            u.is_unlimited 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {u.is_unlimited ? '👑 Unlimited Pro' : 'Free Tier'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            adminUpdateUser(u.id, { download_credits: (u.download_credits || 0) + 5 });
                            onUsersUpdated();
                          }}
                          className="rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1 text-[11px] font-semibold border border-indigo-500/40 transition-colors"
                          title="Grant 5 free download credits"
                        >
                          +5 Credits
                        </button>
                        <button
                          onClick={() => {
                            adminUpdateUser(u.id, { download_credits: 5 });
                            onUsersUpdated();
                          }}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 text-[11px] transition-colors"
                          title="Reset quota to default 5"
                        >
                          Reset to 5
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 5: Analytics & Metrics */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Platform Health & Activity Metrics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400">Total PDF Documents</p>
                <p className="text-2xl font-black text-white mt-1">{books.length}</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">100% SHA-256 Unique</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400">Total Downloads</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">{totalDownloads}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Across all catalog items</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400">Registered Accounts</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{users.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Google OAuth signed</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-400">Simulated Revenue</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">${totalRevenue.toFixed(2)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Stripe Checkout volume</p>
              </div>
            </div>

            {/* Transactions Log */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Stripe Transactions
              </h4>
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500">No payment transactions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-xs">
                      <div>
                        <p className="font-bold text-white">{t.plan_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{t.id} • {new Date(t.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">${(t.amount / 100).toFixed(2)} USD</p>
                        <span className="text-[10px] text-emerald-300 font-semibold">{t.payment_method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 6: Tools & Backups */}
        {activeTab === 'tools' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-sky-400" />
                <span>Export Platform Database Backup (JSON)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Download a complete JSON snapshot of all books, user profiles, site configurations, and download records.
              </p>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Database JSON Snapshot</span>
              </button>
            </div>

            <div className="rounded-2xl bg-rose-950/30 p-5 border border-rose-900/60 space-y-3">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Reset Database to Default Factory Seeds</span>
              </h3>
              <p className="text-xs text-slate-400">
                Reverts all books, default site settings, and purge mock downloads.
              </p>
              <button
                onClick={() => {
                  if (confirm('Reset Vishalpdf database back to initial default seed books and default settings?')) {
                    resetDemoData();
                    onBooksUpdated();
                    onSettingsUpdated({ ...siteSettings });
                    alert('Database has been reset to defaults.');
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-rose-700 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset All Data to Defaults</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
