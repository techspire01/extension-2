/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  ShortcutItem,
  TodoItem,
  BookmarkItem,
  AIToolItem,
  SearchEngineKey,
} from './types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SHORTCUTS,
  DEFAULT_TODOS,
  DEFAULT_BOOKMARKS,
  AI_TOOLS_LIST,
} from './data/defaultData';
import { applyThemeVariables } from './theme/materialTheme';

import { TopBar } from './components/TopBar';
import { ClockWidget } from './components/ClockWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { SearchBar } from './components/SearchBar';
import { QuotesWidget } from './components/QuotesWidget';
import { ShortcutsGrid } from './components/ShortcutsGrid';
import { AIToolsDock } from './components/AIToolsDock';
import { TodoListDrawer } from './components/TodoListDrawer';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { GoogleAppsMenu } from './components/GoogleAppsMenu';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ExtensionExportModal } from './components/ExtensionExportModal';

export default function App() {
  // 1. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('mynt_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // 2. Shortcuts State
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(() => {
    try {
      const saved = localStorage.getItem('mynt_shortcuts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_SHORTCUTS;
  });

  // 3. ToDos State
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem('mynt_todos');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_TODOS;
  });

  // 4. Bookmarks State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('mynt_bookmarks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_BOOKMARKS;
  });

  // 5. AI Tools State
  const [aiTools, setAiTools] = useState<AIToolItem[]>(() => {
    try {
      const saved = localStorage.getItem('mynt_ai_tools');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return AI_TOOLS_LIST;
  });

  // Active Drawers / Modals
  const [isTodoListOpen, setIsTodoListOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isGoogleAppsOpen, setIsGoogleAppsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // Sync settings with localStorage and apply dynamic Material You variables
  useEffect(() => {
    localStorage.setItem('mynt_settings', JSON.stringify(settings));
    applyThemeVariables(
      settings.themeColor,
      settings.customHexColor,
      settings.themeMode,
      settings.cardOpacity
    );
  }, [
    settings.themeColor,
    settings.customHexColor,
    settings.themeMode,
    settings.cardOpacity,
  ]);

  // Sync state items to localStorage
  useEffect(() => {
    localStorage.setItem('mynt_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem('mynt_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('mynt_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('mynt_ai_tools', JSON.stringify(aiTools));
  }, [aiTools]);

  // Handlers
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to defaults? Your shortcuts and tasks will remain.')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Shortcuts actions
  const handleAddShortcut = (item: Omit<ShortcutItem, 'id'>) => {
    const newShortcut: ShortcutItem = {
      ...item,
      id: `sc-${Date.now()}`,
    };
    setShortcuts((prev) => [...prev, newShortcut]);
  };

  const handleUpdateShortcut = (id: string, updated: Partial<ShortcutItem>) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteShortcut = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  };

  // Todo actions
  const handleAddTodo = (text: string) => {
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompletedTodos = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  // Bookmark actions
  const handleAddBookmark = (item: Omit<BookmarkItem, 'id' | 'createdAt'>) => {
    const newBm: BookmarkItem = {
      ...item,
      id: `bm-${Date.now()}`,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [newBm, ...prev]);
  };

  const handleUpdateBookmark = (id: string, updated: Partial<BookmarkItem>) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // AI Tool toggle
  const handleToggleAITool = (id: string) => {
    setAiTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const unreadTodosCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden transition-colors duration-300">
      {/* Background Wallpaper Layer (if enabled) */}
      {settings.wallpaperType !== 'none' && settings.customWallpaperUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url(${settings.customWallpaperUrl})`,
            filter: `blur(${settings.wallpaperBlur}px)`,
          }}
        >
          {/* Dimming overlay */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: settings.wallpaperDim / 100 }}
          />
        </div>
      )}

      {/* Top Bar Header */}
      <TopBar
        settings={settings}
        unreadTodosCount={unreadTodosCount}
        onOpenTodoList={() => setIsTodoListOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenGoogleApps={() => setIsGoogleAppsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
      />

      {/* Main Center Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-5xl mx-auto w-full">
        {/* Split / Responsive Hero (Clock & Weather) */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-6">
          {/* Left / Center: Clock & Greeting */}
          <div className="flex-1 flex justify-center">
            <ClockWidget
              settings={settings}
              onUpdateCustomText={(text) =>
                handleUpdateSettings({ customText: text })
              }
              onUpdateUserName={(name) =>
                handleUpdateSettings({ userName: name })
              }
            />
          </div>

          {/* Right / Secondary: Live Weather */}
          {settings.showWeather && (
            <div className="shrink-0 flex justify-center">
              <WeatherWidget
                settings={settings}
                onOpenSettingsWeather={() => setIsSettingsOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Material You Pill Search Bar */}
        <SearchBar
          settings={settings}
          onUpdateEngine={(engine: SearchEngineKey) =>
            handleUpdateSettings({ defaultSearchEngine: engine })
          }
        />

        {/* Motivational Quotes */}
        <QuotesWidget settings={settings} />

        {/* Customizable Quick Access Dashboard (Shortcuts Grid) */}
        <ShortcutsGrid
          settings={settings}
          shortcuts={shortcuts}
          onAddShortcut={handleAddShortcut}
          onUpdateShortcut={handleUpdateShortcut}
          onDeleteShortcut={handleDeleteShortcut}
          onReorderShortcuts={(reordered) => setShortcuts(reordered)}
          onUpdateSettings={handleUpdateSettings}
        />
      </main>

      {/* Floating AI Tools Dock at bottom */}
      <AIToolsDock
        settings={settings}
        tools={aiTools}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals & Slide-over Drawers */}
      <TodoListDrawer
        isOpen={isTodoListOpen}
        onClose={() => setIsTodoListOpen(false)}
        todos={todos}
        onAddTodo={handleAddTodo}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
        onClearCompleted={handleClearCompletedTodos}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onAddBookmark={handleAddBookmark}
        onUpdateBookmark={handleUpdateBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      <GoogleAppsMenu
        isOpen={isGoogleAppsOpen}
        onClose={() => setIsGoogleAppsOpen(false)}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        aiTools={aiTools}
        onToggleAITool={handleToggleAITool}
        onResetSettings={handleResetSettings}
      />

      <ExtensionExportModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </div>
  );
}
