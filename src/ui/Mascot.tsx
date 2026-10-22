export type MascotMood = "calm" | "worry" | "happy" | "rain" | "sleepy";

export function Mascot({
  mood = "calm",
  size = 56,
  className = "",
  label,
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/aling-rosa.png"
      alt={label ?? `Capybara, ${mood}`}
      width={size}
      height={size}
      className={`mascot mascot-${mood} ${className}`.trim()}
    />
  );
}
