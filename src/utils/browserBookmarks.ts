import { BookmarkItem } from '../types';

export interface ExtractedBookmarks {
  folders: string[];
  bookmarks: BookmarkItem[];
}

/**
 * Traverses Chrome / browser bookmark tree and extracts all folder names
 * and their nested bookmark items.
 */
export function parseChromeBookmarksTree(tree: any[]): ExtractedBookmarks {
  const foldersSet = new Set<string>();
  const bookmarksList: BookmarkItem[] = [];

  function traverse(node: any, currentFolder?: string) {
    if (!node) return;

    // Node with children is a folder
    if (node.children && Array.isArray(node.children)) {
      // In Chrome bookmarks: root (id: "0") has children like:
      // - "Bookmarks bar" (or "Bookmarks Bar")
      // - "Other bookmarks"
      // - "Mobile bookmarks"
      let nextFolder = currentFolder;
      if (node.title && node.id !== '0') {
        const cleanedTitle = node.title.trim();
        // If this is not the root "0", consider it a folder
        if (cleanedTitle) {
          nextFolder = cleanedTitle;
          foldersSet.add(cleanedTitle);
        }
      }

      for (const child of node.children) {
        traverse(child, nextFolder);
      }
    } else if (node.url) {
      // It's a bookmark leaf
      const category = currentFolder || 'General';
      if (category) {
        foldersSet.add(category);
      }
      bookmarksList.push({
        id: `chrome-bm-${node.id || Math.random().toString(36).substring(2, 9)}`,
        title: node.title || node.url,
        url: node.url,
        category,
        createdAt: node.dateAdded || Date.now(),
      });
    }
  }

  for (const root of tree) {
    traverse(root);
  }

  return {
    folders: Array.from(foldersSet),
    bookmarks: bookmarksList,
  };
}
