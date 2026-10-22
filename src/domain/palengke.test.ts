import { describe, expect, it } from "vitest";
import { recipeFor, shoppingList } from "./palengke";

describe("palengke", () => {
  it("matches a recipe by a word in the dish name", () => {
    expect(recipeFor("Chicken Adobo")).toEqual(recipeFor("adobo"));
    expect(recipeFor("Kare-kare")).toBeNull();
  });

  it("sums ingredients, rounds up to 0.1 kg and prices a range", () => {
    const l = shoppingList([{ name: "Adobo", servings: 10 }]);
    const chicken = l.items.find((i) => i.key === "chicken")!;
    expect(chicken.kg).toBe(1.5);
    expect([chicken.low, chicken.high]).toEqual([270, 345]);
    expect(l.items.find((i) => i.key === "garlic")!.kg).toBe(0.1);
    expect(l.total.high).toBe(l.items.reduce((s, i) => s + i.high, 0));
    expect(l.total.low).toBeLessThan(l.total.high);
  });

  it("combines shared ingredients across dishes", () => {
    const both = shoppingList([{ name: "Adobo", servings: 10 }, { name: "Tinola", servings: 10 }]);
    expect(both.items.find((i) => i.key === "chicken")!.kg).toBe(3);
  });

  it("lists dishes without a recipe instead of guessing, and skips zero or missing servings", () => {
    const l = shoppingList([{ name: "Kare-kare", servings: 5 }, { name: "Adobo", servings: null }, { name: "Tinola", servings: 0 }]);
    expect(l.noRecipe).toEqual(["Kare-kare"]);
    expect(l.items).toEqual([]);
    expect(l.total).toEqual({ low: 0, high: 0 });
  });
});
