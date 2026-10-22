"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/src/ui/Icon";
import type { IconName } from "@/src/ui/icons";
import { Mascot } from "@/src/ui/Mascot";

export type SimulaStall = { id: string; name: string; area: string; code: string };
export type SimulaExistingDish = {
  id: string;
  name: string;
  icon: string;
  price: number;
  paborito: boolean;
};

type DishConfig = {
  name: string;
  icon: IconName;
  price: number;
  baseServings: number;
  paborito: boolean;
  custom?: boolean;
};

type PersistedState = {
  step: number;
  stallName: string;
  area: string;
  landmarks: string[];
  stall: SimulaStall | null;
  selected: string[];
  dishes: Record<string, DishConfig>;
  savedDishIds: Record<string, string>;
  completed: boolean;
  skipped: boolean;
};

export const SIMULA_STORAGE_KEY = "kapyba.simula.v1";

const LANDMARKS = [
  "UST",
  "FEU Tech",
  "FEU",
  "NU",
  "UE"
] as const;

export const DISH_CATEGORIES: { icon: IconName; label: string }[] = [
  { icon: "meat", label: "Karne" },
  { icon: "fish", label: "Isda" },
  { icon: "bowl", label: "Sabaw" },
  { icon: "leaf", label: "Gulay" },
  { icon: "plate", label: "Iba pa" },
];

const CUSTOM_ICONS: IconName[] = DISH_CATEGORIES.map((c) => c.icon);

const PRESET_DISHES: {
  name: string;
  icon: IconName;
  price: number;
  baseServings: number;
  defaultOn?: boolean;
}[] = [
  { name: "Adobo", icon: "meat", price: 70, baseServings: 30, defaultOn: true },
  { name: "Sinigang", icon: "bowl", price: 70, baseServings: 25, defaultOn: true },
  { name: "Monggo", icon: "leaf", price: 50, baseServings: 20, defaultOn: true },
  { name: "Tinola", icon: "bowl", price: 65, baseServings: 20, defaultOn: true },
  { name: "Galunggong", icon: "fish", price: 60, baseServings: 25, defaultOn: true },
  { name: "Menudo", icon: "meat", price: 65, baseServings: 20, defaultOn: true },
  { name: "Afritada", icon: "meat", price: 65, baseServings: 20 },
  { name: "Pinakbet", icon: "leaf", price: 55, baseServings: 15 },
];

const STEP_META: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Simula", subtitle: "What’s the name of your store?" },
  2: { title: "Ulam", subtitle: "What do you usually cook?" },
  3: { title: "Presyo", subtitle: "How much is each serving?" },
  4: { title: "Karaniwan", subtitle: "How many servings do you sell in a day?" },
  5: { title: "Paborito", subtitle: "What are your top 3 dishes?" },
  6: { title: "QR", subtitle: "Print and post your QR at the counter" },
};

function defaultDishesMap(): Record<string, DishConfig> {
  const map: Record<string, DishConfig> = {};
  for (const p of PRESET_DISHES) {
    map[p.name] = {
      name: p.name,
      icon: p.icon,
      price: p.price,
      baseServings: p.baseServings,
      paborito: false,
    };
  }
  return map;
}

function defaultSelected(): string[] {
  return PRESET_DISHES.filter((d) => d.defaultOn).map((d) => d.name);
}

function defaultState(existingStall: SimulaStall | null): PersistedState {
  return {
    step: existingStall ? 2 : 1,
    stallName: existingStall?.name ?? "",
    area: existingStall?.area ?? "",
    landmarks: [],
    stall: existingStall,
    selected: defaultSelected(),
    dishes: defaultDishesMap(),
    savedDishIds: {},
    completed: false,
    skipped: false,
  };
}

