import type { SaveData } from "../types";

const STORAGE_KEY = "meetgreet.save.v1";

function emptySave(): SaveData {
  return {
    lang: "vi",
    playerName: "",
    contentWarningSeen: false,
    theEndSeen: false,
    progress: {},
    phantomTapped: {},
    seenAt: {},
    soundOn: true,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...emptySave(), ...parsed };
  } catch {
    return emptySave();
  }
}

export function writeSave(save: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // localStorage can be unavailable (privacy mode, sandboxed iframe,
    // storage partitioning). Progress just won't persist across reloads.
  }
}

export function resetSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // see writeSave
  }
}
