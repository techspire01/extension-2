import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Image as ImageIcon,
  Clock,
  CloudSun,
  Search,
  CheckSquare,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Eye,
  SlidersHorizontal,
  Grid,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  MapPin,
} from 'lucide-react';
import {
  AppSettings,
  ThemeColorName,
  ThemeMode,
  ClockType,
  SearchEngineKey,
  AIToolItem,
  GoogleAppItem,
} from '../types';
import { PRESET_THEMES } from '../theme/materialTheme';
import { SEARCH_ENGINES, GOOGLE_APPS } from '../data/defaultData';
import { LocationSuggestion, searchLocations } from '../utils/weatherApi';

const APP_ICONS_LIST = [
  'Search',
  'Mail',
  'PlaySquare',
  'HardDrive',
  'FileText',
  'Table',
  'Presentation',
  'Calendar',
  'Video',
  'MapPin',
  'Image',
  'Lightbulb',
  'Languages',
  'Newspaper',
  'Globe',
  'Compass',
  'BookOpen',
  'ShoppingBag',
  'MessageCircle',
  'Music',
  'Code',
  'Bot',
  'Sparkles',
];

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  aiTools: AIToolItem[];
  onToggleAITool: (id: string) => void;
  onResetSettings: () => void;
  googleApps?: GoogleAppItem[];
  onUpdateGoogleApps?: (apps: GoogleAppItem[]) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  aiTools,
  onToggleAITool,
  onResetSettings,
  googleApps = GOOGLE_APPS,
  onUpdateGoogleApps,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Google Apps Launcher Editor State
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [appIcon, setAppIcon] = useState('Globe');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  useEffect(() => {
    if (settings.useGPS || settings.customLocation.trim().length < 2) {
      setLocationSuggestions([]);
      setIsSearchingLocations(false);
      return;
    }

    let isCurrent = true;
    setIsSearchingLocations(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchLocations(settings.customLocation);
        if (isCurrent) setLocationSuggestions(results);
      } catch {
        if (isCurrent) setLocationSuggestions([]);
      } finally {
        if (isCurrent) setIsSearchingLocations(false);
      }
    }, 350);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [settings.customLocation, settings.useGPS]);

  const handleStartAddApp = () => {
    setIsAddingApp(true);
    setEditingAppId(null);
    setAppName('');
    setAppUrl('');
    setAppIcon('Globe');
  };

  const handleStartEditApp = (app: GoogleAppItem) => {
    setEditingAppId(app.id);
    setIsAddingApp(false);
    setAppName(app.name);
    setAppUrl(app.url);
    setAppIcon(app.iconName || 'Globe');
  };

  const handleSaveApp = () => {
    if (!appName.trim() || !appUrl.trim()) return;
    let formattedUrl = appUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (editingAppId) {
      const updated = googleApps.map((app) =>
        app.id === editingAppId
          ? {
              ...app,
              name: appName.trim(),
              url: formattedUrl,
              iconName: appIcon,
            }
          : app
      );
      onUpdateGoogleApps?.(updated);
      setEditingAppId(null);
    } else {
      const newApp: GoogleAppItem = {
        id: `gapp-${Date.now()}`,
        name: appName.trim(),
        url: formattedUrl,
        iconBg: '#4285f4',
        iconColor: '#ffffff',
        iconName: appIcon,
      };
      onUpdateGoogleApps?.([...googleApps, newApp]);
      setIsAddingApp(false);
    }
    setAppName('');
    setAppUrl('');
  };

  const handleDeleteApp = (id: string) => {
    const updated = googleApps.filter((app) => app.id !== id);
    onUpdateGoogleApps?.(updated);
  };

  const handleMoveApp = (index: number, direction: 'up' | 'down') => {
    const newApps = [...googleApps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newApps.length) return;
    const [moved] = newApps.splice(index, 1);
    newApps.splice(targetIndex, 0, moved);
    onUpdateGoogleApps?.(newApps);
  };

  const handleResetApps = () => {
    if (window.confirm('Reset apps launcher to default Google apps?')) {
      onUpdateGoogleApps?.(GOOGLE_APPS);
    }
  };

  if (!isOpen) return null;

  // Custom Wallpaper upload handler
  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdateSettings({
        wallpaperType: 'custom',
        customWallpaperUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Backup settings JSON
  const handleBackup = () => {
    const backupData = {
      settings,
      googleApps,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'material-you-new-tab-backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore settings JSON
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) {
          onUpdateSettings(parsed.settings);
          if (parsed.googleApps && onUpdateGoogleApps) {
            onUpdateGoogleApps(parsed.googleApps);
          }
        } else {
          onUpdateSettings(parsed);
        }
        alert('Settings successfully restored!');
      } catch {
        alert('Invalid settings backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="menuBar"
        className="w-full max-w-lg h-full bg-[var(--md-sys-color-surface-container-high)] border-l border-[var(--md-sys-color-outline)] shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-250 select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--md-sys-color-outline)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--md-sys-color-on-surface)]">
                Customization & Settings
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Material You Personalization
              </p>
            </div>
          </div>

          <button
            id="menuCloseButton"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1 custom-scrollbar">
          {/* SECTION 1: THEME & COLOR */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <Palette className="w-4 h-4" />
              <span>Theme & Material You Colors</span>
            </div>

            {/* Mode Switcher */}
            <div
              id="themeSegment"
              className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/50"
            >
              {[
                { mode: 'light', label: 'Light', icon: Sun },
                { mode: 'dark', label: 'Dark', icon: Moon },
                { mode: 'system', label: 'System', icon: Monitor },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() =>
                    onUpdateSettings({ themeMode: mode as ThemeMode })
                  }
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    settings.themeMode === mode
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Material You Color Swatches */}
            <div>
              <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
                Dynamic Material Palette
              </label>
              <div id="colorsContainer" className="flex items-center flex-wrap gap-2.5">
                {(
                  Object.keys(PRESET_THEMES) as (keyof typeof PRESET_THEMES)[]
                ).map((colorKey) => {
                  const preset = PRESET_THEMES[colorKey];
                  const isSelected = settings.themeColor === colorKey;
                  return (
                    <button
                      key={colorKey}
                      onClick={() =>
                        onUpdateSettings({
                          themeColor: colorKey as ThemeColorName,
                        })
                      }
                      title={preset.name}
                      className={`w-9 h-9 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-[var(--md-sys-color-primary)] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                      )}
                    </button>
                  );
                })}

                {/* Custom Color Picker Swatch */}
                <label
                  title="Custom Accent Color"
                  className={`w-9 h-9 rounded-full cursor-pointer relative flex items-center justify-center border-2 border-dashed border-[var(--md-sys-color-outline)] overflow-hidden ${
                    settings.themeColor === 'custom'
                      ? 'ring-2 ring-offset-2 ring-[var(--md-sys-color-primary)] scale-110'
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      settings.themeColor === 'custom'
                        ? settings.customHexColor
                        : 'transparent',
                  }}
                >
                  <input
                    type="color"
                    value={settings.customHexColor || '#4382ec'}
                    onChange={(e) =>
                      onUpdateSettings({
                        themeColor: 'custom',
                        customHexColor: e.target.value,
                      })
                    }
                    className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  />
                  {settings.themeColor !== 'custom' && (
                    <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
                      +
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Global UI Opacity / Transparency */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1">
                <span id="opacityTitle">UI Transparency & Glassmorphism</span>
                <span id="opacityLevel" className="font-bold text-[var(--md-sys-color-primary)]">
                  {Math.round(settings.cardOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={settings.cardOpacity}
                onChange={(e) =>
                  onUpdateSettings({ cardOpacity: parseFloat(e.target.value) })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer"
              />
              <p className="mt-1 text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                At 0%, reopen Settings with Ctrl/Cmd + Shift + S.
              </p>
            </div>
          </section>

          {/* SECTION 2: WALLPAPER */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <ImageIcon className="w-4 h-4" />
              <span>Wallpaper & Background</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                id="clearImage"
                onClick={() =>
                  onUpdateSettings({
                    wallpaperType: 'none',
                    customWallpaperUrl: '',
                  })
                }
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  settings.wallpaperType === 'none'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                    : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                }`}
              >
                Solid Color
              </button>

              <button
                id="randomImageTrigger"
                onClick={() =>
                  onUpdateSettings({
                    wallpaperType: 'random',
                    customWallpaperUrl: `https://picsum.photos/1920/1080?random=${Date.now()}`,
                  })
                }
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  settings.wallpaperType === 'random'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                    : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                }`}
              >
                Daily Landscape
              </button>

              <button
                id="uploadTrigger"
                onClick={() => fileInputRef.current?.click()}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  settings.wallpaperType === 'custom'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                    : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                }`}
              >
                Upload Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleWallpaperUpload}
                className="hidden"
              />
            </div>

            {settings.wallpaperType !== 'none' && (
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">
                    <span>Wallpaper Blur</span>
                    <span>{settings.wallpaperBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.wallpaperBlur}
                    onChange={(e) =>
                      onUpdateSettings({
                        wallpaperBlur: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)] mb-1">
                    <span>Wallpaper Dimming</span>
                    <span>{settings.wallpaperDim}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={settings.wallpaperDim}
                    onChange={(e) =>
                      onUpdateSettings({
                        wallpaperDim: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3: CLOCK & GREETING */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <Clock className="w-4 h-4" />
              <span>Clock & Personalized Greeting</span>
            </div>

            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="hideClockBox" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Show Clock
                  </div>
                  <div id="hideClockBoxInfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Display clock & date on new tab
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showClock}
                  onChange={(e) =>
                    onUpdateSettings({ showClock: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              {settings.showClock && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateSettings({ clockType: 'analog' })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        settings.clockType === 'analog'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                          : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                      }`}
                    >
                      Modern Analog Clock
                    </button>
                    <button
                      id="digitalclocktitle"
                      onClick={() => onUpdateSettings({ clockType: 'digital' })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        settings.clockType === 'digital'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                          : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                      }`}
                    >
                      Digital Clock
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                    <div>
                      <div id="timeformattitle" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                        12-Hour Format
                      </div>
                      <div id="timeformatinfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        Display time with AM / PM
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.is12Hour}
                      onChange={(e) =>
                        onUpdateSettings({ is12Hour: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                    <div>
                      <div id="greetingtitle" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                        Personalized Greeting
                      </div>
                      <div id="greetinginfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        Show greeting below the clock
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showGreeting}
                      onChange={(e) =>
                        onUpdateSettings({ showGreeting: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                    />
                  </label>

                  {settings.showGreeting && (
                    <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={settings.userName}
                        onChange={(e) =>
                          onUpdateSettings({ userName: e.target.value })
                        }
                        placeholder="Alex, Friend, etc."
                        className="w-full px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                    <div>
                      <div id="userTextTitle" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                        Customizable Text / Affirmation
                      </div>
                      <div id="userTextInfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        Show editable message or daily focus
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showCustomText}
                      onChange={(e) =>
                        onUpdateSettings({ showCustomText: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                    />
                  </label>
                </>
              )}
            </div>
          </section>

          {/* SECTION 4: WEATHER */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <CloudSun className="w-4 h-4" />
              <span>Weather Settings</span>
            </div>

            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="hideWeatherTitle" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Show Weather
                  </div>
                  <div id="hideWeatherInfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Display live temperature and conditions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showWeather}
                  onChange={(e) =>
                    onUpdateSettings({ showWeather: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              {settings.showWeather && (
                <>
                  <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                    <div>
                      <div id="hideWeatherBox" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                        Compact Pill Only
                      </div>
                      <div id="hideWeatherBoxInfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        Hide expanded humidity & details
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.weatherCardOnly}
                      onChange={(e) =>
                        onUpdateSettings({ weatherCardOnly: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onUpdateSettings({ tempUnit: 'C' })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        settings.tempUnit === 'C'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                          : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      id="fahrenheitCelsiusCheckbox"
                      onClick={() => onUpdateSettings({ tempUnit: 'F' })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        settings.tempUnit === 'F'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent'
                          : 'border-[var(--md-sys-color-outline)]/50 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span id="useGPS" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                        Use Live GPS Location
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.useGPS}
                        onChange={(e) =>
                          onUpdateSettings({ useGPS: e.target.checked })
                        }
                        className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                      />
                    </label>

                    {!settings.useGPS && (
                      <div className="relative">
                        <span id="UserLocText" className="block text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                          Manual City or Region
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. London, Tokyo, Paris"
                          value={settings.customLocation}
                          onFocus={() => setShowLocationSuggestions(true)}
                          onChange={(e) => {
                            onUpdateSettings({ customLocation: e.target.value });
                            setShowLocationSuggestions(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setShowLocationSuggestions(false);
                          }}
                          autoComplete="off"
                          className="w-full px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                        />
                        {showLocationSuggestions && settings.customLocation.trim().length >= 2 && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl overflow-hidden border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-high)] shadow-xl">
                            {isSearchingLocations ? (
                              <div className="px-3 py-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                Searching locations...
                              </div>
                            ) : locationSuggestions.length > 0 ? (
                              locationSuggestions.map((location) => {
                                const label = [
                                  location.name,
                                  location.admin1,
                                  location.country,
                                ].filter(Boolean).join(', ');
                                return (
                                  <button
                                    key={`${location.id}-${location.latitude}-${location.longitude}`}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      onUpdateSettings({ customLocation: label });
                                      setShowLocationSuggestions(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
                                  >
                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--md-sys-color-primary)]" />
                                    <span className="truncate">{label}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-3 py-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                No matching city found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* SECTION 5: SHORTCUTS DASHBOARD */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Quick Access Dashboard</span>
            </div>

            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="enableShortcutsText" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Show Dashboard Shortcuts
                  </div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Display shortcuts grid on new tab
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showShortcuts}
                  onChange={(e) =>
                    onUpdateSettings({ showShortcuts: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="adaptiveIconText" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Adaptive Material You Icons
                  </div>
                  <div id="adaptiveIconInfoText" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Tint icon tiles to match active dynamic palette
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.adaptiveIcons}
                  onChange={(e) =>
                    onUpdateSettings({ adaptiveIcons: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Only Icons (No Text Labels)
                  </div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Display clean icon tiles without site titles
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shortcutsOnlyIcons ?? true}
                  onChange={(e) =>
                    onUpdateSettings({ shortcutsOnlyIcons: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* SECTION 6: SEARCH & TOOLS */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <Search className="w-4 h-4" />
              <span>Search Options</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 space-y-1">
                <label className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase">
                  Default Search Engine
                </label>
                <select
                  value={settings.defaultSearchEngine}
                  onChange={(e) =>
                    onUpdateSettings({
                      defaultSearchEngine: e.target.value as SearchEngineKey,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface)] outline-none cursor-pointer"
                >
                  {(Object.keys(SEARCH_ENGINES) as SearchEngineKey[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {SEARCH_ENGINES[key].name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="hideSearchWith" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Search Engines Switcher Row
                  </div>
                  <div id="hideSearchWithInfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Display quick switcher chips below search bar
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showSearchEnginesBar}
                  onChange={(e) =>
                    onUpdateSettings({ showSearchEnginesBar: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="micIconTitle" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Voice Search Microphone
                  </div>
                  <div id="micIconInfo" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Enable voice typing input
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showVoiceSearch}
                  onChange={(e) =>
                    onUpdateSettings({ showVoiceSearch: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="search_suggestions_button" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Search Suggestions
                  </div>
                  <div id="search_suggestions_text" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Show instant autocomplete suggestions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showSuggestions}
                  onChange={(e) =>
                    onUpdateSettings({ showSuggestions: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* SECTION 7: AI TOOLS & APPS */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <Sparkles className="w-4 h-4" />
              <span>AI Tools & Productivity</span>
            </div>

            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                <div>
                  <div id="ai_tools_button" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                    Show AI Tools Dock
                  </div>
                  <div id="enable_ai_tools" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Quick launch dock for ChatGPT, Gemini, etc.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showAITools}
                  onChange={(e) =>
                    onUpdateSettings({ showAITools: e.target.checked })
                  }
                  className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </label>

              {settings.showAITools && (
                <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
                  <div>
                    <div className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                      Only Icons in Dock
                    </div>
                    <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                      Display compact icons without text labels in palette
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.aiToolsOnlyIcons ?? true}
                    onChange={(e) =>
                      onUpdateSettings({ aiToolsOnlyIcons: e.target.checked })
                    }
                    className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </label>
              )}

              {settings.showAITools && (
                <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase block">
                    Select Enabled AI Tools
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {aiTools.map((tool) => (
                      <label
                        key={tool.id}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={tool.enabled}
                          onChange={() => onToggleAITool(tool.id)}
                          className="w-3.5 h-3.5 accent-[var(--md-sys-color-primary)] cursor-pointer"
                        />
                        <span className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                          {tool.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION: APPS LAUNCHER (GOOGLE APPS) */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                <Grid className="w-4 h-4" />
                <span>Apps Launcher</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-medium">
                {googleApps.length} apps
              </span>
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                  Show Apps Launcher Button
                </div>
                <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  Displays the 3×3 grid icon on the top bar
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showGoogleApps}
                onChange={(e) =>
                  onUpdateSettings({ showGoogleApps: e.target.checked })
                }
                className="w-4 h-4 accent-[var(--md-sys-color-primary)] cursor-pointer"
              />
            </label>

            <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase">
                  Manage Apps
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetApps}
                    title="Reset to default Google apps"
                    className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleStartAddApp}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add App</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit App Form */}
              {(isAddingApp || editingAppId) && (
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-primary)]/40 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--md-sys-color-primary)]">
                      {editingAppId ? 'Edit App' : 'Add New App'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingApp(false);
                        setEditingAppId(null);
                      }}
                      className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1">
                        App Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GitHub, Notion, Gmail"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1">
                        URL / Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. https://github.com"
                        value={appUrl}
                        onChange={(e) => setAppUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1">
                      Choose Icon: <span className="text-[var(--md-sys-color-primary)] font-bold">{appIcon}</span>
                    </label>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 custom-scrollbar">
                      {APP_ICONS_LIST.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setAppIcon(ic)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-all ${
                            appIcon === ic
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                              : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingApp(false);
                        setEditingAppId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!appName.trim() || !appUrl.trim()}
                      onClick={handleSaveApp}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingAppId ? 'Update App' : 'Save App'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Apps List */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {googleApps.map((app, index) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-hover-tint)] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/30 flex items-center justify-center text-xs font-bold text-[var(--md-sys-color-primary)] shadow-xs shrink-0">
                        {app.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate max-w-44">
                          {app.url}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveApp(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface)] disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveApp(index, 'down')}
                        disabled={index === googleApps.length - 1}
                        title="Move Down"
                        className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface)] disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEditApp(app)}
                        title="Edit App"
                        className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface)] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        title="Delete App"
                        className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-red-500 hover:bg-[var(--md-sys-color-surface)] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 8: BACKUP & RESTORE */}
          <section className="space-y-3 pt-3 border-t border-[var(--md-sys-color-outline)]/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <Download className="w-4 h-4" />
              <span>Backup & Data</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="backupBtn"
                onClick={handleBackup}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/60 hover:bg-[var(--md-sys-color-hover-tint)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                <span>Export Backup</span>
              </button>

              <button
                id="restoreBtn"
                onClick={() => restoreInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/60 hover:bg-[var(--md-sys-color-hover-tint)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                <span>Restore Backup</span>
              </button>

              <input
                ref={restoreInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
            </div>

            <button
              id="resetsettings"
              onClick={onResetSettings}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Settings</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
