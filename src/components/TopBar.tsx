import React from 'react';
import {
  CheckSquare,
  Bookmark,
  Grid,
  Settings,
} from 'lucide-react';
import { AppSettings } from '../types';

interface TopBarProps {
  settings: AppSettings;
  unreadTodosCount: number;
  onOpenTodoList: () => void;
  onOpenBookmarks: () => void;
  onOpenGoogleApps: () => void;
  onOpenSettings: () => void;
  onOpenExtensionModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  unreadTodosCount,
  onOpenTodoList,
  onOpenBookmarks,
  onOpenGoogleApps,
  onOpenSettings,
}) => {
  return (
    <header
      id="top-bar"
      className="w-full flex items-center justify-between px-6 py-4 z-20 pointer-events-auto"
    >
      {/* Left controls: ToDo, Bookmarks, Google Apps */}
      <div className="flex items-center gap-2.5">
        {settings.showTodoList && (
          <button
            id="todoListCont"
            onClick={onOpenTodoList}
            title="To-Do List"
            className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <CheckSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
            {unreadTodosCount > 0 && (
              <span
                id="todo-badge"
                className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-accent-dark)] text-white flex items-center justify-center shadow"
              >
                {unreadTodosCount}
              </span>
            )}
            <span className="sr-only">Open To-Do List</span>
          </button>
        )}

        {settings.showBookmarks && (
          <button
            id="bookmarkButton"
            onClick={onOpenBookmarks}
            title="Bookmarks"
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <Bookmark className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="sr-only">Open Bookmarks</span>
          </button>
        )}

        {settings.showGoogleApps && (
          <button
            id="googleAppsCont"
            onClick={onOpenGoogleApps}
            title="Google Apps"
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <Grid className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="sr-only">Google Apps</span>
          </button>
        )}
      </div>

      {/* Right controls: Settings */}
      <div className="flex items-center gap-2.5">
        <button
          id="menuButton"
          onClick={onOpenSettings}
          title="Customize & Settings"
          className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 group"
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
          <span className="sr-only">Settings</span>
        </button>
      </div>
    </header>
  );
};
