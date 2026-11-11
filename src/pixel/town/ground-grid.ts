/**
 * An outdoor map's terrain rects rasterised to one material per tile. Part of the ground (ticket 0163;
 * any outdoor map since 0176). The town is the default map.
 *
 * Grass is the default. Rects paint in map order, later over earlier. A fractional rect edge rounds to
 * the nearest tile line, and an exact half rounds outward, so a half-tile feature (the canal bank at
 * x 64.5, the restaurant landing at 32.5..35.5) keeps a whole tile rather than vanishing.
 */
import type { MapTerrain } from "../world/maps.ts";
import { TOWN } from "./map.ts";

export const MATERIALS = ["grass", "paving", "road", "brick", "stone", "water"] as const;
export type Material = (typeof MATERIALS)[number];

/**
 * The other outdoor maps' materials, drawn with the town's `ground/*` tiles until they get bespoke
 * tiles of their own (courtyard, rooftop, park and riverbank).
 */
export const MATERIAL_ALIASES: Readonly<Record<string, Material>> = {
  // Courtyard
  "brick-paving": "brick", "courtyard-stone": "stone", "threshold-stone": "stone", "worn-stone": "paving", "moss-earth": "grass",
  // Rooftop
  "roof-brick": "brick", "roof-concrete": "paving", "roof-tile": "stone", "roof-wood": "paving",
  // Workshop (drawn by its own table; these are the town builder's stand-ins)
  "workshop-planks": "brick", "workshop-stone": "stone", "workshop-cobbles": "paving", "workshop-rug": "brick", "workshop-runner": "brick",
  // Residential hall and apartment (their own table; town-builder stand-ins)
  terrazzo: "stone", timber: "brick", woven: "brick", "glazed-tile": "stone",
  // Park and riverbank
  path: "paving", "stone-path": "stone", sand: "paving", boardwalk: "brick", bridge: "stone",
};

const isMaterial = (m: string): m is Material => (MATERIALS as readonly string[]).includes(m);

/** A map material as one of the ground tiles' materials, or null when nothing draws it. */
export const groundMaterial = (material: string): Material | null => isMaterial(material) ? material : MATERIAL_ALIASES[material] ?? null;

/** What the ground reads from a map. */
export type GroundMap = { bounds: { width: number; height: number }; terrain: readonly MapTerrain[] };

/** The tile span [start, end) a rect edge pair covers. Never empty for a positive length. */
export function tileSpan(at: number, length: number): [number, number] {
  const start = at % 1 === 0.5 ? Math.floor(at) : Math.round(at);
  const far = at + length;
  let end = far % 1 === 0.5 ? Math.ceil(far) : Math.round(far);
  if (length > 0 && end <= start) end = start + 1;
  return [start, end];
}

/** What a map drawn through the aliases shows where no terrain rect covers a cell, when not grass. Maps
 *  with their own tile table (`GROUND_SPECS` in `ground-spec.ts`) set their fill there instead. */
export const MAP_FILL: Readonly<Record<string, Material>> = {};

export function groundMaterials(map: GroundMap = TOWN): Material[][] {
  const { width, height } = map.bounds;
  const fill: Material = ("id" in map ? MAP_FILL[(map as GroundMap & { id: string }).id] : undefined) ?? "grass";
  const grid: Material[][] = Array.from({ length: height }, () => Array.from({ length: width }, (): Material => fill));
  for (const t of map.terrain) {
    const material = groundMaterial(t.material);
    if (!material) throw new Error(`Terrain ${t.id} has unknown material "${t.material}"`);
    const [x0, x1] = tileSpan(t.rect.x, t.rect.width), [y0, y1] = tileSpan(t.rect.y, t.rect.height);
    for (let y = Math.max(0, y0); y < Math.min(height, y1); y++)
      for (let x = Math.max(0, x0); x < Math.min(width, x1); x++) grid[y][x] = material;
  }
  return grid;
}
