/**
 * The town map as the pixel sprites and the town scene see it. Map units are pixel tiles (TILE art px).
 *
 * Every town prop gets one sprite, id `town/<prop id without "town.">` (e.g. `town.hedge-0` → `town/hedge-0`),
 * drawn to that prop's footprint: the sprite's anchor sits on the footprint's bottom-centre, so the scene
 * places it at `[x + width / 2, y + height]`. A sprite may rise above its footprint (walls, trees, lamps)
 * but never hangs below it. See docs/design/pixel-contracts.md.
 */
import townMap from "../../world/maps/town/map.json" with { type: "json" };
import { TILE } from "../kit/sprite.ts";

export type TownProp = {
  id: string; kind: string; position: { x: number; y: number }; width: number; height: number; variant: number; layer?: string;
};
export type TownTerrain = { id: string; rect: { x: number; y: number; width: number; height: number }; material: string; variant?: number };

export const TOWN = townMap as unknown as {
  id: "town"; bounds: { width: number; height: number };
  props: TownProp[]; terrain: TownTerrain[];
  exits: { id: string; rect: { x: number; y: number; width: number; height: number }; targetMapId: string; kind: string }[];
  landmarks: { id: string; kind: string; position: { x: number; y: number } }[];
  npcHooks: { id: string; characterId: string; position: { x: number; y: number }; route: { x: number; y: number }[] }[];
};

/** `town.hedge-0` → `town/hedge-0`. */
export const townSpriteId = (propId: string) => `town/${propId.replace(/^town\./, "")}`;

/** The town props of the given kinds, in map order. */
export const townProps = (...kinds: string[]) => TOWN.props.filter((p) => kinds.includes(p.kind));

/** Footprint size in whole art pixels (at least 1). */
export const footprintPx = (p: TownProp) => ({ w: Math.max(1, Math.round(p.width * TILE)), h: Math.max(1, Math.round(p.height * TILE)) });

/** Where the scene puts a town prop's sprite anchor, in tiles. */
export const townAnchor = (p: TownProp): readonly [number, number] => [p.position.x + p.width / 2, p.position.y + p.height];

/** The doors, gates and paths that open onto a building or prop's footprint, in footprint-relative art px. */
export function openingsOn(p: TownProp) {
  return TOWN.exits
    .filter((e) => e.rect.x + e.rect.width > p.position.x && e.rect.x < p.position.x + p.width
      && Math.abs(e.rect.y - (p.position.y + p.height)) <= 1.5)
    .map((e) => ({ id: e.id, kind: e.kind, x0: Math.round((e.rect.x - p.position.x) * TILE), x1: Math.round((e.rect.x + e.rect.width - p.position.x) * TILE) }));
}
