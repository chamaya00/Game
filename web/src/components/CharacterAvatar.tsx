import type { AvatarIcon } from "../types";

interface Props {
  icon: AvatarIcon;
  bg: string;
  size?: number;
  dimmed?: boolean;
}

/**
 * Flat, hand-drawn-doodle style avatars (GDD section 10) — simple vector
 * shapes rather than illustrated portraits or generated images, matching
 * the "anonymous dating app, no real faces" premise.
 */
export function CharacterAvatar({ icon, bg, size = 48, dimmed = false }: Props) {
  return (
    <div
      className="char-avatar"
      style={{ width: size, height: size, background: bg, opacity: dimmed ? 0.55 : 1 }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40">
        {icon === "coffee" && <CoffeeIcon />}
        {icon === "cactus" && <CactusIcon />}
        {icon === "daisy" && <DaisyIcon />}
        {icon === "letterK" && <LetterKIcon />}
        {icon === "cat" && <CatIcon />}
      </svg>
    </div>
  );
}

function CoffeeIcon() {
  return (
    <g stroke="#4A3B2E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14 h18 l-2 18 a4 4 0 0 1-4 4 h-8 a4 4 0 0 1-4-4 Z" fill="#FFF7E8" />
      <path d="M27 17 q6 0 6 6 q0 6-6 6" />
      <circle cx="15" cy="24" r="1.6" fill="#4A3B2E" stroke="none" />
      <circle cx="21" cy="24" r="1.6" fill="#4A3B2E" stroke="none" />
      <path d="M14.5 29 q3.5 3 7 0" />
    </g>
  );
}

function CactusIcon() {
  return (
    <g stroke="#2F6D4F" strokeWidth="2" fill="#8FD1A8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="12" width="8" height="22" rx="4" />
      <path d="M16 20 q-6 0-6 -6 q0 4 3 5" />
      <path d="M24 24 q6 0 6 -6 q0 4 -3 5" />
      <path d="M14 34 h12" strokeWidth="2.5" />
    </g>
  );
}

function DaisyIcon() {
  const petals = Array.from({ length: 5 }, (_, i) => i * 72);
  return (
    <g>
      {petals.map((deg) => (
        <ellipse
          key={deg}
          cx="20"
          cy="11"
          rx="4.2"
          ry="7.5"
          fill="#FFFFFF"
          stroke="#E8A9BC"
          strokeWidth="1.5"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="5" fill="#FFC94A" stroke="#C98A2A" strokeWidth="1.2" />
    </g>
  );
}

function LetterKIcon() {
  return (
    <text
      x="20"
      y="29"
      textAnchor="middle"
      fontFamily="'Be Vietnam Pro', sans-serif"
      fontWeight={800}
      fontSize="24"
      fill="#3E5A7A"
    >
      K
    </text>
  );
}

function CatIcon() {
  return (
    <g stroke="#5B4A6F" strokeWidth="2" fill="#E6DCF5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 18 l2-7 5 5Z" fill="#E6DCF5" />
      <path d="M28 18 l-2-7-5 5Z" fill="#E6DCF5" />
      <circle cx="20" cy="22" r="10" />
      <path d="M15 22 q2 2 4 0" />
      <path d="M21 22 q2 2 4 0" />
      <path d="M19 26 q1 1 2 0" strokeWidth="1.5" />
    </g>
  );
}
