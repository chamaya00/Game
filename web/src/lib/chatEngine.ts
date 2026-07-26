import type { Beat, Role } from "../types";

export interface DisplayMessage {
  id: number;
  speaker: "npc" | "system" | "player";
  text: string;
  effect?: "message_recalled" | "glitch_subtle";
  recalled?: boolean;
}

export type PendingChoice =
  | { kind: "flavor"; options: { text: string; response: string }[] }
  | { kind: "midpoint"; prompt?: string; options: { text: string; branch: Beat[] }[] }
  | { kind: "final"; prompt?: string; options: { text: string; leadsTo: "good" | "bad" }[] };

export function beatToPendingChoice(beat: Beat): PendingChoice | null {
  if (beat.type === "flavor_choice") return { kind: "flavor", options: beat.options };
  if (beat.type === "midpoint_choice") return { kind: "midpoint", prompt: beat.prompt, options: beat.options };
  if (beat.type === "final_choice") return { kind: "final", prompt: beat.prompt, options: beat.options };
  return null;
}

export function initialQueue(role: Role): Beat[] {
  return [...role.beats];
}
