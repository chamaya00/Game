export type Lang = "vi" | "en";

export interface LocalizedText {
  vi: string;
  en: string;
}

export type TimeUnit = "day" | "week" | "month";
export type SharedKey = "the_line" | "the_question";
export type AvatarIcon = "coffee" | "cactus" | "daisy" | "letterK" | "cat";
export type ProfileAttachment = "none" | "gray_boxes" | "loaded_image" | "audio_file";
export type InputMode = "manual" | "prefilled" | "autotype" | "autotype_autosend";

export interface ChoiceOption {
  text: LocalizedText;
  isPhantom?: boolean;
  swapToIndex?: number; // index into the same options array this phantom option silently sends instead
}

// A single unified beat type used by both Round 1 and Round 2 sequences.
export type Beat =
  | { type: "npc"; text: LocalizedText; effect?: "typing_long" }
  | { type: "system"; text: LocalizedText }
  | { type: "time_skip"; n: number; unit: TimeUnit }
  | { type: "choice"; options: ChoiceOption[] }
  | { type: "forced"; text?: LocalizedText; sharedKey?: SharedKey }
  | { type: "hesitate"; seconds: number }
  | { type: "no_reply"; labelKey?: "chat.no_reply" | "chat.leave" };

export interface EndingMeta {
  title: LocalizedText;
  note: LocalizedText;
}

export interface ProfileFlash {
  durationMs: number; // Infinity-like large number for chapter 5 ("no longer turns off")
  attachment: ProfileAttachment;
  revealLine?: LocalizedText;
  scrollbarShort?: boolean;
}

export interface BadEnding {
  beats: Beat[];
  profileFlash: ProfileFlash;
}

export interface Character {
  id: string;
  handle: string;
  order: number; // 1-5, drives round2 input-mode escalation (section 9.2/9.9)
  avatarColor: string;
  avatarIcon: AvatarIcon;
  round1: Beat[];
  round1Ending: EndingMeta;
  round2: Beat[];
  badEnding: BadEnding;
}

export interface SharedLines {
  the_line: LocalizedText;
  the_question: LocalizedText;
}

export interface TrueEndingScene3Choice {
  text?: LocalizedText;
  sharedKey?: SharedKey;
  endingId: "loop" | "stopped";
}

export interface TrueEndingData {
  filePrefix: string[]; // filler handles shown while scrolling, before the final entry
  finalEntry: {
    label: LocalizedText;
    dateLabel: string;
    lines: LocalizedText[];
  };
  scene2Lines: LocalizedText[]; // flashback, sequential fade-in; includes the_line at the pivot
  scene3NpcLines: LocalizedText[];
  scene3Choices: TrueEndingScene3Choice[];
  scene3Endings: {
    loop: Beat[];
    stopped: Beat[];
  };
}

export interface ContentData {
  characters: Character[];
  sharedLines: SharedLines;
  trueEnding: TrueEndingData;
}

export interface DesignTokens {
  appName: string;
  mascotName: string;
  colorsRound1: Record<string, string>;
  colorsRound2: Record<string, string>;
  radius: Record<string, number>;
  fonts: Record<string, string>;
  animation: Record<string, number>;
}

export interface SaveData {
  lang: Lang;
  playerName: string;
  contentWarningSeen: boolean;
  theEndSeen: boolean; // whether the "THE END / something felt wrong" transition has played
  // characterId -> phase reached
  progress: Record<string, "round1_done" | "round2_done">;
  phantomTapped: Record<string, boolean>; // characterId -> whether any phantom option was ever tapped
  seenAt: Record<string, number>; // characterId -> epoch ms after which the last message backdates to "Seen"
  trueEndingChoice?: "loop" | "stopped";
  soundOn: boolean;
}

export interface Profile {
  id: string;
  handle: string;
  avatarColor: string;
  avatarIcon: AvatarIcon;
  order: number;
}
