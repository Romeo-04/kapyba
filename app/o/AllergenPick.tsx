import { ALLERGENS } from "@/src/domain/allergens";

/** Tick what is in the dish. Optional; unticked means nothing is declared, not that the dish is free of it. */
export function AllergenPick({ prefix, value = [] }: { prefix: string; value?: string[] }) {
  return (
    <fieldset className="allergens">
      <legend>Allergens in this dish (optional)</legend>
      <div className="tags">
        {ALLERGENS.map((a) => (
          <label key={a.id} className="tick" htmlFor={`${prefix}-${a.id}`}>
            <input id={`${prefix}-${a.id}`} type="checkbox" name="allergens" value={a.id} defaultChecked={value.includes(a.id)} />
            {a.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
