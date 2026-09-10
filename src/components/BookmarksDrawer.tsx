import React, { useState } from 'react';
import {
  X,
  Plus,
  Search,
  Bookmark as BookmarkIcon,
  LayoutGrid,
  List,
  FolderTree,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
  Tag,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { BookmarkItem } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  folders: string[];
  selectedFolderFilter: string | null;
  onSelectFolderFilter: (folder: string | null) => void;
  onAddFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onAddBookmark: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  onUpdateBookmark: (id: string, updated: Partial<BookmarkItem>) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  folders,
  selectedFolderFilter,
  onSelectFolderFilter,
  onAddFolder,
  onDeleteFolder,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'alpha' | 'time'>('alpha');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'list' | 'grid'>('hierarchy');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);

  // Folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Form states
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setTitleInput('');
    setUrlInput('');
    setCategoryInput(selectedFolderFilter || (folders[0] || 'General'));
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: BookmarkItem) => {
    setEditingBookmark(item);
    setTitleInput(item.title);
    setUrlInput(item.url);
    setCategoryInput(item.category || 'General');
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim());
    onSelectFolderFilter(newFolderName.trim());
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !urlInput.trim()) return;

    let finalUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const cat = categoryInput.trim() || 'General';
    onAddFolder(cat);

    onAddBookmark({
      title: titleInput.trim(),
      url: finalUrl,
      category: cat,
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookmark || !titleInput.trim() || !urlInput.trim()) return;

    let finalUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const cat = categoryInput.trim() || 'General';
    onAddFolder(cat);

    onUpdateBookmark(editingBookmark.id, {
      title: titleInput.trim(),
      url: finalUrl,
      category: cat,
    });

    setEditingBookmark(null);
  };

  // Filter & Sort
  const filtered = bookmarks.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedFolderFilter) {
      return (b.category || 'General').toLowerCase() === selectedFolderFilter.toLowerCase();
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return b.createdAt - a.createdAt;
  });

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  const toggleFolderCollapse = (folderName: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleOpenAddForFolder = (folderName: string) => {
    setTitleInput('');
    setUrlInput('');
    setCategoryInput(folderName);
    setIsAddOpen(true);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="bookmarkSidebar"
        className="w-full max-w-md h-full bg-[var(--md-sys-color-surface-container-high)] border-r border-[var(--md-sys-color-outline)] shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-250"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)]">
              <BookmarkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--md-sys-color-on-surface)]">
                Bookmarks
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {bookmarks.length} saved resources
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenAdd}
              title="Add Bookmark"
              className="p-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow hover:shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] placeholder-[var(--md-sys-color-on-surface-variant)]/60"
          />
          {searchQuery && (
            <button
              id="clearSearchButton"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
            >
              ✖
            </button>
          )}
        </div>

        {/* Bookmark Folders Management & Filtering */}
        <div className="mt-3.5 pt-1">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Folders
            </span>
            {!isCreatingFolder && (
              <button
                id="drawer-create-folder-btn"
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Folder</span>
              </button>
            )}
          </div>

          {/* Inline Folder Creation */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className="flex items-center gap-1.5 mb-2.5 animate-in fade-in duration-150">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Work, Tools)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold cursor-pointer hover:shadow-xs active:scale-95"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Folder Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => onSelectFolderFilter(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedFolderFilter === null
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                  : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-75 font-normal">({bookmarks.length})</span>
            </button>

            {folders.map((f) => {
              const count = bookmarks.filter(
                (b) => (b.category || 'General').toLowerCase() === f.toLowerCase()
              ).length;
              const isSelected = selectedFolderFilter?.toLowerCase() === f.toLowerCase();

              return (
                <div
                  key={f}
                  className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
                  }`}
                >
                  <button
                    onClick={() => onSelectFolderFilter(f)}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Folder className="w-3 h-3 shrink-0" />
                    <span>{f}</span>
                    <span className="text-[10px] opacity-75 font-normal">({count})</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(f);
                    }}
                    title={`Delete folder "${f}"`}
                    className="p-1 rounded-full hover:bg-red-500/20 hover:text-red-600 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="sr-only">Delete folder {f}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sorting and View Controls */}
        <div className="flex items-center justify-between mt-3 select-none text-xs">
          <div className="flex items-center gap-1">
            <button
              id="sortAlphabetical"
              onClick={() => setSortOrder('alpha')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                sortOrder === 'alpha'
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
            >
              A-Z
            </button>
            <button
              id="sortTimeAdded"
              onClick={() => setSortOrder('time')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                sortOrder === 'time'
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
            >
              Recent
            </button>
          </div>

          <div className="flex items-center gap-1 border border-[var(--md-sys-color-outline)]/40 p-0.5 rounded-xl">
            <button
              id="bookmarkViewHierarchy"
              onClick={() => setViewMode('hierarchy')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'hierarchy'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
              title="Hierarchy Tree View"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hierarchy</span>
            </button>
            <button
              id="bookmarkViewList"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              id="bookmarkViewGrid"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 custom-scrollbar">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <BookmarkIcon className="w-10 h-10 text-[var(--md-sys-color-primary)]/40 mb-2" />
              <p>No bookmarks found {selectedFolderFilter ? `in "${selectedFolderFilter}"` : ''}</p>
            </div>
          ) : viewMode === 'hierarchy' ? (
            /* Hierarchy View: Bookmarks in the particular folder are displayed directly below that folder */
            <div className="space-y-3">
              {(selectedFolderFilter ? [selectedFolderFilter] : folders).map((folderName) => {
                const folderBookmarks = sorted.filter(
                  (b) => (b.category || 'General').toLowerCase() === folderName.toLowerCase()
                );
                const isCollapsed = !!collapsedFolders[folderName];

                if (
                  searchQuery.trim() &&
                  folderBookmarks.length === 0 &&
                  !folderName.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                  return null;
                }

                return (
                  <div
                    key={folderName}
                    className="rounded-2xl border border-[var(--md-sys-color-outline)]/40 bg-[var(--md-sys-color-surface)]/60 overflow-hidden transition-all shadow-2xs"
                  >
                    {/* Folder Node Header */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-hover-tint)] transition-colors">
                      <button
                        onClick={() => toggleFolderCollapse(folderName)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer select-none"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0 transition-transform" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0 transition-transform" />
                        )}
                        {isCollapsed ? (
                          <Folder className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                        ) : (
                          <FolderOpen className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                        )}
                        <span className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">
                          {folderName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shrink-0">
                          {folderBookmarks.length}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => handleOpenAddForFolder(folderName)}
                          title={`Add bookmark to "${folderName}"`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)]/50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="hidden sm:inline">Add</span>
                        </button>

                        <button
                          onClick={() => onDeleteFolder(folderName)}
                          title={`Delete folder "${folderName}"`}
                          className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-red-600 hover:bg-red-500/15 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bookmarks displayed directly below this folder in hierarchy method */}
                    {!isCollapsed && (
                      <div className="px-3.5 py-2">
                        {folderBookmarks.length === 0 ? (
                          <div className="py-2.5 pl-5 text-xs text-[var(--md-sys-color-on-surface-variant)] italic flex items-center justify-between">
                            <span>No bookmarks in this folder yet.</span>
                            <button
                              onClick={() => handleOpenAddForFolder(folderName)}
                              className="text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                            >
                              + Add one
                            </button>
                          </div>
                        ) : (
                          <div className="relative pl-4 border-l-2 border-[var(--md-sys-color-primary)]/30 ml-2.5 my-1 space-y-1.5">
                            {folderBookmarks.map((item) => {
                              const domain = getDomain(item.url);
                              return (
                                <div
                                  key={item.id}
                                  className="group relative flex items-center justify-between p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)]/40 hover:border-[var(--md-sys-color-primary)]/60 hover:shadow-xs transition-all"
                                >
                                  {/* Hierarchy branch line connector */}
                                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3.5 h-0.5 bg-[var(--md-sys-color-primary)]/30" />

                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 flex-1 min-w-0"
                                  >
                                    <img
                                      src={getFavicon(item.url)}
                                      alt=""
                                      className="w-4 h-4 rounded-xs shrink-0 object-contain"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    <div className="truncate flex-1">
                                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate group-hover:text-[var(--md-sys-color-primary)]">
                                        {item.title}
                                      </div>
                                      <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                                        {domain}
                                      </div>
                                    </div>
                                  </a>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)]"
                                      title="Open in new tab"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <button
                                      onClick={() => handleOpenEdit(item)}
                                      className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteBookmark(item.id)}
                                      className="p-1 rounded-md text-red-500 hover:bg-red-500/15 cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-2.5">
              {sorted.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col p-3 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 hover:border-[var(--md-sys-color-primary)] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <img
                      src={getFavicon(item.url)}
                      alt=""
                      className="w-6 h-6 rounded-lg object-contain mb-2"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteBookmark(item.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate hover:text-[var(--md-sys-color-primary)]"
                  >
                    {item.title}
                  </a>

                  {item.category && (
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-1 flex items-center gap-1">
                      <Folder className="w-2.5 h-2.5" />
                      <span>{item.category}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)]/40 hover:border-[var(--md-sys-color-primary)]/40 hover:shadow-xs transition-all"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <img
                      src={getFavicon(item.url)}
                      alt=""
                      className="w-5 h-5 rounded-md object-contain shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate group-hover:text-[var(--md-sys-color-primary)]">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate flex items-center gap-2">
                        <span>{item.url}</span>
                        {item.category && (
                          <span className="px-1.5 py-0.2 rounded-md bg-[var(--md-sys-color-surface-container)] text-[10px] font-medium text-[var(--md-sys-color-primary)]">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 rounded text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(item.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(isAddOpen || editingBookmark) && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[var(--md-sys-color-surface-container-high)] rounded-3xl p-6 shadow-2xl border border-[var(--md-sys-color-outline)] animate-in zoom-in-95">
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] mb-4">
                {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
              </h3>

              <form
                onSubmit={editingBookmark ? handleSaveEdit : handleSaveAdd}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    required
                    placeholder="e.g. Design Inspiration"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                    URL Address
                  </label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                    placeholder="e.g. https://dribbble.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                    Folder
                  </label>
                  {/* Select from existing folders or enter a new one */}
                  <div className="space-y-1.5">
                    {folders.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {folders.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setCategoryInput(f)}
                            className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              categoryInput.toLowerCase() === f.toLowerCase()
                                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                                : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline)]/40'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="Enter or select folder name..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    id="cancelBookmarkEdit"
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setEditingBookmark(null);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="saveBookmarkChanges"
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
