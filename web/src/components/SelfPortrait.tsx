/**
 * The player's own face, drawn as a flat vector the same way the five
 * characters' avatars are — this app has no real photographs in it, and the
 * protagonist is not an exception to that rule.
 *
 * It resolves across the five interludes (`stage` 0-4): at first there is
 * only an outline, because the player has not looked at themselves in a
 * long time. By the last chapter the eyes are open and pointed straight
 * out of the screen. Stage 4 is also what the jumpscare flashes.
 */
export function SelfPortrait({
  stage,
  size = 120,
  staring = false,
}: {
  stage: number;
  size?: number;
  staring?: boolean;
}) {
  const s = Math.max(0, Math.min(4, stage));
  const stroke = staring ? "#e8eceb" : "#5e706c";
  const fill = staring ? "#161d1c" : "#12171a";

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="">
      {/* head — always present, always empty at first */}
      <ellipse cx="60" cy="62" rx="32" ry="40" fill={fill} stroke={stroke} strokeWidth="2" />

      {/* hair, from stage 1 */}
      {s >= 1 && (
        <path
          d="M28 52 C30 24, 90 24, 92 52 C86 38, 74 32, 60 32 C46 32, 34 38, 28 52 Z"
          fill={stroke}
          opacity={0.55}
        />
      )}

      {/* mouth — a flat line, never a smile */}
      {s >= 2 && <line x1="50" y1="82" x2="70" y2="82" stroke={stroke} strokeWidth="2" strokeLinecap="round" />}

      {/* one eye opens first */}
      {s >= 3 && (
        <>
          <ellipse cx="47" cy="62" rx="6.5" ry={staring ? 6.5 : 4} fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="47" cy="62" r={staring ? 3.2 : 2.2} fill={stroke} />
        </>
      )}

      {/* then the other, and it is looking at you */}
      {s >= 4 && (
        <>
          <ellipse cx="73" cy="62" rx="6.5" ry={staring ? 6.5 : 4} fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="73" cy="62" r={staring ? 3.2 : 2.2} fill={stroke} />
        </>
      )}
    </svg>
  );
}
