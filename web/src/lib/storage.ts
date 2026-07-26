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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function resetSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}
