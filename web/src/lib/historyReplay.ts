import { renderText, sharedLine } from "../data/content";
import type { Beat, Lang } from "../types";

export interface ReplayMessage {
  id: number;
  speaker: "npc" | "system" | "player";
  text: string;
}

let counter = 0;

/**
 * Synchronously resolves a beat list into a static log — used to render
 * "history" that already happened: Round 1's thread shown above Round 2,
 * and a fully-finished character's read-only revisit view. Choices resolve
 * to their first (non-phantom) option, since flavor choices don't change
 * the story — except when `corrupt` is set, which reveals the suppressed
 * phantom line instead (GDD section 9.8's "Round 1 rewrites itself").
 */
export function resolveHistory(
  beats: Beat[],
  lang: Lang,
  vars: Record<string, string>,
  corrupt = false
): ReplayMessage[] {
  const out: ReplayMessage[] = [];
  let corruptedOnce = !corrupt;

  for (const beat of beats) {
    switch (beat.type) {
      case "npc":
        out.push({ id: ++counter, speaker: "npc", text: renderText(beat.text, lang, vars) });
        break;
      case "system":
        out.push({ id: ++counter, speaker: "system", text: renderText(beat.text, lang, vars) });
        break;
      case "time_skip":
        out.push({ id: ++counter, speaker: "system", text: `n:${beat.n}:${beat.unit}` });
        break;
      case "choice": {
        const phantomIdx = beat.options.findIndex((o) => o.isPhantom);
        let chosen = beat.options[0];
        if (!corruptedOnce && phantomIdx !== -1) {
          chosen = beat.options[phantomIdx];
          corruptedOnce = true;
        }
        out.push({ id: ++counter, speaker: "player", text: renderText(chosen.text, lang, vars) });
        break;
      }
      case "forced": {
        const text = beat.sharedKey ? sharedLine(beat.sharedKey, lang) : renderText(beat.text!, lang, vars);
        out.push({ id: ++counter, speaker: "player", text });
        break;
      }
      case "hesitate":
      case "no_reply":
        // silence — nothing was sent
        break;
    }
  }

  return out;
}

export interface CorruptionReveal {
  /** The canonical (uncorrupted) Round 1 history — what should render first. */
  messages: ReplayMessage[];
  /** Index into `messages` of the line that later flips to the suppressed one, or null if there's nothing to corrupt. */
  index: number | null;
  /** The suppressed phantom line that index should reveal itself as. */
  revealedText: string | null;
}

/**
 * Like `resolveHistory(beats, ..., true)`, but instead of baking the
 * corruption in statically, returns the canonical log plus which message
 * later "rewrites itself" — so the caller can play that swap out live in
 * front of the player instead of loading it already-corrupted (GDD 9.8).
 */
export function resolveHistoryWithReveal(beats: Beat[], lang: Lang, vars: Record<string, string>): CorruptionReveal {
  const out: ReplayMessage[] = [];
  let index: number | null = null;
  let revealedText: string | null = null;
  let found = false;

  for (const beat of beats) {
    switch (beat.type) {
      case "npc":
        out.push({ id: ++counter, speaker: "npc", text: renderText(beat.text, lang, vars) });
        break;
      case "system":
        out.push({ id: ++counter, speaker: "system", text: renderText(beat.text, lang, vars) });
        break;
      case "time_skip":
        out.push({ id: ++counter, speaker: "system", text: `n:${beat.n}:${beat.unit}` });
        break;
      case "choice": {
        const phantomIdx = beat.options.findIndex((o) => o.isPhantom);
        out.push({ id: ++counter, speaker: "player", text: renderText(beat.options[0].text, lang, vars) });
        if (!found && phantomIdx !== -1) {
          found = true;
          index = out.length - 1;
          revealedText = renderText(beat.options[phantomIdx].text, lang, vars);
        }
        break;
      }
      case "forced": {
        const text = beat.sharedKey ? sharedLine(beat.sharedKey, lang) : renderText(beat.text!, lang, vars);
        out.push({ id: ++counter, speaker: "player", text });
        break;
      }
      case "hesitate":
      case "no_reply":
        break;
    }
  }

  return { messages: out, index, revealedText };
}
