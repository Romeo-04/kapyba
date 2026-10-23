// Stall and phone coordinates. A stall is stored to about 100 m (3 decimals) and a buyer only ever sees a distance, never a coordinate.
export type Coord = { lat: number; lng: number };

export const validCoord = (lat: unknown, lng: unknown): lat is number =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/** Rounds to 3 decimals, about 110 m. */
export const roundCoord = (n: number) => Math.round(n * 1000) / 1000;

/** Great-circle distance in km (haversine). */
export function distanceKm(a: Coord, b: Coord): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
