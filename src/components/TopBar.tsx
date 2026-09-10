import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Bookmark,
  Grid,
  Settings,
  Folder,
  FolderOpen,
  Plus,
  ChevronDown,
  ExternalLink,
  Trash2,
  X,
} from 'lucide-react';
import { AppSettings, BookmarkItem } from '../types';

interface TopBarProps {
  settings: AppSettings;
  unreadTodosCount: number;
  bookmarkFolders: string[];
  folderCounts: Record<string, number>;
  bookmarks: BookmarkItem[];
  onOpenTodoList: () => void;
  onOpenBookmarks: () => void;
  onSelectBookmarkFolder: (folder: string) => void;
  onOpenAddFolder: () => void;
  onAddBookmark?: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  onDeleteBookmark?: (id: string) => void;
  onDeleteFolder?: (folderName: string) => void;
  onOpenGoogleApps: () => void;
  onOpenSettings: () => void;
  onOpenExtensionModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  unreadTodosCount,
  bookmarkFolders,
  folderCounts,
  bookmarks,
  onOpenTodoList,
  onOpenBookmarks,
  onSelectBookmarkFolder,
  onOpenAddFolder,
  onAddBookmark,
  onDeleteBookmark,
  onDeleteFolder,
  onOpenGoogleApps,
  onOpenSettings,
}) => {
  const [activeFolderDropdown, setActiveFolderDropdown] = useState<string | null>(null);
  const [quickAddForFolder, setQuickAddForFolder] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveFolderDropdown(null);
        setQuickAddForFolder(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveFolderDropdown(null);
        setQuickAddForFolder(null);
      }
    };

    if (activeFolderDropdown) {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFolderDropdown]);

  const handleQuickAdd = (e: React.FormEvent, folder: string) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickUrl.trim() || !onAddBookmark) return;

    let finalUrl = quickUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    onAddBookmark({
      title: quickTitle.trim(),
      url: finalUrl,
      category: folder,
    });

    setQuickTitle('');
    setQuickUrl('');
    setQuickAddForFolder(null);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
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

      {/* Right controls: Bookmark Folders and Settings */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Available Bookmark Folders displayed to the left of Settings without any scrollbar */}
        {settings.showBookmarks && (
          <div
            id="topbar-bookmark-folders"
            className="flex items-center gap-1.5 overflow-x-auto max-w-[220px] sm:max-w-xs md:max-w-md lg:max-w-lg no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1"
          >
            {bookmarkFolders.map((folder) => {
              const count = folderCounts[folder] || 0;
              const isDropdownOpen = activeFolderDropdown === folder;
              const folderBookmarks = bookmarks.filter(
                (b) => (b.category || 'General').toLowerCase() === folder.toLowerCase()
              );

              return (
                <div key={folder} className="relative shrink-0">
                  <button
                    id={`bookmark-folder-${folder.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() =>
                      setActiveFolderDropdown((prev) => (prev === folder ? null : folder))
                    }
                    title={`Bookmark Folder: ${folder} (${count} item${count === 1 ? '' : 's'}) - Click to view bookmarks`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-xs shrink-0 cursor-pointer active:scale-95 group ${
                      isDropdownOpen
                        ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-md'
                        : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-outline)]/40 hover:border-transparent'
                    }`}
                  >
                    {isDropdownOpen ? (
                      <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0 transition-transform group-hover:scale-110" />
                    )}
                    <span className="truncate max-w-[90px]">{folder}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isDropdownOpen
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--md-sys-color-primary)]/15 text-[var(--md-sys-color-primary)]'
                      }`}
                    >
                      {count}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 opacity-100' : ''
                      }`}
                    />
                  </button>

                  {/* Hierarchical Dropdown displayed directly below that particular folder */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      id={`dropdown-folder-${folder.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 z-50 w-72 sm:w-80 bg-[var(--md-sys-color-surface-container)] rounded-2xl shadow-2xl border border-[var(--md-sys-color-outline)] p-3.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                    >
                      {/* Folder Root in Hierarchy */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--md-sys-color-outline)]/40">
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderOpen className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                          <span className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">
                            {folder}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shrink-0">
                            {folderBookmarks.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setActiveFolderDropdown(null);
                              onSelectBookmarkFolder(folder);
                            }}
                            title="Open in Bookmark Manager"
                            className="p-1 rounded-lg hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveFolderDropdown(null)}
                            title="Close"
                            className="p-1 rounded-lg hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bookmarks displayed directly below this folder in hierarchy */}
                      <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {folderBookmarks.length === 0 ? (
                          <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            <Bookmark className="w-6 h-6 mx-auto mb-1.5 opacity-30 text-[var(--md-sys-color-primary)]" />
                            <p>No bookmarks in this folder yet</p>
                          </div>
                        ) : (
                          <div className="relative pl-3 border-l-2 border-[var(--md-sys-color-primary)]/30 ml-2.5 my-1 space-y-1">
                            {folderBookmarks.map((bm) => {
                              const domain = getDomain(bm.url);
                              return (
                                <div
                                  key={bm.id}
                                  className="group relative flex items-center justify-between p-1.5 rounded-xl hover:bg-[var(--md-sys-color-hover-tint)] transition-all"
                                >
                                  {/* Branch connector line */}
                                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-[var(--md-sys-color-primary)]/30" />

                                  <a
                                    href={bm.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 flex-1 min-w-0"
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
                                    <div className="truncate flex-1">
                                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate group-hover:text-[var(--md-sys-color-primary)]">
                                        {bm.title}
                                      </div>
                                      <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                                        {domain}
                                      </div>
                                    </div>
                                  </a>

                                  {onDeleteBookmark && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteBookmark(bm.id);
                                      }}
                                      title="Delete bookmark"
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-500 hover:bg-red-500/15 transition-opacity cursor-pointer shrink-0 ml-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Quick Add or Manage below folder */}
                      <div className="pt-2 mt-2 border-t border-[var(--md-sys-color-outline)]/40 text-xs">
                        {quickAddForFolder === folder ? (
                          <form
                            onSubmit={(e) => handleQuickAdd(e, folder)}
                            className="space-y-2 animate-in fade-in duration-150"
                          >
                            <input
                              type="text"
                              autoFocus
                              placeholder="Bookmark title..."
                              value={quickTitle}
                              onChange={(e) => setQuickTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none focus:ring-1 focus:ring-[var(--md-sys-color-primary)]"
                            />
                            <input
                              type="text"
                              placeholder="URL (e.g. github.com)..."
                              value={quickUrl}
                              onChange={(e) => setQuickUrl(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none focus:ring-1 focus:ring-[var(--md-sys-color-primary)]"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickAddForFolder(null);
                                  setQuickTitle('');
                                  setQuickUrl('');
                                }}
                                className="px-2 py-1 rounded-md text-[11px] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer hover:shadow-xs"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setQuickAddForFolder(folder)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add to this folder</span>
                            </button>
                            {onDeleteFolder && (
                              <button
                                onClick={() => {
                                  onDeleteFolder(folder);
                                  setActiveFolderDropdown(null);
                                }}
                                title="Delete folder"
                                className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              id="topbar-add-folder-btn"
              onClick={onOpenAddFolder}
              title="Add Bookmark Folder"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-[var(--md-sys-color-outline)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="sr-only">Add Bookmark Folder</span>
            </button>
          </div>
        )}

        <button
          id="menuButton"
          onClick={onOpenSettings}
          title="Customize & Settings"
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 group"
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
          <span className="sr-only">Settings</span>
        </button>
      </div>
    </header>
  );
};
