import React, { useRef, useEffect } from 'react';
import {
  Search,
  Mail,
  HardDrive,
  FileText,
  Table,
  Presentation,
  Calendar,
  Video,
  MapPin,
  Image,
  Lightbulb,
  Languages,
  Newspaper,
  PlaySquare,
  Globe,
  Compass,
  BookOpen,
  ShoppingBag,
  MessageCircle,
  Music,
  Code,
  Bot,
  Sparkles,
  Settings,
  X,
} from 'lucide-react';
import { GOOGLE_APPS } from '../data/defaultData';
import { GoogleAppItem } from '../types';

interface GoogleAppsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  apps?: GoogleAppItem[];
  onOpenSettings?: () => void;
}

export const GoogleAppsMenu: React.FC<GoogleAppsMenuProps> = ({
  isOpen,
  onClose,
  apps = GOOGLE_APPS,
  onOpenSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };

  const renderIcon = (name: string, url: string) => {
    switch (name) {
      case 'Search':
        return <Search className="w-5 h-5 text-blue-500" />;
      case 'PlaySquare':
        return <PlaySquare className="w-5 h-5 text-red-500" />;
      case 'Mail':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-emerald-500" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Table':
        return <Table className="w-5 h-5 text-green-600" />;
      case 'Presentation':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'Video':
        return <Video className="w-5 h-5 text-teal-500" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-red-500" />;
      case 'Image':
        return <Image className="w-5 h-5 text-amber-500" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-blue-500" />;
      case 'Newspaper':
        return <Newspaper className="w-5 h-5 text-red-500" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-sky-500" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-cyan-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case 'Music':
        return <Music className="w-5 h-5 text-pink-500" />;
      case 'Code':
        return <Code className="w-5 h-5 text-violet-500" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-purple-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default: {
        const domain = getDomain(url);
        if (domain) {
          return (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt=""
              className="w-5 h-5 object-contain rounded-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          );
        }
        return <Globe className="w-5 h-5 text-blue-500" />;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start p-4 sm:p-6 pointer-events-none">
      <div
        ref={containerRef}
        id="iconContainer"
        className="pointer-events-auto mt-12 w-80 sm:w-88 rounded-3xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline)] shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--md-sys-color-outline)]/40">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Apps
          </span>
          <div className="flex items-center gap-1">
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                title="Edit Apps in Settings"
                className="p-1.5 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface)] transition-all active:scale-95 group select-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--md-sys-color-surface)] shadow-xs border border-[var(--md-sys-color-outline)]/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                {renderIcon(app.iconName, app.url)}
              </div>
              <span className="text-xs font-medium text-center truncate w-full">
                {app.name}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline)]/40 flex items-center justify-between text-xs">
          {onOpenSettings ? (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
            >
              Customize in Settings →
            </button>
          ) : (
            <span />
          )}
          <a
            href="https://about.google/products/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] hover:underline"
          >
            Google Products
          </a>
        </div>
      </div>
    </div>
  );
};
