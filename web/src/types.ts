export type Gender = "female" | "male";
export type Orientation = "male" | "female" | "both";

export interface NpcBeat {
  type: "npc";
  text: string;
  clue?: boolean;
  effect?: "typing_long" | "message_recalled" | "glitch_subtle";
}

export interface SystemBeat {
  type: "system";
  text: string;
}

export type DialogueBeat = NpcBeat | SystemBeat;

export interface FlavorOption {
  text: string;
  response: string;
}

export interface FlavorChoiceBeat {
  type: "flavor_choice";
  options: FlavorOption[];
}

export interface BranchOption {
  text: string;
  branch: DialogueBeat[];
}

export interface MidpointChoiceBeat {
  type: "midpoint_choice";
  prompt?: string;
  options: BranchOption[];
}

export interface FinalOption {
  text: string;
  leadsTo: "good" | "bad";
}

export interface FinalChoiceBeat {
  type: "final_choice";
  prompt?: string;
  options: FinalOption[];
}

export type Beat = DialogueBeat | FlavorChoiceBeat | MidpointChoiceBeat | FinalChoiceBeat;

export interface EndingBlock {
  title: string;
  beats: DialogueBeat[];
}

export interface RoleVariant {
  name: string;
}

export interface Role {
  id: string;
  order: number;
  accentColor: string;
  variants: { female: RoleVariant; male: RoleVariant };
  profileHook: string;
  vibe: string;
  horrorType: string;
  mysteryRole: string;
  plantClueTag: string;
  beats: Beat[];
  goodEnding: EndingBlock;
  badEnding: EndingBlock;
}

export interface Epilogue {
  id: string;
  title: string;
  condition: string;
  beats: DialogueBeat[];
}

export interface ContentData {
  bigMystery: {
    missingPersonName: string;
    location: string;
    recurringPhrase: string;
    yearsAgo: number;
    epiloguePremise: string;
  };
  roles: Role[];
  epilogues: {
    mostlyGood: Epilogue;
    mostlyBad: Epilogue;
    balanced: Epilogue;
  };
}

export interface DesignTokens {
  appName: string;
  colors: Record<string, string>;
  radius: Record<string, number>;
  fonts: Record<string, string>;
  animation: Record<string, number>;
  roleAccents: Record<string, string>;
}

// A concrete, playable profile: one role rendered as either its female or male variant.
export interface Profile {
  roleId: string;
  gender: Gender;
  name: string;
  accentColor: string;
  profileHook: string;
  order: number;
}

export type EndingResult = "good" | "bad";

export interface SaveData {
  orientation: Orientation | null;
  completedEndings: Record<string, EndingResult>; // roleId -> last ending achieved
  playedGender: Record<string, Gender>; // roleId -> which variant was matched (only relevant for "both")
  epilogueSeen: boolean;
}
