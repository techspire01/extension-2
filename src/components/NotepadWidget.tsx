import React, { useEffect, useState } from "react";
import { Minimize2, StickyNote } from "lucide-react";
import { AppSettings } from "../types";

const STORAGE_KEY = "mynt_notepad";

type ChromeStorageArea = {
  get: (
    key: string,
    callback: (result: Record<string, unknown>) => void,
  ) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
};

const getChromeStorage = (): ChromeStorageArea | null => {
  const chromeApi = (
    globalThis as typeof globalThis & {
      chrome?: { storage?: { local?: ChromeStorageArea } };
    }
  ).chrome;
  return chromeApi?.storage?.local ?? null;
};

async function loadNote(): Promise<string> {
  const storage = getChromeStorage();
  if (storage) {
    return new Promise((resolve) => {
      storage.get(STORAGE_KEY, (result) =>
        resolve(String(result[STORAGE_KEY] ?? "")),
      );
    });
  }
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

async function saveNote(note: string): Promise<void> {
  const storage = getChromeStorage();
  if (storage) {
    await new Promise<void>((resolve) =>
      storage.set({ [STORAGE_KEY]: note }, resolve),
    );
    return;
  }
  localStorage.setItem(STORAGE_KEY, note);
}

interface NotepadWidgetProps {
  settings: AppSettings;
}

export const NotepadWidget: React.FC<NotepadWidgetProps> = ({ settings }) => {
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let current = true;
    loadNote().then((saved) => {
      if (current) {
        setNote(saved);
        setLoaded(true);
      }
    });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timeoutId = window.setTimeout(() => void saveNote(note), 250);
    return () => window.clearTimeout(timeoutId);
  }, [note, loaded]);

  if (!(settings.showNotepad ?? true)) return null;

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="fixed right-4 bottom-4 z-20 w-12 h-12 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline)] shadow-lg flex items-center justify-center hover:shadow-xl transition-all cursor-pointer"
        title="Open notepad"
        aria-label="Open notepad"
      >
        <StickyNote className="w-5 h-5" />
      </button>
    );
  }

  return (
    <section
      aria-label="Notepad"
      className="fixed right-4 bottom-4 z-20 w-[min(260px,calc(100vw-32px))] aspect-square bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)] shadow-xl flex flex-col"
    >
      <header className="h-11 px-3 flex items-center justify-between border-b border-[var(--md-sys-color-outline)] shrink-0">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
          <h2 className="text-xs font-bold">Notepad</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)]">
            Autosaved
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded-md hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
            title="Minimize notepad"
            aria-label="Minimize notepad"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="flex-1 min-h-0 w-full resize-none border-0 bg-transparent p-3 text-sm leading-5 text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)]"
        placeholder="Write a quick note..."
        aria-label="Notepad text"
      />
    </section>
  );
};
