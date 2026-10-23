export type Pose = "wave" | "cheer" | "cook" | "sleepy" | "worry" | "think" | "peek" | "point" | "walk" | "eat" | "sign";
export type Anim = "bob" | "pop" | "hop" | "sway" | "walk" | "none";

/** Kapy, the KapyBa capybara in a cooking apron. Full-body artwork in /public/kapy; the animation is plain CSS (see .kapy in globals.css). */
export function Kapy({ pose = "wave", size = 96, anim = "bob", label, className = "" }: {
  pose?: Pose; size?: number; anim?: Anim; label?: string; className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`kapy kapy-${anim} ${className}`}
      src={`/kapy/${pose}.webp`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      style={{ height: size, width: "auto" }}
      draggable={false}
      decoding="async"
    />
  );
}
