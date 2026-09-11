import { DEFAULT_SCRUM_DATA } from "../data/scrumDefaults";
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
        resolve(
          normalizeScrumData((result[STORAGE_KEY] as ScrumBoardData) ?? null),
        ),
      );
    });
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeScrumData(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

function normalizeScrumData(
  data: ScrumBoardData | null,
): ScrumBoardData | null {
  if (!data) return null;
  const rawStatuses =
    Array.isArray(data.statuses) && data.statuses.length
      ? data.statuses
      : DEFAULT_SCRUM_DATA.statuses;
  return {
    ...data,
    statuses: rawStatuses.map((status, index) => {
      const legacy = status as typeof status & {
        label?: string;
        accent?: string;
      };
      return {
        id: status.id || `status-${index + 1}`,
        name: status.name || legacy.label || `Status ${index + 1}`,
        color: status.color || legacy.accent || "#579dff",
        isDone: Boolean(status.isDone || status.id === "done"),
      };
    }),
  };
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
  return normalizeScrumData(data as ScrumBoardData) as ScrumBoardData;
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
