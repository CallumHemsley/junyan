/**
 * The outdoor maps the pixel engine draws, as the sprites and the scene compiler see them. Map units
 * are pixel tiles (TILE art px). Adding a map is one line in `OUTDOOR_MAPS` (and its id in
 * `src/world/pixel/maps.ts`); its scene, ground and sprites follow from the JSON.
 *
 * Every prop gets one sprite, id `<map id>/<prop id without "<map id>.">` (`town.hedge-0` →
 * `town/hedge-0`, `courtyard.planter-3` → `courtyard/planter-3`), drawn to that prop's footprint: the
 * sprite's anchor sits on the footprint's bottom-centre, so the scene places it at
 * `[x + width / 2, y + height]`. A sprite may rise above its footprint (walls, trees, lamps) but never
 * hangs below it. A kind's generator iterates `mapProps("all", kind)`, so a kind drawn for the town is
 * drawn for every map that uses it. See docs/design/pixel-contracts.md.
 */
import townMap from "../../world/maps/town/map.json" with { type: "json" };
import courtyardMap from "../../world/maps/courtyard/map.json" with { type: "json" };
import rooftopMap from "../../world/maps/rooftop/map.json" with { type: "json" };
import parkMap from "../../world/maps/landscape/park.json" with { type: "json" };
import riverbankMap from "../../world/maps/landscape/riverbank.json" with { type: "json" };
import workshopMap from "../../world/maps/workshop/map.json" with { type: "json" };
import readingRoomMap from "../../world/maps/reading-room/map.json" with { type: "json" };
import { TILE } from "../kit/sprite.ts";

export type MapRect = { x: number; y: number; width: number; height: number };
export type MapPoint = { x: number; y: number };
export type MapFacing = "north" | "south" | "east" | "west";

/** A prop as the map JSON has it. */
export type RawProp = {
  id: string; kind: string; position: MapPoint; width: number; height: number; variant: number; layer?: string;
  /** Crown spread in tiles, for a landscape tree whose footprint the registry narrowed to its trunk. */
  spread?: number;
};
/** A prop tagged with the id of the map it stands on. */
export type MapProp = RawProp & { map: string };
export type MapTerrain = { id: string; rect: MapRect; material: string; variant?: number };
export type MapExit = { id: string; rect: MapRect; targetMapId: string; kind: string };

/** What the pixel pipeline reads from an outdoor map's JSON. */
export type OutdoorMap = {
  id: string;
  bounds: { width: number; height: number };
  props: RawProp[];
  terrain: MapTerrain[];
  exits: MapExit[];
  entrances: { id: string; position: MapPoint; facing: MapFacing }[];
  anchors: { id: string; position: MapPoint }[];
  landmarks: { id: string; kind: string; position: MapPoint }[];
  walkable: MapRect[];
  colliders: { id: string; rect: MapRect }[];
  occluders: { id: string; rect: MapRect; fadeWhenPlayerBehind?: boolean }[];
  npcHooks: { id: string; characterId: string; position: MapPoint; route: MapPoint[] }[];
};

/**
 * The landscape maps (park, riverbank; `src/world/maps/landscape/author.py`) position each prop by
 * its centre, where every other map uses the footprint's top-left. The pixel pipeline reads them
 * through this adapter, so their props sit on their colliders (a tree's trunk on its trunk) and
 * everything downstream keeps the one convention.
 */
function centredProps(map: OutdoorMap): OutdoorMap {
  return {
    ...map,
    props: map.props.map((p) => {
      // A landscape tree's authored size is its crown's spread; its footprint here is its trunk (the
      // map's own trunk collider), so it depth-sorts at the trunk like the town's trees.
      const trunk = LANDSCAPE_TRUNKS[p.kind];
      const w = trunk ?? p.width, h = trunk ?? p.height;
      return { ...p, position: { x: p.position.x - w / 2, y: p.position.y - h / 2 }, width: w, height: h, ...(trunk ? { spread: p.width } : {}) };
    }),
  };
}
/** Trunk widths in tiles, as `author.py` sizes the trunk colliders. */
const LANDSCAPE_TRUNKS: Record<string, number> = { "mature-tree": 0.8, tree: 0.55, willow: 0.55 };

