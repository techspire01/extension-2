export type ThemeColorName =
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'pink'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'custom';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ClockType = 'analog' | 'digital';

export type SearchEngineKey =
  | 'google'
  | 'duckduckgo'
  | 'bing'
  | 'brave'
  | 'youtube'
  | 'reddit'
  | 'wikipedia'
  | 'quora'
  | 'gemini';

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  icon?: string; // Custom image or icon name or emoji
  domain?: string;
  customColor?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  createdAt: number;
}

export interface AIToolItem {
  id: string;
  name: string;
  url: string;
  icon: string; // Lucide icon or brand identifier
  enabled: boolean;
  description: string;
}

export interface GoogleAppItem {
  id: string;
  name: string;
  url: string;
  iconBg: string;
  iconColor: string;
  iconName: string;
}

export interface WeatherData {
  city: string;
  temperature: number; // in Celsius by default
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  minTemp: number;
  maxTemp: number;
  isDay: boolean;
  lastUpdated: number;
}

export interface AppSettings {
  // Theme & Appearance
  themeColor: ThemeColorName;
  customHexColor: string;
  themeMode: ThemeMode;
  cardOpacity: number; // 0.0 - 1.0
  wallpaperType: 'none' | 'random' | 'custom';
  customWallpaperUrl: string;
  wallpaperBlur: number; // 0 - 20px
  wallpaperDim: number; // 0 - 80%

  // Shortcuts Dashboard
  showShortcuts: boolean;
  adaptiveIcons: boolean;
  shortcutsPerRow: number;
  shortcutsOnlyIcons?: boolean; // Show only icons without text labels

  // Clock & Greeting
  showClock: boolean;
  clockType: ClockType;
  is12Hour: boolean;
  showSeconds: boolean;
  showGreeting: boolean;
  userName: string;
  showCustomText: boolean;
  customText: string;

  // Weather
  showWeather: boolean;
  weatherCardOnly: boolean; // false = full card, true = minimal pill
  tempUnit: 'C' | 'F';
  showMinMaxTemp: boolean;
  useGPS: boolean;
  customLocation: string;
  weatherApiKey?: string;

  // Search
  defaultSearchEngine: SearchEngineKey;
  showSearchEnginesBar: boolean;
  showVoiceSearch: boolean;
  showAIModeBtn: boolean;
  showSuggestions: boolean;

  // Quotes
  showQuotes: boolean;
  dailyQuoteOnly: boolean;

  // Navigation / Tools
  showTodoList: boolean;
  showBookmarks: boolean;
  showAITools: boolean;
  aiToolsOnlyIcons?: boolean;
  showGoogleApps: boolean;
}
