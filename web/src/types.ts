export type Gender = "female" | "male";
export type Orientation = "male" | "female" | "both";
export type Lang = "vi" | "en";

export interface LocalizedText {
  vi: string;
  en: string;
}

export interface NpcBeat {
  type: "npc";
  text: LocalizedText;
  clue?: boolean;
  effect?: "typing_long" | "message_recalled" | "glitch_subtle";
}

export interface SystemBeat {
  type: "system";
  text: LocalizedText;
}

export type DialogueBeat = NpcBeat | SystemBeat;

export interface FlavorOption {
  text: LocalizedText;
  response: LocalizedText;
}

export interface FlavorChoiceBeat {
  type: "flavor_choice";
  options: FlavorOption[];
}

export interface BranchOption {
  text: LocalizedText;
  branch: DialogueBeat[];
}

export interface MidpointChoiceBeat {
  type: "midpoint_choice";
  prompt?: LocalizedText;
  options: BranchOption[];
}

export interface FinalOption {
  text: LocalizedText;
  leadsTo: "good" | "bad";
}

export interface FinalChoiceBeat {
  type: "final_choice";
  prompt?: LocalizedText;
  options: FinalOption[];
}

export type Beat = DialogueBeat | FlavorChoiceBeat | MidpointChoiceBeat | FinalChoiceBeat;

export interface EndingBlock {
  title: LocalizedText;
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
  profileHook: LocalizedText;
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
  title: LocalizedText;
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
    trueEnding: Epilogue;
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
  profileHook: LocalizedText;
  order: number;
}

export type EndingResult = "good" | "bad";

export interface SaveData {
  orientation: Orientation | null;
  lang: Lang;
  completedEndings: Record<string, EndingResult>; // roleId -> last ending achieved
  playedGender: Record<string, Gender>; // roleId -> which variant was matched (only relevant for "both")
  epilogueSeen: boolean;
}