/**
 * The registered outdoor maps, in sprite order. The town comes first and stays first: kind generators
 * that seed by index (benches, bicycles, lamps, planters…) keep the town's sprites byte-identical.
 */
export const OUTDOOR_MAPS: Readonly<Record<string, OutdoorMap>> = {
  town: townMap as unknown as OutdoorMap,
  courtyard: courtyardMap as unknown as OutdoorMap,
  rooftop: rooftopMap as unknown as OutdoorMap,
  park: centredProps(parkMap as unknown as OutdoorMap),
  riverbank: centredProps(riverbankMap as unknown as OutdoorMap),
  workshop: workshopMap as unknown as OutdoorMap,
  "reading-room": readingRoomMap as unknown as OutdoorMap,
};
export const OUTDOOR_MAP_IDS: readonly string[] = Object.keys(OUTDOOR_MAPS);

export function outdoorMap(id: string): OutdoorMap {
  const map = OUTDOOR_MAPS[id];
  if (!map) throw new Error(`No outdoor pixel map "${id}"; registered: ${OUTDOOR_MAP_IDS.join(", ")}`);
  return map;
}

const tagged = new Map<string, MapProp[]>();
function propsOf(id: string): MapProp[] {
  let props = tagged.get(id);
  if (!props) tagged.set(id, props = outdoorMap(id).props.map((p) => ({ ...p, map: id })));
  return props;
}

/**
 * The props of the given kinds (every prop when no kind is named) on the given maps, tagged with
 * their map id: map by map in registry order, each map in its own order.
 */
export function mapProps(maps: string | readonly string[], ...kinds: string[]): MapProp[] {
  const ids = maps === "all" ? OUTDOOR_MAP_IDS : typeof maps === "string" ? [maps] : maps;
  return ids.flatMap((id) => propsOf(id).filter((p) => !kinds.length || kinds.includes(p.kind)));
}

/** `("town", "town.hedge-0")` → `town/hedge-0`. */
export const propSpriteId = (mapId: string, propId: string) =>
  `${mapId}/${propId.startsWith(`${mapId}.`) ? propId.slice(mapId.length + 1) : propId}`;

/** A tagged prop's sprite id. */
export const spriteIdOf = (prop: MapProp) => propSpriteId(prop.map, prop.id);

/** Footprint size in whole art pixels (at least 1). */
export const footprintPx = (p: RawProp) => ({ w: Math.max(1, Math.round(p.width * TILE)), h: Math.max(1, Math.round(p.height * TILE)) });

/** Where the scene puts a prop's sprite anchor, in tiles: the footprint's bottom-centre. */
export const propAnchor = (p: RawProp): readonly [number, number] => [p.position.x + p.width / 2, p.position.y + p.height];

/** The doors, gates and paths of `mapId` that open onto a prop's footprint, in footprint-relative art px. */
export function openingsOn(mapId: string, p: RawProp) {
  return outdoorMap(mapId).exits
    .filter((e) => e.rect.x + e.rect.width > p.position.x && e.rect.x < p.position.x + p.width
      && Math.abs(e.rect.y - (p.position.y + p.height)) <= 1.5)
    .map((e) => ({ id: e.id, kind: e.kind, x0: Math.round((e.rect.x - p.position.x) * TILE), x1: Math.round((e.rect.x + e.rect.width - p.position.x) * TILE) }));
}

/** Every registered prop by sprite id. */
export function propsBySprite(): Map<string, MapProp> {
  return new Map(mapProps("all").map((p) => [spriteIdOf(p), p]));
}
