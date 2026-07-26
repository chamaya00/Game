import rolesJson from "@content/roles.json";
import tokensJson from "@content/design-tokens.json";
import type { ContentData, DesignTokens, Gender, Orientation, Profile, Role } from "../types";

export const content = rolesJson as unknown as ContentData;
export const tokens = tokensJson as unknown as DesignTokens;

export function interpolate(text: string, name: string): string {
  return text.split("{name}").join(name);
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
