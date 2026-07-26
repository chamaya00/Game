import rolesJson from "@content/roles.json";
import tokensJson from "@content/design-tokens.json";
import uiStringsJson from "@content/ui-strings.json";
import type { ContentData, DesignTokens, Gender, Lang, LocalizedText, Orientation, Profile, Role } from "../types";

export const content = rolesJson as unknown as ContentData;
export const tokens = tokensJson as unknown as DesignTokens;
const uiStrings = uiStringsJson as unknown as Record<string, LocalizedText>;

/** Picks the string for the current language out of a {vi, en} pair. */
export function localize(loc: LocalizedText, lang: Lang): string {
  return loc[lang] ?? loc.vi;
}

/** Replaces the `{name}` placeholder used throughout the shared script content. */
export function interpolate(text: string, name: string): string {
  return text.split("{name}").join(name);
}

/** localize() + interpolate() combined — the common case when rendering a beat. */
export function renderText(loc: LocalizedText, lang: Lang, name: string): string {
  return interpolate(localize(loc, lang), name);
}

/** Looks up a UI-chrome string (buttons, labels, dialogs) and fills in any {var} placeholders. */
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

export function getRole(roleId: string): Role {
  const role = content.roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`Unknown role id: ${roleId}`);
  return role;
}

/**
 * Builds the list of playable profiles for a given orientation.
 * "both" shows both gender-variants of every role (16 profiles) until the
 * player matches one variant of a role — from then on only that played
 * variant is shown, since both variants are "the same role" in the mystery
 * and only one can be played per playthrough (GDD section 2.0).
 */
export function buildProfileList(
  orientation: Orientation,
  playedGender: Record<string, Gender>
): Profile[] {
  const profiles: Profile[] = [];

  for (const role of content.roles) {
    const genders: Gender[] =
      orientation === "both"
        ? playedGender[role.id]
          ? [playedGender[role.id]]
          : ["female", "male"]
        : [orientation];

    for (const gender of genders) {
      const variant = role.variants[gender];
      profiles.push({
        roleId: role.id,
        gender,
        name: variant.name,
        accentColor: role.accentColor,
        profileHook: role.profileHook,
        order: role.order,
      });
    }
  }

  return profiles.sort((a, b) => a.order - b.order);
}
