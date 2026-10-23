// Common food allergens in Filipino cooking. The stall declares them; the app never says a dish is free of anything.
export const ALLERGENS = [
  { id: "shellfish", label: "Shellfish" },
  { id: "fish", label: "Fish" },
  { id: "egg", label: "Egg" },
  { id: "milk", label: "Milk" },
  { id: "peanut", label: "Peanut" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat" },
] as const;
export type Allergen = (typeof ALLERGENS)[number]["id"];
export const isAllergen = (v: unknown): v is Allergen => ALLERGENS.some((a) => a.id === v);

/** Stored as "egg,peanut"; read back as a list of known ids. */
export const allergenList = (text: string | null): Allergen[] => (text ?? "").split(",").filter(isAllergen);
