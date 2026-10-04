import React from 'react';
import { SiteSettings } from '../types';
import { Sparkles, Info, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface AnnouncementBannerProps {
  settings: SiteSettings;
  onActionClick: (action?: 'pricing' | 'upload' | 'explore') => void;
  onOpenAdmin: () => void;
  isAdmin?: boolean;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  settings,
  onActionClick,
  onOpenAdmin,
  isAdmin,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (!settings.announcement_banner.enabled || dismissed) return null;

  const { text, type, link_text, link_action } = settings.announcement_banner;

  const styles = {
    promo: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold',
    info: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 text-white font-medium',
    warning: 'bg-gradient-to-r from-rose-600 to-orange-600 text-white font-semibold',
  };

  const icons = {
    promo: <Sparkles className="h-4 w-4 fill-slate-950 shrink-0" />,
    info: <Info className="h-4 w-4 shrink-0 text-sky-200" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-rose-200" />,
  };

  return (
    <div className={`relative w-full py-2.5 px-4 text-xs transition-all duration-300 shadow-xs z-50 ${styles[type] || styles.promo}`}>
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        
        <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
          {icons[type]}
          <span className="truncate">{text}</span>
          {link_text && (
            <button
              onClick={() => onActionClick(link_action)}
              className="inline-flex items-center gap-1 underline font-bold ml-1 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <span>{link_text}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden sm:inline-block rounded-md bg-black/25 hover:bg-black/40 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 transition-colors"
              title="Edit this banner in Admin Panel"
            >
              Edit in Admin
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-black/15 transition-colors"
            title="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
