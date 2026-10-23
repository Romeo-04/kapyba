// The main-ingredient tag on a dish, so a buyer sees at a glance what is in it (and what to avoid).
export const MAINS = [
  { id: "baboy", label: "Baboy" },
  { id: "manok", label: "Manok" },
  { id: "baka", label: "Baka" },
  { id: "isda", label: "Isda" },
  { id: "gulay", label: "Gulay" },
  { id: "itlog", label: "Itlog" },
  { id: "tokwa", label: "Tokwa" },
] as const;
export type Main = (typeof MAINS)[number]["id"];
export const isMain = (v: unknown): v is Main => MAINS.some((m) => m.id === v);
export const mainLabel = (id: string | null) => MAINS.find((m) => m.id === id)?.label ?? null;
export const MAX_INGREDIENTS = 200;

/** Split the owner's comma separated list into short chips. */
export const ingredientList = (text: string | null) =>
  (text ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);
