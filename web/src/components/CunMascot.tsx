export function CunMascot({ size = 64, spin = false }: { size?: number; spin?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={spin ? "cun-spin" : undefined}
      role="img"
      aria-label="Cún"
    >
      <circle cx="32" cy="32" r="30" fill="var(--accent)" />
      <circle cx="23" cy="28" r="3.2" fill="var(--ink)" />
      <circle cx="41" cy="28" r="3.2" fill="var(--ink)" />
      <path d="M22 40 Q32 48 42 40" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
