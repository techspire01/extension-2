import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckSquare,
  Bookmark,
  Grid,
  Settings,
  Folder,
  FolderOpen,
  ChevronDown,
} from 'lucide-react';
import { AppSettings, BookmarkItem } from '../types';

interface TopBarProps {
  settings: AppSettings;
  unreadTodosCount: number;
  bookmarkFolders: string[];
  folderCounts: Record<string, number>;
  bookmarks: BookmarkItem[];
  onOpenTodoList: () => void;
  onOpenBookmarks?: () => void;
  onSelectBookmarkFolder: (folder: string) => void;
  onOpenAddFolder?: () => void;
  onAddBookmark?: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  onDeleteBookmark?: (id: string) => void;
  onDeleteFolder?: (folderName: string) => void;
  onOpenGoogleApps: () => void;
  onOpenSettings: () => void;
  onOpenExtensionModal?: () => void;
  isAnyDrawerOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  unreadTodosCount,
  bookmarkFolders,
  folderCounts,
  bookmarks,
  onOpenTodoList,
  onOpenBookmarks: _onOpenBookmarks,
  onSelectBookmarkFolder,
  onOpenAddFolder: _onOpenAddFolder,
  onAddBookmark,
  onDeleteBookmark,
  onDeleteFolder,
  onOpenGoogleApps,
  onOpenSettings,
  isAnyDrawerOpen = false,
}) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [dropdownCoords, setDropdownCoords] = useState<
    Record<string, { top: number; left?: number; right?: number }>
  >({});

  // Clear stale persisted open folders from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('zen_topbar_open_folders');
    } catch {}
  }, []);

  // Close folder dropdown immediately if any drawer/modal is opened
  useEffect(() => {
    if (isAnyDrawerOpen) {
      setActiveFolder(null);
    }
  }, [isAnyDrawerOpen]);

  // Handle outside click & escape key to close open folder dropdown
  useEffect(() => {
    if (!activeFolder) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const btn = buttonRefs.current[activeFolder];
      if (btn && btn.contains(target)) return;

      const dropdown = document.getElementById('dropdown-folder-design');
      if (dropdown && dropdown.contains(target)) return;

      setActiveFolder(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveFolder(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFolder]);

  const toggleFolderHierarchy = (folder: string) => {
    setActiveFolder((prev) => (prev === folder ? null : folder));
  };

  const updateCoords = useCallback(() => {
    if (!activeFolder) {
      setDropdownCoords({});
      return;
    }

    const btn = buttonRefs.current[activeFolder];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const dropdownWidth = 130;
      const isNearRight = rect.left + dropdownWidth > window.innerWidth - 16;

      setDropdownCoords({
        [activeFolder]: isNearRight
          ? {
              top: rect.bottom + 6,
              right: Math.max(12, window.innerWidth - rect.right),
            }
          : {
              top: rect.bottom + 6,
              left: Math.max(12, rect.left),
            },
      });
    }
  }, [activeFolder]);

  useLayoutEffect(() => {
    updateCoords();
  }, [updateCoords]);

  useEffect(() => {
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [updateCoords]);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const handleOpenTodoList = () => {
    setActiveFolder(null);
    onOpenTodoList();
  };

  const handleOpenGoogleApps = () => {
    setActiveFolder(null);
    onOpenGoogleApps();
  };

  const handleOpenSettings = () => {
    setActiveFolder(null);
    onOpenSettings();
  };

  return (
    <header
      id="top-bar"
      className="w-full flex items-center justify-between px-6 py-4 z-20 pointer-events-auto"
    >
      {/* Left controls: ToDo, Bookmarks, Google Apps */}
      <div className="flex items-center gap-2.5 shrink-0">
        {settings.showTodoList && (
          <button
            id="todoListCont"
            onClick={handleOpenTodoList}
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

        {settings.showGoogleApps && (
          <button
            id="googleAppsCont"
            onClick={handleOpenGoogleApps}
            title="Google Apps"
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <Grid className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="sr-only">Google Apps</span>
          </button>
        )}
      </div>

      {/* Right controls: Bookmark Folders and Settings */}
      <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
        {/* Available Bookmark Folders displayed to the left of Settings without any scrollbar */}
        {settings.showBookmarks && (
          <div
            id="topbar-bookmark-folders"
            className="flex items-center gap-2 overflow-x-auto max-w-[calc(100vw-220px)] sm:max-w-[calc(100vw-280px)] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-1"
          >
            {bookmarkFolders.map((folder) => {
              const count = folderCounts[folder] || 0;
              const isFolderOpen = activeFolder === folder;
              const folderBookmarks = bookmarks.filter(
                (b) => (b.category || 'General').toLowerCase() === folder.toLowerCase()
              );
              const coords = dropdownCoords[folder];

              return (
                <div key={folder} className="shrink-0">
                  <button
                    ref={(el) => {
                      buttonRefs.current[folder] = el;
                    }}
                    id={`bookmark-folder-${folder.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => toggleFolderHierarchy(folder)}
                    title={`Bookmark Folder: ${folder} (${count} item${count === 1 ? '' : 's'}) - ${
                      isFolderOpen ? 'Click to close hierarchy' : 'Click to open hierarchy'
                    }`}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-xs shrink-0 cursor-pointer active:scale-95 group ${
                      isFolderOpen
                        ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-md ring-2 ring-[var(--md-sys-color-primary)]/30'
                        : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-outline)]/40 hover:border-transparent'
                    }`}
                  >
                    {isFolderOpen ? (
                      <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0 transition-transform group-hover:scale-110" />
                    )}
                    <span className="whitespace-nowrap font-medium">{folder}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isFolderOpen
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--md-sys-color-primary)]/15 text-[var(--md-sys-color-primary)]'
                      }`}
                    >
                      {count}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
                        isFolderOpen ? 'rotate-180 opacity-100' : ''
                      }`}
                    />
                  </button>

                  {/* Bookmarks dropdown rendered directly below this folder without background */}
                  {!isAnyDrawerOpen &&
                    isFolderOpen &&
                    coords &&
                    createPortal(
                      <div
                        id="dropdown-folder-design"
                        style={{
                          position: 'fixed',
                          top: `${coords.top}px`,
                          ...(coords.right !== undefined
                            ? { right: `${coords.right}px` }
                            : { left: `${coords.left}px` }),
                          zIndex: 40,
                          maxHeight: 'calc(100vh - 120px)',
                          width: '220px',
                        }}
                        className="glass-surface-high w-[220px] rounded-xl shadow-xl border border-[var(--md-sys-color-outline)]/60 p-2 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar"
                      >
                        {folderBookmarks.length === 0 ? (
                          <span className="py-1 px-1.5 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            No bookmarks
                          </span>
                        ) : (
                          folderBookmarks.map((bm) => {
                            const domain = getDomain(bm.url);
                            return (
                              <a
                                key={bm.id}
                                href={bm.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveFolder(null)}
                                className="group flex items-center gap-2 py-2 px-2.5 rounded-lg bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-surface)] shadow-xs transition-colors cursor-pointer min-w-0"
                              >
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                  alt=""
                                  className="w-4 h-4 rounded-xs shrink-0 object-contain"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <span className="text-xs font-medium truncate drop-shadow-xs group-hover:text-[var(--md-sys-color-primary)] transition-colors">
                                  {bm.title}
                                </span>
                              </a>
                            );
                          })
                        )}
                      </div>,
                      document.body
                    )}
                </div>
              );
            })}
          </div>
        )}

        <div className="shrink-0 pl-1">
          <button
            id="menuButton"
            onClick={handleOpenSettings}
            title="Customize & Settings"
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
            <span className="sr-only">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
