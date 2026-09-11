import {
  AppSettings,
  BookmarkItem,
  GoogleAppItem,
  AIToolItem,
  ShortcutItem,
  SearchEngineKey,
  TodoItem,
} from "../types";

export const DEFAULT_SETTINGS: AppSettings = {
  themeColor: "blue",
  customHexColor: "#4382ec",
  themeMode: "system",
  cardOpacity: 0.92,
  wallpaperType: "none",
  customWallpaperUrl: "",
  wallpaperBlur: 0,
  wallpaperDim: 20,

  showShortcuts: true,
  adaptiveIcons: false,
  shortcutsPerRow: 5,
  shortcutsOnlyIcons: true,
  showNotepad: true,

  showClock: true,
  clockType: "analog",
  is12Hour: true,
  showSeconds: false,
  showGreeting: true,
  userName: "Friend",
  showCustomText: true,
  customText: "Make today inspiring and productive ✨",

  showWeather: true,
  weatherCardOnly: false,
  tempUnit: "C",
  showMinMaxTemp: true,
  useGPS: true,
  customLocation: "",

  defaultSearchEngine: "google",
  showSearchEnginesBar: true,
  showVoiceSearch: true,
  showAIModeBtn: true,
  showSuggestions: true,

  showQuotes: true,
  dailyQuoteOnly: false,

  showTodoList: true,
  showBookmarks: true,
  showAITools: true,
  aiToolsOnlyIcons: true,
  showGoogleApps: true,
};

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: "sc-1",
    title: "YouTube",
    url: "https://youtube.com",
    domain: "youtube.com",
    customColor: "#ff0000",
  },
  {
    id: "sc-2",
    title: "Gmail",
    url: "https://mail.google.com",
    domain: "mail.google.com",
    customColor: "#ea4335",
  },
  {
    id: "sc-3",
    title: "GitHub",
    url: "https://github.com",
    domain: "github.com",
    customColor: "#24292e",
  },
  {
    id: "sc-4",
    title: "Reddit",
    url: "https://reddit.com",
    domain: "reddit.com",
    customColor: "#ff4500",
  },
  {
    id: "sc-5",
    title: "X / Twitter",
    url: "https://x.com",
    domain: "x.com",
    customColor: "#000000",
  },
  {
    id: "sc-6",
    title: "Netflix",
    url: "https://netflix.com",
    domain: "netflix.com",
    customColor: "#e50914",
  },
  {
    id: "sc-7",
    title: "Spotify",
    url: "https://open.spotify.com",
    domain: "spotify.com",
    customColor: "#1db954",
  },
  {
    id: "sc-8",
    title: "Notion",
    url: "https://notion.so",
    domain: "notion.so",
    customColor: "#000000",
  },
  {
    id: "sc-9",
    title: "Wikipedia",
    url: "https://wikipedia.org",
    domain: "wikipedia.org",
    customColor: "#333333",
  },
  {
    id: "sc-10",
    title: "Google Drive",
    url: "https://drive.google.com",
    domain: "drive.google.com",
    customColor: "#34a853",
  },
];

export const DEFAULT_TODOS: TodoItem[] = [
  {
    id: "todo-1",
    text: "Customize Material You theme in Settings 🎨",
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: "todo-2",
    text: "Add your favorite shortcuts to dashboard",
    completed: true,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "todo-3",
    text: "Try out voice search or AI Tools dock",
    completed: false,
    createdAt: Date.now() - 10800000,
  },
];

export const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  {
    id: "bm-1",
    title: "Material 3 Guidelines",
    url: "https://m3.material.io",
    category: "Design",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "bm-2",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    category: "Development",
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: "bm-3",
    title: "Google AI Studio",
    url: "https://ai.studio",
    category: "AI & Tools",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "bm-4",
    title: "GitHub Trending",
    url: "https://github.com/trending",
    category: "Development",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "bm-5",
    title: "Hacker News",
    url: "https://news.ycombinator.com",
    category: "News",
    createdAt: Date.now() - 86400000 * 1,
  },
];

export const AI_TOOLS_LIST: AIToolItem[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    icon: "MessageSquare",
    enabled: true,
    description: "OpenAI conversational assistant",
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com",
    icon: "Sparkles",
    enabled: true,
    description: "Google's multimodal intelligence",
  },
  {
    id: "claude",
    name: "Claude",
    url: "https://claude.ai",
    icon: "Bot",
    enabled: true,
    description: "Anthropic deep reasoning model",
  },
  {
    id: "copilot",
    name: "Copilot",
    url: "https://copilot.microsoft.com",
    icon: "Compass",
    enabled: true,
    description: "Microsoft AI companion",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    url: "https://perplexity.ai",
    icon: "Search",
    enabled: true,
    description: "Conversational answer engine",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
    icon: "Cpu",
    enabled: true,
    description: "DeepSeek reasoning chat",
  },
  {
    id: "grok",
    name: "Grok",
    url: "https://grok.com",
    icon: "Zap",
    enabled: true,
    description: "xAI real-time insights",
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    url: "https://www.meta.ai",
    icon: "Share2",
    enabled: false,
    description: "Llama powered assistant",
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    url: "https://firefly.adobe.com",
    icon: "Palette",
    enabled: false,
    description: "Generative AI for creative design",
  },
];

