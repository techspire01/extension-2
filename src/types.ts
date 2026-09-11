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

export type ScrumStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
export type ScrumPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type ScrumIssueType = 'task' | 'story' | 'bug';
export type SprintStatus = 'planned' | 'active' | 'completed';

export interface ScrumChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ScrumComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface ScrumHistoryEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface ScrumTask {
  id: string;
  key: string;
  title: string;
  description: string;
  type: ScrumIssueType;
  status: ScrumStatus;
  priority: ScrumPriority;
  sprintId: string | null;
  eta: string | null;
  estimatedMinutes: number | null;
  labels: string[];
  checklist: ScrumChecklistItem[];
  comments: ScrumComment[];
  history: ScrumHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  reminderSentAt?: string | null;
  overdueNotifiedAt?: string | null;
}

export interface ScrumSprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
}

export interface ScrumFilters {
  query: string;
  priorities: ScrumPriority[];
  statuses: ScrumStatus[];
  eta: 'all' | 'upcoming' | 'due-soon' | 'overdue' | 'none';
  label: string;
}

export interface ScrumSettings {
  notificationsEnabled: boolean;
  etaReminders: boolean;
  overdueReminders: boolean;
  sprintReminders: boolean;
  reminderMinutes: number;
  defaultPriority: ScrumPriority;
  defaultSort: 'manual' | 'priority' | 'eta' | 'updated';
  incompleteSprintAction: 'backlog' | 'next-sprint';
}

export interface ScrumBoardData {
  version: 1;
  tasks: ScrumTask[];
  sprints: ScrumSprint[];
  activeSprintId: string | null;
  settings: ScrumSettings;
  nextTaskNumber: number;
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
