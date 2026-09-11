import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Globe, X } from 'lucide-react';
import { AppSettings, ShortcutItem } from '../types';

interface ShortcutsGridProps {
  settings: AppSettings;
  shortcuts: ShortcutItem[];
  onAddShortcut: (shortcut: Omit<ShortcutItem, 'id'>) => void;
  onUpdateShortcut: (id: string, updated: Partial<ShortcutItem>) => void;
  onDeleteShortcut: (id: string) => void;
  onReorderShortcuts: (reordered: ShortcutItem[]) => void;
  onUpdateSettings?: (updated: Partial<AppSettings>) => void;
}

export const ShortcutsGrid: React.FC<ShortcutsGridProps> = ({
  settings,
  shortcuts,
  onAddShortcut,
  onUpdateShortcut,
  onDeleteShortcut,
  onUpdateSettings,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<ShortcutItem | null>(null);

  const isOnlyIcons = settings.shortcutsOnlyIcons ?? true;

  // Form states for Add / Edit
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [colorInput, setColorInput] = useState('#4382ec');

  if (!settings.showShortcuts) {
    return null;
  }

  const openAddModal = () => {
    setTitleInput('');
    setUrlInput('');
    setColorInput(settings.customHexColor || '#4382ec');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: ShortcutItem) => {
    setEditingItem(item);
    setTitleInput(item.title);
    setUrlInput(item.url);
    setColorInput(item.customColor || '#4382ec');
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !urlInput.trim()) return;

    let finalUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    let domain = '';
    try {
      domain = new URL(finalUrl).hostname;
    } catch {
      domain = finalUrl;
    }

    onAddShortcut({
      title: titleInput.trim(),
      url: finalUrl,
      domain,
      customColor: colorInput,
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !titleInput.trim() || !urlInput.trim()) return;

    let finalUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    let domain = '';
    try {
      domain = new URL(finalUrl).hostname;
    } catch {
      domain = finalUrl;
    }

    onUpdateShortcut(editingItem.id, {
      title: titleInput.trim(),
      url: finalUrl,
      domain,
      customColor: colorInput,
    });

    setEditingItem(null);
  };

  const getFaviconUrl = (item: ShortcutItem) => {
    const domain = item.domain || (item.url ? new URL(item.url).hostname : '');
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  return (
    <section id="shortcuts-section" className="w-full max-w-3xl mx-auto px-4 mt-6 z-10">
      {/* Header with edit toggle & icon-only toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-2">
        <div className="flex items-center gap-2">
          <span
            id="shortcutsText"
            className="text-xs font-bold uppercase tracking-wider whitespace-nowrap text-[var(--md-sys-color-on-surface-variant)]"
          >
            Quick Access Dashboard
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] font-medium">
            {shortcuts.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onUpdateSettings && (
            <button
              onClick={() =>
                onUpdateSettings({ shortcutsOnlyIcons: !isOnlyIcons })
              }
              title={isOnlyIcons ? 'Show text labels' : 'Keep only icons'}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              {isOnlyIcons ? 'Show Labels' : 'Only Icons'}
            </button>
          )}

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isEditMode
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)]'
            }`}
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditMode ? 'Done Editing' : 'Customize'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Shortcuts */}
      <div
        id="shortcutsContainer"
        className="shortcuts-grid grid gap-2 select-none items-center justify-center justify-items-center"
        style={{ '--shortcut-columns': Math.max(3, Math.min(8, settings.shortcutsPerRow)) } as React.CSSProperties}
      >
        {shortcuts.map((item) => {
          return (
            <div
              key={item.id}
              className={`relative group flex flex-col items-center justify-center transition-all duration-200 ${
                isOnlyIcons
                  ? 'p-1'
                  : 'p-2 rounded-2xl hover:bg-[var(--md-sys-color-surface-container)]/50'
              }`}
            >
              {/* Edit or Delete Action Badges in Edit Mode */}
              {isEditMode && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 z-20">
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit shortcut"
                    className="p-1 rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 cursor-pointer"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onDeleteShortcut(item.id)}
                    title="Delete shortcut"
                    className="p-1 rounded-full bg-red-500 text-white shadow hover:bg-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Main Shortcut Anchor */}
              <a
                href={item.url}
                target="_self"
                rel="noopener noreferrer"
                title={item.title}
                onClick={(e) => {
                  if (isEditMode) {
                    e.preventDefault();
                    openEditModal(item);
                  }
                }}
                className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                  isOnlyIcons ? 'group-hover:scale-110' : ''
                }`}
              >
                {/* Icon Container: Clean icon alone with subtle hover background */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-200 overflow-hidden ${
                    !isOnlyIcons ? 'mb-1.5' : ''
                  } ${
                    settings.adaptiveIcons
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/20 shadow-sm'
                      : 'bg-[var(--md-sys-color-surface-container)]/60 hover:bg-[var(--md-sys-color-surface-container-high)]/80'
                  }`}
                  style={
                    !settings.adaptiveIcons && item.customColor
                      ? {
                          backgroundColor: `${item.customColor}20`,
                          borderColor: `${item.customColor}40`,
                        }
                      : undefined
                  }
                >
                  <img
                    src={getFaviconUrl(item)}
                    alt={item.title}
                    className="w-7 h-7 sm:w-[31px] sm:h-[31px] object-contain drop-shadow-sm transition-transform duration-200"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  {/* Fallback Letter if image doesn't load */}
                  <span
                    style={{ display: 'none' }}
                    className="w-7 h-7 sm:w-[31px] sm:h-[31px] rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-sm uppercase flex items-center justify-center shadow-xs"
                  >
                    {item.title.charAt(0)}
                  </span>
                </div>

                {/* Title (hidden if isOnlyIcons) */}
                {!isOnlyIcons && (
                  <span className="text-xs sm:text-sm font-medium text-[var(--md-sys-color-on-surface)] text-center truncate w-full px-1 max-w-[80px]">
                    {item.title}
                  </span>
                )}
              </a>
            </div>
          );
        })}

        {/* Add Shortcut Tile */}
        <div className={`relative group flex flex-col items-center justify-center ${isOnlyIcons ? 'p-1' : 'p-2'}`}>
          <button
            onClick={openAddModal}
            title="Add new shortcut"
            className="flex flex-col items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95 cursor-pointer"
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border-2 border-dashed border-[var(--md-sys-color-outline)]/70 hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]/60 flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-all duration-200 ${
                !isOnlyIcons ? 'mb-1.5' : ''
              }`}
            >
              <Plus className="w-6 h-6" />
            </div>
            {!isOnlyIcons && (
              <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] max-w-[80px] truncate">
                Add
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] rounded-3xl p-6 shadow-2xl border border-[var(--md-sys-color-outline)] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">
                Add New Shortcut
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                  Shortcut Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. GitHub, Twitch, Figma"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                  URL Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://figma.com or github.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow hover:shadow-md transition-all cursor-pointer"
                >
                  Add Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shortcut Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] rounded-3xl p-6 shadow-2xl border border-[var(--md-sys-color-outline)] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">
                Edit Shortcut
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">
                  Shortcut Name
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteShortcut(editingItem.id);
                    setEditingItem(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow hover:shadow-md transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
