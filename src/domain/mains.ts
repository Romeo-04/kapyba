// The main-ingredient tag on a dish, so a buyer sees at a glance what is in it (and what to avoid).
export const MAINS = [
  { id: "pork", label: "Pork" },
  { id: "chicken", label: "Chicken" },
  { id: "beef", label: "Beef" },
  { id: "fish", label: "Fish" },
  { id: "vegetables", label: "Vegetables" },
  { id: "egg", label: "Egg" },
  { id: "tofu", label: "Tofu" },
] as const;
export type Main = (typeof MAINS)[number]["id"];
export const isMain = (v: unknown): v is Main => MAINS.some((m) => m.id === v);
export const mainLabel = (id: string | null) => MAINS.find((m) => m.id === id)?.label ?? null;
export const MAX_INGREDIENTS = 200;

/** Split the owner's comma separated list into short chips. */
export const ingredientList = (text: string | null) =>
  (text ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);
