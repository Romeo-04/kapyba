// KapyBa mock engine. Ports plan() and costRange() from the CSSPRINT doc. Pure functions, no DOM.
// The real engine lives in src/engine (plan U2/U3); this copy exists so the mock shows true numbers.

const INGREDIENTS = {
  chicken:    { name: 'Manok',      section: 'Karne',     low: 180, high: 220, step: 0.5,  emoji: '🍗' },
  pork:       { name: 'Baboy (kasim)', section: 'Karne',  low: 320, high: 360, step: 0.25, emoji: '🥩' },
  beef:       { name: 'Baka',       section: 'Karne',     low: 380, high: 420, step: 0.25, emoji: '🥩' },
  galunggong: { name: 'Galunggong', section: 'Isda',      low: 200, high: 260, step: 0.5,  emoji: '🐟' },
  tilapia:    { name: 'Tilapia',    section: 'Isda',      low: 150, high: 190, step: 0.5,  emoji: '🐟' },
  onion:      { name: 'Sibuyas',    section: 'Gulay',     low: 120, high: 160, step: 0.5,  emoji: '🧅' },
  tomato:     { name: 'Kamatis',    section: 'Gulay',     low: 60,  high: 90,  step: 0.5,  emoji: '🍅' },
  kangkong:   { name: 'Kangkong',   section: 'Gulay',     low: 30,  high: 50,  step: 0.5,  emoji: '🥬' },
  garlic:     { name: 'Bawang',     section: 'Pampalasa', low: 100, high: 140, step: 0.25, emoji: '🧄' },
};
const PERISHABLE = new Set(['galunggong', 'tilapia', 'kangkong', 'tomato']);

const DISHES = [
  { id: 'adobo',    name: 'Adobo',            emoji: '🍖', price: 70, tags: ['keepsWell', 'highProfit'] },
  { id: 'sinigang', name: 'Sinigang na Baboy', emoji: '🍲', price: 48, tags: ['rainyFav'] },
  { id: 'tinola',   name: 'Tinola',            emoji: '🥣', price: 65, tags: ['rainyFav'] },
  { id: 'bistek',   name: 'Bistek',            emoji: '🥘', price: 80, tags: ['highProfit'] },
  { id: 'galunggong', name: 'Pritong Galunggong', emoji: '🐟', price: 60, tags: [] },
  { id: 'gulay',    name: 'Ginisang Gulay',    emoji: '🥗', price: 35, tags: [] },
];

// kg per serving
const RECIPES = {
  adobo:      { pork: 0.08, chicken: 0.06, garlic: 0.005, onion: 0.01 },
  sinigang:   { pork: 0.10, kangkong: 0.04, tomato: 0.02, onion: 0.01 },
  tinola:     { chicken: 0.10, onion: 0.01, garlic: 0.005 },
  bistek:     { beef: 0.08, onion: 0.03 },
  galunggong: { galunggong: 0.12, garlic: 0.003 },
  gulay:      { kangkong: 0.08, tomato: 0.03, garlic: 0.004 },
};

// Weather factor: P(susp) * suspendedRatio + (1 - P(susp)) * rainyRatio
const BAGYO = {
  none:   { label: 'Walang babala', p: 0,   susp: 1,   rainy: 1,   mascot: 'calm' },
  yellow: { label: 'Yellow rainfall warning', p: 0.1, susp: 0.5, rainy: 0.85, mascot: 'umbrella' },
  orange: { label: 'Orange rainfall warning', p: 0.4, susp: 0.4, rainy: 0.75, mascot: 'raincoat' },
  red:    { label: 'Red rainfall warning',    p: 0.8, susp: 0.3, rainy: 0.7,  mascot: 'salbabida' },
};
const weatherFactor = (level) => {
  const b = BAGYO[level];
  return b.p * b.susp + (1 - b.p) * b.rainy;
};

// Spike applied to onion for the demo alert (+30% this week).
const SPIKE = { onion: 1.3 };
const priceOf = (id) => {
  const i = INGREDIENTS[id], k = SPIKE[id] ?? 1;
  const low = Math.round(i.low * k), high = Math.round(i.high * k);
  return { low, high, mid: Math.round((low + high) / 2) };
};

const BASE_SERVINGS = 60;