export function loadSimulaState(
  existingStall: SimulaStall | null,
  existingDishes: SimulaExistingDish[] = [],
): PersistedState {
  const applyExisting = (s: PersistedState): PersistedState => {
    if (!existingStall) return s;
    const nextSaved = { ...s.savedDishIds };
    const nextDishes = { ...s.dishes };
    for (const d of existingDishes) {
      nextSaved[d.name] = d.id;
      if (nextDishes[d.name]) {
        nextDishes[d.name] = {
          ...nextDishes[d.name],
          price: d.price,
          paborito: d.paborito,
        };
      } else {
        nextDishes[d.name] = {
          name: d.name,
          icon: (CUSTOM_ICONS.includes(d.icon as IconName) ? d.icon : "bowl") as IconName,
          price: d.price,
          baseServings: 20,
          paborito: d.paborito,
          custom: true,
        };
      }
    }
    return {
      ...s,
      stall: existingStall,
      stallName: s.stallName || existingStall.name,
      area: s.area || existingStall.area,
      dishes: nextDishes,
      savedDishIds: nextSaved,
    };
  };

  if (typeof window === "undefined") return applyExisting(defaultState(existingStall));
  try {
    const raw = window.localStorage.getItem(SIMULA_STORAGE_KEY);
    if (!raw) return applyExisting(defaultState(existingStall));
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    if (!existingStall && parsed.stall) {
      return defaultState(null);
    }
    if (existingStall && parsed.stall && parsed.stall.id !== existingStall.id) {
      return applyExisting(defaultState(existingStall));
    }

    const base = defaultState(existingStall);
    const mergedDishes: Record<string, DishConfig> = { ...base.dishes };
    for (const [k, v] of Object.entries(parsed.dishes ?? {})) {
      if (base.dishes[k]) {
        mergedDishes[k] = {
          ...base.dishes[k],
          price: typeof v.price === "number" ? v.price : base.dishes[k].price,
          baseServings: typeof v.baseServings === "number" ? v.baseServings : base.dishes[k].baseServings,
          paborito: Boolean(v.paborito),
        };
      } else if (v && v.custom) {
        mergedDishes[k] = {
          ...v,
          icon: CUSTOM_ICONS.includes(v.icon) ? v.icon : "plate",
        };
      }
    }
    const validSelected = Array.isArray(parsed.selected)
      ? parsed.selected.filter((name) => Boolean(mergedDishes[name]))
      : [];
    return applyExisting({
      step: typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 6 ? parsed.step : base.step,
      stallName: typeof parsed.stallName === "string" ? parsed.stallName : base.stallName,
      area: typeof parsed.area === "string" ? parsed.area : base.area,
      landmarks: Array.isArray(parsed.landmarks) ? parsed.landmarks : base.landmarks,
      stall: existingStall ?? parsed.stall ?? null,
      selected: validSelected.length > 0 ? validSelected : base.selected,
      dishes: mergedDishes,
      savedDishIds: parsed.savedDishIds ?? {},
      completed: Boolean(parsed.completed),
      skipped: Boolean(parsed.skipped),
    });
  } catch {
    return applyExisting(defaultState(existingStall));
  }
}

