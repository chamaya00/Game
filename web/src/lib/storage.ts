import type { SaveData } from "../types";

const STORAGE_KEY = "matched.save.v1";

function emptySave(): SaveData {
  return {
    orientation: null,
    completedEndings: {},
    playedGender: {},
    epilogueSeen: false,
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
    // localStorage can be unavailable (privacy mode, sandboxed iframe, storage
    // partitioning). Progress just won't persist across reloads in that case.
  }
}

export function resetSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // see writeSave
  }
}