function plan(totalServings, dishes, recipes, onHand, buyUnit, perishCut = 1) {
  const n = dishes.length;
  const scores = dishes.map((d, i) => ({ id: d.id, score: (n - i) * (d.tags.includes('rainyFav') ? 1.2 : 1) }));
  const totalScore = scores.reduce((s, d) => s + d.score, 0);
  const servings = {};
  for (const d of scores) servings[d.id] = Math.round((totalServings * d.score) / totalScore);
  const need = {};
  for (const [dish, qty] of Object.entries(servings))
    for (const [ing, per] of Object.entries(recipes[dish]))
      need[ing] = (need[ing] ?? 0) + qty * per * (PERISHABLE.has(ing) ? perishCut : 1);
  const shopping = {};
  for (const [ing, qty] of Object.entries(need)) {
    const toBuy = Math.max(0, qty - (onHand[ing] ?? 0));
    shopping[ing] = Math.ceil(toBuy / buyUnit[ing] - 1e-9) * buyUnit[ing];
  }
  return { servings, shopping };
}

function costRange(qtyLow, qtyHigh, qtyExpected) {
  const sum = (q, pick) => Object.entries(q).reduce((t, [id, a]) => t + a * pick(priceOf(id)), 0);
  return { low: sum(qtyLow, p => p.low), likely: sum(qtyExpected, p => p.mid), high: sum(qtyHigh, p => p.high) };
}

// Full list for a given dish order and Bagyo level.
function buildList(order, level, onHand = { garlic: 0.25 }, servingsOverride) {
  const dishes = order.map(id => DISHES.find(d => d.id === id));
  const wf = weatherFactor(level);
  const total = servingsOverride ?? Math.round(BASE_SERVINGS * wf);
  const perishCut = level === 'none' ? 1 : 0.85;
  const buyUnit = Object.fromEntries(Object.entries(INGREDIENTS).map(([k, v]) => [k, v.step]));
  const run = (t) => plan(t, dishes, RECIPES, onHand, buyUnit, perishCut);
  const mid = run(total), lo = run(Math.round(total * 0.85)), hi = run(Math.round(total * 1.2));
  const items = Object.keys(mid.shopping).filter(k => mid.shopping[k] > 0 || hi.shopping[k] > 0).map(id => {
    const p = priceOf(id);
    return {
      id, ...INGREDIENTS[id],
      qLow: lo.shopping[id] ?? 0, qMid: mid.shopping[id] ?? 0, qHigh: hi.shopping[id] ?? 0,
      cLow: (lo.shopping[id] ?? 0) * p.low, cHigh: (hi.shopping[id] ?? 0) * p.high,
      cLikely: (mid.shopping[id] ?? 0) * p.mid,
      usedBy: dishes.filter(d => RECIPES[d.id][id]).map(d => d.name.split(' ')[0]),
    };
  });
  const total$ = costRange(lo.shopping, hi.shopping, mid.shopping);
  return { items, total: total$, servings: mid.servings, totalServings: total, factor: wf };
}

// Best list under a budget: drop thin-margin dishes first, then trim servings until the likely cost fits.
function budgetFit(order, level, budget) {
  const kept = order.filter(id => margin(id) >= 15);
  const dropped = order.filter(id => !kept.includes(id));
  let servings = Math.round(BASE_SERVINGS * weatherFactor(level));
  let list = buildList(kept, level, undefined, servings);
  while (list.total.likely > budget && servings > 5) {
    servings -= 1;
    list = buildList(kept, level, undefined, servings);
  }
  return { kept, dropped, servings, list };
}

function recipeCost(dishId) {
  return Object.entries(RECIPES[dishId]).reduce((t, [ing, per]) => t + per * priceOf(ing).mid, 0);
}
const margin = (dishId) => Math.round(DISHES.find(d => d.id === dishId).price - recipeCost(dishId));

// Seeded demo history.
const PRICE_HISTORY = {
  onion:   [118, 120, 119, 121, 122, 125, 128, 131, 135, 139, 144, 150, 156, 182],
  pork:    [330, 332, 334, 335, 338, 337, 340, 339, 341, 340, 342, 340, 341, 340],
  chicken: [196, 198, 197, 199, 200, 198, 201, 200, 199, 200, 202, 200, 201, 200],
};
const SALES_BY_DISH = { adobo: 412, sinigang: 366, tinola: 298, bistek: 201, galunggong: 164, gulay: 120 };

if (typeof module !== 'undefined') module.exports = { buildList, weatherFactor, plan, costRange, margin, budgetFit, BAGYO, DISHES, INGREDIENTS, RECIPES, priceOf };