const post = (url: string, body: unknown, method = "POST") =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function Simula({
  existingStall,
  existingDishes,
  onFinish,
  onSkip,
}: {
  existingStall: SimulaStall | null;
  existingDishes: SimulaExistingDish[];
  onFinish: () => void;
  onSkip: () => void;
}) {
  const [state, setState] = useState<PersistedState>(() =>
    loadSimulaState(existingStall, existingDishes),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState<IconName>("meat");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIMULA_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!showCustom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setErr("");
        setShowCustom(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCustom]);

  const stopHold = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const selectedDishes = state.selected
    .map((name) => state.dishes[name])
    .filter((d): d is DishConfig => Boolean(d));

  const paboritoCount = selectedDishes.filter((d) => d.paborito).length;

  function setStep(step: number) {
    setErr("");
    setState((prev) => ({ ...prev, step, skipped: false }));
  }

  function toggleLandmark(lm: string) {
    setErr("");
    setState((prev) => {
      const has = prev.landmarks.includes(lm);
      const nextLandmarks = has
        ? prev.landmarks.filter((x) => x !== lm)
        : [...prev.landmarks, lm];
      return { ...prev, landmarks: nextLandmarks };
    });
  }

  function formatLocation(): string {
    const addr = state.area.trim();
    const lms = state.landmarks.join(", ");
    if (addr && lms) return `${addr} (${lms})`.slice(0, 80);
    return (addr || lms).slice(0, 80);
  }

  function toggleDish(name: string) {
    setErr("");
    setState((prev) => {
      const isSelected = prev.selected.includes(name);
      const nextSelected = isSelected
        ? prev.selected.filter((n) => n !== name)
        : [...prev.selected, name];
      return { ...prev, selected: nextSelected };
    });
  }

  function addCustomDish() {
    const trimmed = customName.trim().slice(0, 80);
    if (!trimmed) {
      setErr("Please enter a dish name.");
      return;
    }
    setErr("");
    setState((prev) => {
      const existing = prev.dishes[trimmed];
      const nextDish: DishConfig = existing ?? {
        name: trimmed,
        icon: customIcon,
        price: 65,
        baseServings: 20,
        paborito: false,
        custom: true,
      };
      const nextSelected = prev.selected.includes(trimmed)
        ? prev.selected
        : [...prev.selected, trimmed];
      return {
        ...prev,
        dishes: { ...prev.dishes, [trimmed]: nextDish },
        selected: nextSelected,
      };
    });
    setCustomName("");
    setShowCustom(false);
  }

  function adjustPrice(name: string, delta: number) {
    setPriceDrafts((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setState((prev) => {
      const d = prev.dishes[name];
      if (!d) return prev;
      const nextPrice = Math.max(1, Math.min(10000, d.price + delta));
      return {
        ...prev,
        dishes: { ...prev.dishes, [name]: { ...d, price: nextPrice } },
      };
    });
  }

  function handlePriceChange(name: string, raw: string) {
    setPriceDrafts((prev) => ({ ...prev, [name]: raw }));
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed) && parsed >= 1) {
      const clamped = Math.max(1, Math.min(10000, Math.round(parsed)));
      setState((prev) => {
        const d = prev.dishes[name];
        if (!d) return prev;
        return {
          ...prev,
          dishes: { ...prev.dishes, [name]: { ...d, price: clamped } },
        };
      });
    }
  }

  function handlePriceBlur(name: string) {
    const raw = priceDrafts[name];
    setPriceDrafts((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (raw === undefined || raw.trim() === "") return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      const clamped = Math.max(1, Math.min(10000, Math.round(parsed)));
      setState((prev) => {
        const d = prev.dishes[name];
        if (!d) return prev;
        return {
          ...prev,
          dishes: { ...prev.dishes, [name]: { ...d, price: clamped } },
        };
      });
    }
  }

  function setServings(name: string, servings: number) {
    setState((prev) => {
      const d = prev.dishes[name];
      if (!d) return prev;
      const clamped = Math.max(0, Math.min(500, Math.round(servings)));
      return {
        ...prev,
        dishes: { ...prev.dishes, [name]: { ...d, baseServings: clamped } },
      };
    });
  }

  function togglePaborito(name: string) {
    setErr("");
    setState((prev) => {
      const d = prev.dishes[name];
      if (!d) return prev;
      if (!d.paborito) {
        const currentPicks = prev.selected.filter((n) => prev.dishes[n]?.paborito).length;
        if (currentPicks >= 3) {
          setErr("You can pick up to 3 Paborito dishes.");
          return prev;
        }
      }
      return {
        ...prev,
        dishes: { ...prev.dishes, [name]: { ...d, paborito: !d.paborito } },
      };
    });
  }

  async function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    const name = state.stallName.trim();
    const area = formatLocation();
    if (!name || !area) {
      setErr("Please enter your store name and location.");
      return;
    }
    setErr("");
    if (state.stall) {
      setStep(2);
      return;
    }
    setBusy(true);
    try {
      const r = await post("/api/stalls", { name, area });
      if (!r.ok) {
        if (r.status === 401) {
          setErr("Your session expired. Please sign in again.");
        } else {
          setErr("Could not save your store right now. Please try again.");
        }
        return;
      }
      const data = await r.json();
      setState((prev) => ({
        ...prev,
        stall: data.stall,
        step: 2,
        skipped: false,
      }));
    } finally {
      setBusy(false);
    }
  }

  async function syncAndGoToQR() {
    setErr("");
    setBusy(true);
    try {
      let currentStall = state.stall;
      if (!currentStall) {
        const r = await post("/api/stalls", {
          name: state.stallName.trim() || "Aling Rosa’s Karinderya",
          area: formatLocation() || "UST",
        });
        if (!r.ok) {
          setErr("Could not save stall. Please check stall name and area.");
          return;
        }
        currentStall = (await r.json()).stall as SimulaStall;
      }

      const nextSavedIds = { ...state.savedDishIds };
      for (const ed of existingDishes) {
        nextSavedIds[ed.name] = ed.id;
      }
      for (const dishName of state.selected) {
        const cfg = state.dishes[dishName];
        if (!cfg) continue;
        let dishId = nextSavedIds[dishName];
        if (!dishId) {
          const r = await post(`/api/stalls/${currentStall.id}/dishes`, {
            name: cfg.name,
            icon: cfg.icon,
            price: cfg.price,
            baseServings: cfg.baseServings,
          });
          if (r.ok) {
            const created = (await r.json()).dish as { id: string };
            dishId = created.id;
            nextSavedIds[dishName] = dishId;
          }
        }
        if (dishId && cfg.paborito) {
          await post(`/api/dishes/${dishId}`, { paborito: true }, "PATCH");
        }
      }

      setState((prev) => ({
        ...prev,
        stall: currentStall,
        savedDishIds: nextSavedIds,
        step: 6,
      }));
    } finally {
      setBusy(false);
    }
  }

  function handleSkip() {
    const next = { ...state, skipped: true };
    try {
      window.localStorage.setItem(SIMULA_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
    setState(next);
    onSkip();
  }

  function handleComplete() {
    const next = { ...state, completed: true, skipped: false };
    try {
      window.localStorage.setItem(SIMULA_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
    setState(next);
    onFinish();
  }

  const allDishNames = Object.keys(state.dishes);
  const meta = STEP_META[state.step] ?? STEP_META[1];
  const canContinueStep1 =
    state.stallName.trim().length > 0 &&
    (state.area.trim().length > 0 || state.landmarks.length > 0);

  return (
    <div
      className={`simula stack ${
        state.step === 2
          ? "simula-ulam"
          : state.step === 3
            ? "simula-presyo"
            : state.step === 4
              ? "simula-karaniwan"
              : state.step === 5
                ? "simula-paborito"
                : ""
      }`}
      data-testid="simula-wizard"
    >
      {/* Top Bar: Back button (Steps 2-6 only), 6 progress dots, Skip */}
      <div className="simula-hdr no-print">
        {state.step > 1 ? (
          <button
            type="button"
            className="simula-back"
            aria-label="Back"
            onClick={() => setStep(state.step - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M7.5 2.5L2 8L7.5 13.5M2 8H14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span className="hdr-spacer" aria-hidden="true" />
        )}

        <div
          className="dots"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuemin={1}
          aria-valuemax={6}
          aria-valuenow={state.step}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <i key={n} className={n === state.step ? "on" : n < state.step ? "done" : ""} />
          ))}
        </div>

        <button
          type="button"
          className="simula-skip"
          disabled={!state.stall || state.step === 6}
          onClick={handleSkip}
        >
          Skip
        </button>
      </div>

      {/* Title & Subtitle */}
      <div className="simula-heading">
        <div className="simula-title-row">
          <h1>{meta.title}</h1>
          {state.step === 2 && (
            <span className="ulam-count-pill" data-testid="ulam-selected-count">
              {state.selected.length} selected
            </span>
          )}
          {state.step === 5 && (
            <span className="ulam-count-pill" data-testid="paborito-selected-count">
              {paboritoCount} / 3
            </span>
          )}
        </div>
        <p className="simula-subtitle">{meta.subtitle}</p>
      </div>

      {/* STEP 1: SIMULA */}
      {state.step === 1 && (
        <form className="simula-body stack" onSubmit={handleStep1Next}>
          {/* Mascot Welcome Card */}
          <div className="mascot-card">
            <Mascot mood="calm" size={96} />
            <div className="mascot-copy">
              <div className="mascot-brand">KapyBa</div>
              <div className="mascot-sub">Tindahan mo, alaga mo.</div>
            </div>
          </div>

          <div className="simula-field">
            <label htmlFor="name">Karinderya</label>
            <div className="field-box">
              <span className="field-ico" aria-hidden="true">
                <Icon name="store" />
              </span>
              <input
                id="name"
                name="name"
                aria-label="Stall name"
                required
                maxLength={80}
                placeholder="e.g. Aling Rosa’s Karinderya"
                value={state.stallName}
                onChange={(e) => setState((p) => ({ ...p, stallName: e.target.value }))}
              />
            </div>
          </div>

          <div className="simula-field">
            <label htmlFor="area">Location</label>
            <div className="field-box">
              <span className="field-ico" aria-hidden="true">
                <Icon name="pin" />
              </span>
              <input
                id="area"
                name="area"
                aria-label="Area or school nearby"
                required={state.landmarks.length === 0}
                maxLength={80}
                placeholder="e.g. 1245 P. Noval St., Sampaloc"
                value={state.area}
                onChange={(e) => setState((p) => ({ ...p, area: e.target.value }))}
              />
            </div>

            <div className="chips location-chips" role="group" aria-label="Nearby landmarks">
              {LANDMARKS.map((lm) => {
                const selected = state.landmarks.includes(lm);
                return (
                  <button
                    key={lm}
                    type="button"
                    aria-pressed={selected}
                    className={`chip ${selected ? "on" : ""}`}
                    onClick={() => toggleLandmark(lm)}
                  >
                    {lm}
                  </button>
                );
              })}
            </div>
          </div>
          {err && (
            <p className="err" role="alert">
              {err}
            </p>
          )}

          <div className="simula-footer">
            <button
              type="submit"
              className="btn block primary-cta"
              aria-label="Next"
              disabled={busy || !canContinueStep1}
            >
              <span>Continue</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M9.5 4L14.5 9L9.5 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ULAM */}
      {state.step === 2 && (
        <div className="simula-body stack">
          <div className="ulam-scroll stack">
            <div className="grid3">
              {allDishNames.map((name) => {
                const d = state.dishes[name];
                const on = state.selected.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    className={`tile ${on ? "on" : ""}`}
                    aria-pressed={on}
                    onClick={() => toggleDish(name)}
                  >
                    {on && (
                      <span className="tile-check" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.5 6.2L5 8.7L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                    <span className="tile-ico">
                      <Icon name={d.icon} />
                    </span>
                    <span className="tile-name">{d.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`tile custom-tile ${showCustom ? "on" : ""}`}
                aria-expanded={showCustom}
                aria-haspopup="dialog"
                onClick={() => {
                  setErr("");
                  setShowCustom(true);
                }}
              >
                <span className="tile-ico">
                  <Icon name="plus" />
                </span>
                <span className="tile-name">Custom</span>
              </button>
            </div>
            {err && !showCustom && (
              <p className="err" role="alert">
                {err}
              </p>
            )}
          </div>

          {showCustom && (
            <div
              className="modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="custom-dish-modal-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setErr("");
                  setShowCustom(false);
                }
              }}
            >
              <form
                className="modal-card stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  addCustomDish();
                }}
              >
                <div className="modal-hdr">
                  <h2 id="custom-dish-modal-title">Add custom ulam</h2>
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Close"
                    onClick={() => {
                      setErr("");
                      setShowCustom(false);
                    }}
                  >
                    <Icon name="x" />
                  </button>
                </div>

                <div className="simula-field">
                  <label htmlFor="custom-dish-name">Custom dish</label>
                  <div className="field-box">
                    <span className="field-ico" aria-hidden="true">
                      <Icon name={customIcon} />
                    </span>
                    <input
                      id="custom-dish-name"
                      type="text"
                      maxLength={80}
                      placeholder="e.g. Igado"
                      autoFocus
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label>Category</label>
                  <div className="chips" role="group" aria-label="Dish category">
                    {DISH_CATEGORIES.map(({ icon, label }) => (
                      <button
                        key={icon}
                        type="button"
                        className={`chip ${customIcon === icon ? "on" : ""}`}
                        aria-label={label}
                        aria-pressed={customIcon === icon}
                        onClick={() => setCustomIcon(icon)}
                      >
                        <Icon name={icon} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {err && (
                  <p className="err" role="alert">
                    {err}
                  </p>
                )}

                <div className="row" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn soft grow"
                    onClick={() => {
                      setErr("");
                      setShowCustom(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn grow">
                    <Icon name="plus" /> Add dish
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="simula-footer">
            <button
              type="button"
              className="btn block primary-cta"
              aria-label="Next"
              disabled={state.selected.length === 0}
              onClick={() => setStep(3)}
            >
              <span>Continue</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M9.5 4L14.5 9L9.5 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PRESYO */}
      {state.step === 3 && (
        <div className="simula-body stack">
          <div className="presyo-meta">
            <span className="presyo-count" data-testid="presyo-dish-count">
              {selectedDishes.length} ulam
            </span>
            <span className="presyo-unit">₱ / serving</span>
          </div>

          <div className="presyo-list">
            {selectedDishes.map((d) => (
              <div key={d.name} className="presyo-row">
                <span className="presyo-ico" aria-hidden="true">
                  <Icon name={d.icon} />
                </span>
                <strong className="presyo-name grow">{d.name}</strong>
                <div className="presyo-stepper">
                  <button
                    type="button"
                    className="presyo-step-btn minus"
                    aria-label={`Decrease ${d.name} price`}
                    onClick={() => adjustPrice(d.name, -1)}
                    onPointerDown={() => {
                      stopHold();
                      holdTimer.current = setInterval(() => adjustPrice(d.name, -1), 140);
                    }}
                    onPointerUp={stopHold}
                    onPointerLeave={stopHold}
                  >
                    <Icon name="minus" />
                  </button>
                  <div className="presyo-price-wrap">
                    <span className="presyo-peso" aria-hidden="true">
                      ₱
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      aria-label={`${d.name} price`}
                      className="presyo-input"
                      min={1}
                      max={10000}
                      style={{
                        width: `${Math.max(
                          2,
                          String(d.name in priceDrafts ? priceDrafts[d.name] : d.price).length,
                        )}ch`,
                      }}
                      value={d.name in priceDrafts ? priceDrafts[d.name] : d.price}
                      onChange={(e) => handlePriceChange(d.name, e.target.value)}
                      onBlur={() => handlePriceBlur(d.name)}
                    />
                  </div>
                  <button
                    type="button"
                    className="presyo-step-btn plus"
                    aria-label={`Increase ${d.name} price`}
                    onClick={() => adjustPrice(d.name, 1)}
                    onPointerDown={() => {
                      stopHold();
                      holdTimer.current = setInterval(() => adjustPrice(d.name, 1), 140);
                    }}
                    onPointerUp={stopHold}
                    onPointerLeave={stopHold}
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="simula-footer">
            <button
              type="button"
              className="btn block primary-cta"
              aria-label="Next"
              onClick={() => setStep(4)}
            >
              <span>Continue</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M9.5 4L14.5 9L9.5 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: KARANIWAN */}
      {state.step === 4 && (
        <div className="simula-body stack">
          <div className="presyo-meta">
            <span className="presyo-count">Rough estimate</span>
            <span className="presyo-unit">Servings / day</span>
          </div>

          <div className="karaniwan-list">
            {selectedDishes.map((d) => {
              const pct = Math.min(100, Math.max(0, (d.baseServings / 50) * 100));
              return (
                <div key={d.name} className="karaniwan-row">
                  <div className="karaniwan-top">
                    <strong className="presyo-name">{d.name}</strong>
                    <span className="karaniwan-val">{d.baseServings} servings / day</span>
                  </div>
                  <div className="karaniwan-slider-row">
                    <span className="karaniwan-ico" aria-hidden="true">
                      <Icon name="utensils" />
                    </span>
                    <input
                      type="range"
                      className="karaniwan-slider grow"
                      aria-label={`${d.name} servings`}
                      min={0}
                      max={50}
                      step={5}
                      value={d.baseServings}
                      style={{ "--pct": `${pct}%` } as React.CSSProperties}
                      onChange={(e) => setServings(d.name, Number(e.target.value))}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="simula-footer">
            <button
              type="button"
              className="btn block primary-cta"
              aria-label="Next"
              onClick={() => setStep(5)}
            >
              <span>Continue</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M9.5 4L14.5 9L9.5 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PABORITO */}
      {state.step === 5 && (
        <div className="simula-body stack">
          <div className="ulam-scroll stack">
            <div className="paborito-list">
              {selectedDishes.map((d) => {
                const disabled = !d.paborito && paboritoCount >= 3;
                return (
                  <button
                    key={d.name}
                    type="button"
                    className={`paborito-row ${d.paborito ? "on" : ""}`}
                    aria-pressed={d.paborito}
                    disabled={disabled}
                    onClick={() => togglePaborito(d.name)}
                  >
                    <span className="paborito-ico" aria-hidden="true">
                      <Icon name={d.icon} />
                    </span>
                    <strong className="paborito-name">{d.name}</strong>
                    <span className="paborito-heart" aria-hidden="true">
                      <Icon name="heart" />
                    </span>
                  </button>
                );
              })}
            </div>
            {err && (
              <p className="err center" role="alert">
                {err}
              </p>
            )}
          </div>

          <div className="simula-footer">
            <button
              type="button"
              className="btn block primary-cta"
              aria-label="Next"
              disabled={busy}
              onClick={syncAndGoToQR}
            >
              <span>{busy ? "Saving..." : "Continue"}</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M9.5 4L14.5 9L9.5 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: QR */}
      {state.step === 6 && state.stall && (
        <div className="simula-body qr-step stack">
          {/* Printable QR Poster Card */}
          <div className="card qr-card">
            <div className="qr-card-hdr">
              <h2 className="qr-stall-name">{state.stall.name}</h2>
              <p className="qr-stall-area">{state.stall.area}</p>
            </div>

            <div className="qr-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/stalls/${state.stall.id}/qr`}
                alt="Stall QR code"
                width={204}
                height={204}
                className="qr-img"
              />
              <span className="qr-mascot-badge" aria-hidden="true">
                <Mascot mood="calm" size={44} />
              </span>
            </div>

            <p className="qr-code-text">{state.stall.code}</p>
          </div>

          {/* Footer Action Row */}
          <div className="simula-footer qr-footer no-print">
            <div className="qr-actions">
              <a
                className="btn soft qr-download-btn"
                href={`/api/stalls/${state.stall.id}/qr`}
                download={`kapyba-${state.stall.code}.svg`}
                aria-label="Download QR"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <button
                type="button"
                className="btn primary-cta qr-finish-btn"
                onClick={handleComplete}
              >
                <span>Finish</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 9.5L7.2 13.2L14.5 5.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
