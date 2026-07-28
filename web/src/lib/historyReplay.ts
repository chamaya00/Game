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
