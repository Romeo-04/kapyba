import type { Tone } from "@/src/domain/scoring";

export const TONE_COLOR: Record<Tone, string> = { happy: "var(--leaf)", neutral: "var(--amber)", sad: "var(--chili)" };

const MOUTH: Record<Tone, string> = {
  happy: "M8 14.5c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4",
  neutral: "M9 15.5h6",
  sad: "M8.5 17c1-1.5 2.2-2.2 3.5-2.2s2.5.7 3.5 2.2",
};

export function Face({ tone, size = 32, label }: { tone: Tone; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={TONE_COLOR[tone]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={label ?? tone}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5h.01M15 9.5h.01" />
      <path d={MOUTH[tone]} />
    </svg>
  );
}
