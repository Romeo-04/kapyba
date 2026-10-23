// Common food allergens in Filipino cooking. The stall declares them; the app never says a dish is free of anything.
export const ALLERGENS = [
  { id: "hipon", label: "Hipon", note: "shellfish" },
  { id: "isda", label: "Isda", note: "fish" },
  { id: "itlog", label: "Itlog", note: "egg" },
  { id: "gatas", label: "Gatas", note: "milk" },
  { id: "mani", label: "Mani", note: "peanut" },
  { id: "toyo", label: "Toyo", note: "soy" },
  { id: "trigo", label: "Trigo", note: "wheat" },
] as const;
export type Allergen = (typeof ALLERGENS)[number]["id"];
export const isAllergen = (v: unknown): v is Allergen => ALLERGENS.some((a) => a.id === v);

/** Stored as "itlog,mani"; read back as a list of known ids. */
export const allergenList = (text: string | null): Allergen[] => (text ?? "").split(",").filter(isAllergen);
