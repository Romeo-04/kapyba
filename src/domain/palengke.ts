// Palengke: tomorrow's shopping list from Bukas. The recipes and price ranges below are PLACEHOLDER
// estimates written by us, not market data. They exist so the list works on day one; replace the prices
// with the DA price file and let owners edit recipes (see docs/PLAN.md U10) before any pilot claim.
export const PRICE_SOURCE = "placeholder estimate, not market data";

export type Ingredient = "chicken" | "pork" | "fish" | "onion" | "garlic" | "tomato" | "leafy";

/** Price range per kg in pesos. */
export const PRICE_PER_KG: Record<Ingredient, { label: string; low: number; high: number }> = {
  chicken: { label: "Chicken", low: 180, high: 230 },
  pork: { label: "Pork", low: 300, high: 380 },
  fish: { label: "Fish", low: 160, high: 240 },
  onion: { label: "Onion", low: 90, high: 160 },
  garlic: { label: "Garlic", low: 120, high: 220 },
  tomato: { label: "Tomato", low: 60, high: 120 },
  leafy: { label: "Leafy greens", low: 50, high: 90 },
};

/** Kilograms per serving, matched by a word in the dish name (lower case). */
export const RECIPES: Record<string, Partial<Record<Ingredient, number>>> = {
  adobo: { chicken: 0.15, garlic: 0.01, onion: 0.02 },
  tinola: { chicken: 0.15, onion: 0.02, garlic: 0.01, leafy: 0.03 },
  sinigang: { pork: 0.15, tomato: 0.04, onion: 0.02, leafy: 0.05 },
  isda: { fish: 0.2, garlic: 0.01 },
  gulay: { leafy: 0.1, garlic: 0.01, onion: 0.02, tomato: 0.03 },
};

export function recipeFor(dishName: string) {
  const n = dishName.toLowerCase();
  const key = Object.keys(RECIPES).find((k) => n.includes(k));
  return key ? RECIPES[key] : null;
}

export type ListItem = { key: Ingredient; label: string; kg: number; low: number; high: number };
export type ShoppingList = { items: ListItem[]; total: { low: number; high: number }; noRecipe: string[] };

const roundUp = (kg: number) => Math.ceil(kg * 10 - 1e-9) / 10; // buy in 0.1 kg steps

/** Sums ingredients across dishes. A dish with no recipe is listed in `noRecipe`, never guessed. */
export function shoppingList(rows: { name: string; servings: number | null }[]): ShoppingList {
  const kg: Partial<Record<Ingredient, number>> = {};
  const noRecipe: string[] = [];
  for (const r of rows) {
    if (!r.servings) continue;
    const recipe = recipeFor(r.name);
    if (!recipe) { noRecipe.push(r.name); continue; }
    for (const [k, per] of Object.entries(recipe) as [Ingredient, number][]) kg[k] = (kg[k] ?? 0) + per * r.servings;
  }
  const items = (Object.entries(kg) as [Ingredient, number][]).map(([key, raw]) => {
    const buy = roundUp(raw);
    const p = PRICE_PER_KG[key];
    return { key, label: p.label, kg: buy, low: Math.round(buy * p.low), high: Math.round(buy * p.high) };
  });
  items.sort((a, b) => b.high - a.high);
  return {
    items,
    total: { low: items.reduce((s, i) => s + i.low, 0), high: items.reduce((s, i) => s + i.high, 0) },
    noRecipe,
  };
}
