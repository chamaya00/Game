import { getCharacters } from "../data/content";
import type { SaveData } from "../types";

export type ChapterState = "locked" | "round1_available" | "round1_done" | "round2_available" | "round2_done";

/**
 * The game unlocks its 5 chapters strictly in order (Hạo -> Diệp -> Uyên ->
 * Khang -> Nhiên) for each round — the escalating horror in section 9 and
 * the input-mode escalation in section 9.2 both depend on "which chapter
 * number" the player has reached, not free choice.
 */
export function getChapterState(save: SaveData, characterId: string): ChapterState {
  const chars = getCharacters();
  const idx = chars.findIndex((c) => c.id === characterId);
  const done = chars.map((c) => save.progress[c.id]);

  const allRound1Done = done.every((d) => d === "round1_done" || d === "round2_done");

  if (done[idx] === "round2_done") return "round2_done";
  const prevAllRound2Done = done.slice(0, idx).every((d) => d === "round2_done");
  if (done[idx] === "round1_done") {
    return allRound1Done && save.theEndSeen && prevAllRound2Done ? "round2_available" : "round1_done";
  }
  // not started round1 yet for this character
  const prevAllStarted = done.slice(0, idx).every((d) => d === "round1_done" || d === "round2_done");
  if (!allRound1Done) {
    return prevAllStarted ? "round1_available" : "locked";
  }
  // all 5 finished round1 — we're in the round2 phase; unlock round2 sequentially too
  return prevAllRound2Done && save.theEndSeen ? "round2_available" : "locked";
}

export function round1CompletedCount(save: SaveData): number {
  return getCharacters().filter((c) => save.progress[c.id] === "round1_done" || save.progress[c.id] === "round2_done").length;
}

export function round2CompletedCount(save: SaveData): number {
  return getCharacters().filter((c) => save.progress[c.id] === "round2_done").length;
}

export function allRound2Done(save: SaveData): boolean {
  return round2CompletedCount(save) >= getCharacters().length;
}
