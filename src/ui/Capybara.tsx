export type Mood = "calm" | "happy" | "worry" | "sleepy";

const EYES: Record<Mood, string> = {
  calm: "M0 0",
  happy: "M19.5 29q2.5-3 5 0M39.5 29q2.5-3 5 0",
  worry: "M0 0",
  sleepy: "M19.5 29h5M39.5 29h5",
};
const MOUTH: Record<Mood, string> = {
  calm: "M28 46q4 3 8 0",
  happy: "M26.5 45q5.5 6 11 0",
  worry: "M28 48q4-3 8 0",
  sleepy: "M29 47h6",
};

/** The KapyBa capybara: round, calm, with a yuzu on its head. Original artwork, one mood per use. */
export function Capybara({ mood = "calm", size = 56, label }: { mood?: Mood; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle cx="14" cy="21" r="6" fill="#8a5a3b" />
      <circle cx="50" cy="21" r="6" fill="#8a5a3b" />
      <circle cx="14" cy="21" r="3" fill="#d9ab84" />
      <circle cx="50" cy="21" r="3" fill="#d9ab84" />
      <ellipse cx="32" cy="37" rx="25" ry="21" fill="#b07d56" />
      <rect x="17" y="33" width="30" height="21" rx="11" fill="#d9ab84" />
      <ellipse cx="27.5" cy="39" rx="1.8" ry="2.4" fill="#4a3226" />
      <ellipse cx="36.5" cy="39" rx="1.8" ry="2.4" fill="#4a3226" />
      {mood === "calm" || mood === "worry" ? (
        <>
          <circle cx="22" cy="29" r="2.6" fill="#3a2a22" />
          <circle cx="42" cy="29" r="2.6" fill="#3a2a22" />
          <circle cx="22.8" cy="28.2" r="0.8" fill="#fff" />
          <circle cx="42.8" cy="28.2" r="0.8" fill="#fff" />
        </>
      ) : (
        <path d={EYES[mood]} stroke="#3a2a22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      )}
      {mood === "worry" && <path d="M18.5 23.5l7 2M45.5 23.5l-7 2" stroke="#3a2a22" strokeWidth="1.8" strokeLinecap="round" />}
      {mood === "happy" && (
        <>
          <circle cx="17" cy="38" r="3" fill="#e58f7a" opacity="0.55" />
          <circle cx="47" cy="38" r="3" fill="#e58f7a" opacity="0.55" />
        </>
      )}
      <path d={MOUTH[mood]} stroke="#4a3226" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="14.5" r="6" fill="#f2a33a" />
      <path d="M32 9c1.5-3 4-3.5 6-3-1 2.5-3.5 3.5-6 3z" fill="#5d9a4f" />
    </svg>
  );
}
