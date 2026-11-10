/**
 * The town's terrain rects rasterised to one material per tile. Part of the ground (ticket 0163).
 *
 * Grass is the default. Rects paint in map order, later over earlier. A fractional rect edge rounds to
 * the nearest tile line, and an exact half rounds outward, so a half-tile feature (the canal bank at
 * x 64.5, the restaurant landing at 32.5..35.5) keeps a whole tile rather than vanishing.
 */
import { TOWN } from "./map.ts";

export const MATERIALS = ["grass", "paving", "road", "brick", "stone", "water"] as const;
export type Material = (typeof MATERIALS)[number];

const isMaterial = (m: string): m is Material => (MATERIALS as readonly string[]).includes(m);

/** The tile span [start, end) a rect edge pair covers. Never empty for a positive length. */
export function tileSpan(at: number, length: number): [number, number] {
  const start = at % 1 === 0.5 ? Math.floor(at) : Math.round(at);
  const far = at + length;
  let end = far % 1 === 0.5 ? Math.ceil(far) : Math.round(far);
  if (length > 0 && end <= start) end = start + 1;
  return [start, end];
}

export function groundMaterials(): Material[][] {
  const { width, height } = TOWN.bounds;
  const grid: Material[][] = Array.from({ length: height }, () => Array.from({ length: width }, (): Material => "grass"));
  for (const t of TOWN.terrain) {
    if (!isMaterial(t.material)) throw new Error(`Terrain ${t.id} has unknown material "${t.material}"`);
    const [x0, x1] = tileSpan(t.rect.x, t.rect.width), [y0, y1] = tileSpan(t.rect.y, t.rect.height);
    for (let y = Math.max(0, y0); y < Math.min(height, y1); y++)
      for (let x = Math.max(0, x0); x < Math.min(width, x1); x++) grid[y][x] = t.material;
  }
  return grid;
}
