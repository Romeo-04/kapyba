import { Kapy, type Pose } from "./Kapy";

export type Mood = "calm" | "happy" | "worry" | "sleepy";

const POSE: Record<Mood, Pose> = { calm: "wave", happy: "cheer", worry: "worry", sleepy: "sleepy" };

/** Older call sites pick a mood; each mood is one Kapy pose. New code can use Kapy directly. */
export function Capybara({ mood = "calm", size = 56, label }: { mood?: Mood; size?: number; label?: string }) {
  return <Kapy pose={POSE[mood]} size={size} label={label} anim={mood === "sleepy" ? "sway" : "bob"} />;
}
