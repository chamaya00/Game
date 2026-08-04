import charactersJson from "@content/characters.json";
import mysteryJson from "@content/mystery.json";
import protagonistJson from "@content/protagonist.json";
import tokensJson from "@content/design-tokens.json";
import uiStringsJson from "@content/ui-strings.json";
import type {
  Character,
  DesignTokens,
  InputMode,
  Interlude,
  Lang,
  LocalizedText,
  ProtagonistData,
  SharedKey,
  SharedLines,
  TrueEndingData,
} from "../types";

interface MysteryData {
  sharedLines: SharedLines;
  trueEnding: TrueEndingData;
}

export const content = charactersJson as unknown as { characters: Character[] };
export const mystery = mysteryJson as unknown as MysteryData;
export const protagonist = protagonistJson as unknown as ProtagonistData;
export const tokens = tokensJson as unknown as DesignTokens;
const uiStrings = uiStringsJson as unknown as Record<string, LocalizedText>;

export function localize(loc: LocalizedText, lang: Lang): string {
  return loc[lang] ?? loc.vi;
}

/** Replaces {name}/{handle}/{playerName}-style placeholders in a string. */
export function interpolate(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [k, v] of Object.entries(vars)) {
    result = result.split(`{${k}}`).join(v);
  }
  return result;
}

export function renderText(loc: LocalizedText, lang: Lang, vars: Record<string, string>): string {
  return interpolate(localize(loc, lang), vars);
}

export function ui(key: keyof typeof uiStrings, lang: Lang, vars?: Record<string, string | number>): string {
  const loc = uiStrings[key];
  let text = localize(loc, lang);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

export function getCharacter(id: string): Character {
  const c = content.characters.find((ch) => ch.id === id);
  if (!c) throw new Error(`Unknown character id: ${id}`);
  return c;
}

export function getCharacters(): Character[] {
  return [...content.characters].sort((a, b) => a.order - b.order);
}

export function sharedLine(key: SharedKey, lang: Lang): string {
  return localize(mystery.sharedLines[key], lang);
}

/** The interlude that plays after a given character's Round 2 chapter closes. */
export function getInterlude(characterId: string): Interlude | undefined {
  return protagonist.interludes.find((i) => i.after === characterId);
}

/**
 * Round 2 input escalation (GDD section 9.2/9.9), keyed off a character's
 * chapter order: 1-2 manual tap, 3 prefilled, 4 autotype, 5 autotype+autosend.
 */
export function getInputMode(order: number): InputMode {
  if (order >= 5) return "autotype_autosend";
  if (order === 4) return "autotype";
  if (order === 3) return "prefilled";
  return "manual";
}

export function timeSkipKey(unit: "day" | "week" | "month"): "time.later_d" | "time.later_w" | "time.later_m" {
  if (unit === "week") return "time.later_w";
  if (unit === "month") return "time.later_m";
  return "time.later_d";
}