export const GOOGLE_APPS: GoogleAppItem[] = [
  {
    id: "g-search",
    name: "Search",
    url: "https://google.com",
    iconBg: "#4285f4",
    iconColor: "#ffffff",
    iconName: "Search",
  },
  {
    id: "g-youtube",
    name: "YouTube",
    url: "https://youtube.com",
    iconBg: "#ff0000",
    iconColor: "#ffffff",
    iconName: "PlaySquare",
  },
  {
    id: "g-gmail",
    name: "Gmail",
    url: "https://mail.google.com",
    iconBg: "#ea4335",
    iconColor: "#ffffff",
    iconName: "Mail",
  },
  {
    id: "g-drive",
    name: "Drive",
    url: "https://drive.google.com",
    iconBg: "#34a853",
    iconColor: "#ffffff",
    iconName: "HardDrive",
  },
  {
    id: "g-docs",
    name: "Docs",
    url: "https://docs.google.com",
    iconBg: "#4285f4",
    iconColor: "#ffffff",
    iconName: "FileText",
  },
  {
    id: "g-sheets",
    name: "Sheets",
    url: "https://sheets.google.com",
    iconBg: "#0f9d58",
    iconColor: "#ffffff",
    iconName: "Table",
  },
  {
    id: "g-slides",
    name: "Slides",
    url: "https://slides.google.com",
    iconBg: "#f4b400",
    iconColor: "#ffffff",
    iconName: "Presentation",
  },
  {
    id: "g-calendar",
    name: "Calendar",
    url: "https://calendar.google.com",
    iconBg: "#4285f4",
    iconColor: "#ffffff",
    iconName: "Calendar",
  },
  {
    id: "g-meet",
    name: "Meet",
    url: "https://meet.google.com",
    iconBg: "#00897b",
    iconColor: "#ffffff",
    iconName: "Video",
  },
  {
    id: "g-maps",
    name: "Maps",
    url: "https://maps.google.com",
    iconBg: "#34a853",
    iconColor: "#ffffff",
    iconName: "MapPin",
  },
  {
    id: "g-photos",
    name: "Photos",
    url: "https://photos.google.com",
    iconBg: "#ea4335",
    iconColor: "#ffffff",
    iconName: "Image",
  },
  {
    id: "g-keep",
    name: "Keep",
    url: "https://keep.google.com",
    iconBg: "#fbbc04",
    iconColor: "#202124",
    iconName: "Lightbulb",
  },
  {
    id: "g-translate",
    name: "Translate",
    url: "https://translate.google.com",
    iconBg: "#4285f4",
    iconColor: "#ffffff",
    iconName: "Languages",
  },
  {
    id: "g-news",
    name: "News",
    url: "https://news.google.com",
    iconBg: "#ea4335",
    iconColor: "#ffffff",
    iconName: "Newspaper",
  },
];

export const SEARCH_ENGINES: Record<
  SearchEngineKey,
  {
    name: string;
    searchUrl: string;
    placeholder: string;
    icon: string;
    hint: string;
  }
> = {
  google: {
    name: "Google",
    searchUrl: "https://www.google.com/search?q=",
    placeholder: "Search with Google or enter URL",
    icon: "Search",
    hint: "Google Search",
  },
  duckduckgo: {
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=",
    placeholder: "Search privately with DuckDuckGo",
    icon: "Shield",
    hint: "DuckDuckGo Private Search",
  },
  bing: {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    placeholder: "Search with Microsoft Bing",
    icon: "Compass",
    hint: "Microsoft Bing",
  },
  brave: {
    name: "Brave",
    searchUrl: "https://search.brave.com/search?q=",
    placeholder: "Search independently with Brave",
    icon: "Flame",
    hint: "Brave Search",
  },
  youtube: {
    name: "YouTube",
    searchUrl: "https://www.youtube.com/results?search_query=",
    placeholder: "Search videos on YouTube",
    icon: "PlaySquare",
    hint: "YouTube Videos",
  },
  reddit: {
    name: "Reddit",
    searchUrl: "https://www.reddit.com/search/?q=",
    placeholder: "Search discussions on Reddit",
    icon: "MessageCircle",
    hint: "Reddit Community",
  },
  wikipedia: {
    name: "Wikipedia",
    searchUrl: "https://en.wikipedia.org/wiki/Special:Search?search=",
    placeholder: "Search knowledge on Wikipedia",
    icon: "BookOpen",
    hint: "Wikipedia Encyclopedia",
  },
  quora: {
    name: "Quora",
    searchUrl: "https://www.quora.com/search?q=",
    placeholder: "Ask questions on Quora",
    icon: "HelpCircle",
    hint: "Quora Q&A",
  },
  gemini: {
    name: "Gemini AI",
    searchUrl: "https://gemini.google.com/app?q=",
    placeholder: "Ask Google Gemini AI anything...",
    icon: "Sparkles",
    hint: "Google Gemini AI",
  },
};

export const MOTIVATIONAL_QUOTES = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote:
      "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
  },
  {
    quote: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
  {
    quote: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    quote: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
  },
];
