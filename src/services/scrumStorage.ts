import { ScrumBoardData } from "../types";

const STORAGE_KEY = "mynt_scrum_board";

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
      chrome?: {
        storage?: { local?: ChromeStorageArea };
        runtime?: { lastError?: unknown };
      };
    }
  ).chrome;
  return chromeApi?.storage?.local ?? null;
};

export async function loadScrumData(): Promise<ScrumBoardData | null> {
  const storage = getChromeStorage();
  if (storage) {
    return new Promise((resolve) => {
      storage.get(STORAGE_KEY, (result) =>
        resolve((result[STORAGE_KEY] as ScrumBoardData) ?? null),
      );
    });
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export async function saveScrumData(data: ScrumBoardData): Promise<void> {
  const storage = getChromeStorage();
  if (storage) {
    await new Promise<void>((resolve) =>
      storage.set({ [STORAGE_KEY]: data }, resolve),
    );
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function validateScrumImport(value: unknown): ScrumBoardData {
  if (!value || typeof value !== "object")
    throw new Error("Backup must contain an object.");
  const data = value as Partial<ScrumBoardData>;
  if (
    data.version !== 1 ||
    !Array.isArray(data.tasks) ||
    !Array.isArray(data.sprints)
  ) {
    throw new Error("This is not a valid Scrum Board backup.");
  }
  if (!data.settings || typeof data.nextTaskNumber !== "number") {
    throw new Error("The backup is missing board settings.");
  }
  return data as ScrumBoardData;
}

export function exportScrumData(data: ScrumBoardData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `scrum-board-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
