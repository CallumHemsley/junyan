/**
 * The town map as the pixel sprites and the town scene see it: thin wrappers over the outdoor map
 * registry (`src/pixel/world/maps.ts`), kept so town-only code reads as before. Map units are pixel
 * tiles (TILE art px).
 *
 * Every town prop gets one sprite, id `town/<prop id without "town.">` (e.g. `town.hedge-0` → `town/hedge-0`),
 * drawn to that prop's footprint: the sprite's anchor sits on the footprint's bottom-centre, so the scene
 * places it at `[x + width / 2, y + height]`. A sprite may rise above its footprint (walls, trees, lamps)
 * but never hangs below it. See docs/design/pixel-contracts.md.
 */
import {
  footprintPx, mapProps, openingsOn as openingsOnMap, outdoorMap, propAnchor, propSpriteId,
  type MapExit, type MapPoint, type MapTerrain, type RawProp,
} from "../world/maps.ts";

export { footprintPx };
export type TownProp = RawProp;
export type TownTerrain = MapTerrain;

export const TOWN = outdoorMap("town") as unknown as {
  id: "town"; bounds: { width: number; height: number };
  props: TownProp[]; terrain: TownTerrain[];
  exits: MapExit[];
  landmarks: { id: string; kind: string; position: MapPoint }[];
  npcHooks: { id: string; characterId: string; position: MapPoint; route: MapPoint[] }[];
};

/** `town.hedge-0` → `town/hedge-0`. */
export const townSpriteId = (propId: string) => propSpriteId("town", propId);

/** The town props of the given kinds, in map order. */
export const townProps = (...kinds: string[]) => mapProps("town", ...kinds);

/** Where the scene puts a town prop's sprite anchor, in tiles. */
export const townAnchor = propAnchor;

/** The doors, gates and paths that open onto a building or prop's footprint, in footprint-relative art px. */
export const openingsOn = (p: TownProp) => openingsOnMap("town", p);
