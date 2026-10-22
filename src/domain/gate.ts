// Public-score gate from IDEA.md section 6. Pure; no framework imports.
export const MIN_RATINGS = 10;
export const MIN_BUYERS = 5;

export type Gate =
  | { state: "public" }
  | { state: "kulang"; have: number; need: number };

export function publicGate(count: number, distinctBuyers: number, published: boolean): Gate {
  if (published && count >= MIN_RATINGS && distinctBuyers >= MIN_BUYERS) return { state: "public" };
  return { state: "kulang", have: count, need: MIN_RATINGS };
}
