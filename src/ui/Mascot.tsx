export type MascotMood =
  | "calm"
  | "worry"
  | "happy"
  | "rain"
  | "sleepy"
  | "think"
  | "celebrate"
  | "greet"
  | "idle"
  | "worried";

const MOOD_SRC: Record<MascotMood, string> = {
  calm: "/mascot/kapyba-idle.png",
  idle: "/mascot/kapyba-idle.png",
  worry: "/mascot/kapyba-worried.png",
  worried: "/mascot/kapyba-worried.png",
  happy: "/mascot/kapyba-celebrate.png",
  celebrate: "/mascot/kapyba-celebrate.png",
  greet: "/mascot/kapyba-greet.png",
  rain: "/mascot/kapyba-rain.png",
  sleepy: "/mascot/kapyba-sleepy.png",
  think: "/mascot/kapyba-think.png",
};

export function Mascot({
  mood = "calm",
  size = 56,
  className = "",
  label,
  style,
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}) {
  const src = MOOD_SRC[mood] ?? "/mascot/kapyba-idle.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label ?? `Capybara, ${mood}`}
      width={size}
      height={size}
      style={style}
      className={`mascot mascot-${mood} ${className}`.trim()}
    />
  );
}
