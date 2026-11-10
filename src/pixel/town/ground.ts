/**
 * The town's ground as tile layers, built from the map's terrain rects. Owned by the ground worker
 * (ticket 0163); the town scene (ticket 0174) only calls `groundLayers()` and must not depend on its insides.
 *
 * This first version is a stub: one layer, grass everywhere, each terrain rect painted over it in map
 * order with its material's base tiles. The ground worker replaces it with variants, edges and kerbs.
 */
import type { TileLayer } from "../engine/index.ts";
import { TOWN } from "./map.ts";

const CODE: Record<string, string> = { grass: "g", paving: "p", road: "r", brick: "b", stone: "s", water: "w" };

export function groundLayers(): TileLayer[] {
  const { width, height } = TOWN.bounds;
  const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => "g"));
  for (const t of TOWN.terrain) {
    const code = CODE[t.material] ?? "g";
    for (let y = Math.floor(t.rect.y); y < Math.ceil(t.rect.y + t.rect.height) && y < height; y++)
      for (let x = Math.floor(t.rect.x); x < Math.ceil(t.rect.x + t.rect.width) && x < width; x++) cells[y][x] = code;
  }
  return [{
    name: "ground",
    rows: cells.map((row) => row.join("")),
    legend: Object.fromEntries(Object.entries(CODE).map(([material, code]) => [code, `ground/${material}-a`])),
  }];
}
