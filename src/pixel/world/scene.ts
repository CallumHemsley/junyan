/**
 * An outdoor map compiled into a pixel scene (the town since ticket 0174, any registered outdoor map
 * since 0176). Nothing is hand-copied: the map moves and the scene follows.
 *
 * - Ground: `groundLayers(map)`.
 * - Props: one sprite per map prop, `<map>/<id>` at the footprint's bottom-centre, visual only, under it
 *   its optional floor shade `<map>/<id>-shade` when that sprite exists (trees). Map layer `ground` lies
 *   on the floor; `object` and `foreground` sort with people. The map's colliders are the scene's
 *   `blocked` rects and its walkable rects bound the scene, so the game's collision is exactly the map's.
 * - Lights: a glow on every street lamp's glass and at every shop window, evening and night.
 * - Marks: `exit/<id>` (areas), `entrance/<id>` (with facing), `anchor/<id>`, `landmark/<id>`, and
 *   `sign/<prop id>` boards on shopfronts where the DOM puts the shop's name.
 */
import type { Facing, GlowLight, Layer, Mark, Prop, Rect, Scene } from "../engine/index.ts";
import { groundLayers } from "../town/ground.ts";
import { OUTDOOR_MAP_IDS, outdoorMap, propAnchor, propSpriteId, type MapFacing, type MapRect, type OutdoorMap, type RawProp } from "./maps.ts";
import { LIGHTS as WORKSHOP_LIGHTS } from "../sprites/life/workshop.ts";
import { LAMP_LIGHT as READING_LIGHTS } from "../sprites/life/reading-room.ts";

const FACING: Record<MapFacing, Facing> = { north: "up", south: "down", east: "right", west: "left" };
const rectOf = (r: MapRect): Rect => [r.x, r.y, r.width, r.height];

/** Map layers: `ground` props (mats, drains, gutters) lie flat under everyone; the rest sort with people. */
const layerOf = (p: RawProp): Layer | undefined =>
  p.layer === "ground" ? "floor" : p.layer === "object" || p.layer === "foreground" ? "object" : undefined;

/** Shopfronts: their windows glow at dusk and they carry a blank board for the DOM's shop name. */
export const SHOPFRONT_KINDS = ["building-restaurant", "building-tea", "building-workshop", "building-shop", "building-shutter"];
const LIT_KINDS = ["building-restaurant", "building-tea", "building-workshop", "building-shop"];
const DUSK = ["evening", "night"] as const;
/** Height of a street lamp's glass above its anchor, tiles. */
export const LAMP_GLASS = 2.9;

/**
 * Where a shopfront's sign board is, in tiles: centred on the facade, up to four tiles wide, its
 * bottom 2.25 tiles above the street (just over a door) and three-quarters of a tile tall. Shopfront
 * art keeps this area a blank board.
 */
export function signRect(p: RawProp): Rect {
  const w = Math.min(4, Math.max(1, p.width - 2)), h = 0.75;
  return [p.position.x + (p.width - w) / 2, p.position.y + p.height - 2.25 - h, w, h];
}

/** A prop's optional ground shade (`<map>/<id>-shade`, trees ship one), on the floor at the same anchor. */
export const shadeSpriteId = (mapId: string, propId: string) => `${propSpriteId(mapId, propId)}-shade`;

/**
 * A mat lying on something (the hall bench's cushion) sorts just in front of it, so the bench never
 * hides it: the object prop whose footprint holds the mat's.
 */
function restsOn(map: OutdoorMap, p: RawProp): number | undefined {
  if (p.kind !== "mat" || p.layer === "ground") return undefined;
  const host = map.props.find((o) => o !== p && o.kind !== "mat" && o.layer !== "ground"
    && o.position.x <= p.position.x && o.position.y <= p.position.y
    && o.position.x + o.width >= p.position.x + p.width && o.position.y + o.height >= p.position.y + p.height);
  return host ? propAnchor(host)[1] + 1 / 32 : undefined;
}

function props(map: OutdoorMap): Prop[] {
  return map.props.flatMap((p): Prop[] => {
    const sortY = restsOn(map, p);
    return [
      { id: `${p.id}-shade`, sprite: shadeSpriteId(map.id, p.id), at: propAnchor(p), layer: "floor", solid: false, optional: true },
      { id: p.id, sprite: propSpriteId(map.id, p.id), at: propAnchor(p), layer: layerOf(p), solid: false, ...(sortY !== undefined ? { sortY } : {}) },
    ];
  });
}

/**
 * Lamps in the residential hall and the apartment: the hall's hanging lantern, the flat's wall sconce
 * and reading lamp. Each glows where its light is drawn, this many tiles above the prop's anchor.
 */
const RESIDENTIAL_LIGHTS: Readonly<Record<string, { height: number; radius: number; strength: number }>> = {
  "residential-hall/lantern": { height: 2.2, radius: 3, strength: 0.55 },
  "apartment/lantern": { height: 1.25, radius: 1.9, strength: 0.5 },
  "apartment/lamp": { height: 0.6, radius: 2.2, strength: 0.45 },
};

/** Lamps inside a map, at the points its art publishes (bulb or dial, tile units): lit all day. */
function interiorLights(map: OutdoorMap): GlowLight[] {
  if (map.id === "residential-hall" || map.id === "apartment") return map.props.flatMap((p): GlowLight[] => {
    const spec = RESIDENTIAL_LIGHTS[`${map.id}/${p.kind}`];
    if (!spec) return [];
    const [x, y] = propAnchor(p);
    return [{ kind: "glow", at: [x, y - spec.height], radius: spec.radius, color: "gold4", strength: spec.strength, flicker: 0.02 }];
  });
  if (map.id === "workshop") return Object.entries(WORKSHOP_LIGHTS).map(([id, at]): GlowLight => id.endsWith("radio")
    ? { kind: "glow", at, radius: 1.2, color: "orange3", strength: 0.35, flicker: 0.03 }
    : { kind: "glow", at, radius: 2.6, color: "gold4", strength: 0.55, flicker: 0.02 });
  // The reading room's green-shaded standard lamp throws a warm pool round the desk.
  if (map.id === "reading-room") return Object.values(READING_LIGHTS).map((at): GlowLight => ({ kind: "glow", at, radius: 3, color: "gold4", strength: 0.5, flicker: 0.02 }));
  return [];
}

function lights(map: OutdoorMap): GlowLight[] {
  const lamps = map.props.filter((p) => p.kind === "street-lamp").map((p): GlowLight => {
    const [x, y] = propAnchor(p);
    // On the lamp's glass, about three tiles above its foot (art y 19–32 of the 120 px lamp).
    return { kind: "glow", at: [x, y - LAMP_GLASS], radius: 3.4, color: "gold4", strength: 0.6, aspect: 0.8, phases: DUSK };
  });
  const windows = map.props.filter((p) => LIT_KINDS.includes(p.kind)).flatMap((p) => {
    // One warm glow per four tiles of frontage, a tile above the street.
    const count = Math.max(1, Math.round(p.width / 4)), y = p.position.y + p.height - 1;
    return Array.from({ length: count }, (_, i): GlowLight => ({
      kind: "glow", at: [p.position.x + (p.width * (i + 0.5)) / count, y], radius: 1.9, color: "orange3", strength: 0.45, flicker: 0.04, phases: DUSK,
    }));
  });
  return [...lamps, ...windows, ...interiorLights(map)];
}

function marks(map: OutdoorMap): Record<string, Mark> {
  const out: Record<string, Mark> = {};
  for (const e of map.exits) out[`exit/${e.id}`] = { at: [e.rect.x, e.rect.y], size: [e.rect.width, e.rect.height] };
  for (const e of map.entrances) out[`entrance/${e.id}`] = { at: [e.position.x, e.position.y], facing: FACING[e.facing] };
  for (const a of map.anchors) out[`anchor/${a.id}`] = { at: [a.position.x, a.position.y] };
  for (const l of map.landmarks) out[`landmark/${l.id}`] = { at: [l.position.x, l.position.y] };
  for (const p of map.props) if (SHOPFRONT_KINDS.includes(p.kind)) {
    const [x, y, w, h] = signRect(p);
    out[`sign/${p.id}`] = { at: [x, y], size: [w, h] };
  }
  return out;
}

/** The bounding box of the map's walkable rects (movement itself uses the rects, in the game rules). */
function walkable(map: OutdoorMap): Rect {
  const rects = map.walkable;
  const x0 = Math.min(...rects.map((r) => r.x)), y0 = Math.min(...rects.map((r) => r.y));
  const x1 = Math.max(...rects.map((r) => r.x + r.width)), y1 = Math.max(...rects.map((r) => r.y + r.height));
  return [x0, y0, x1 - x0, y1 - y0];
}

/** Compile an outdoor map into a scene (no cast: the game or the harness supplies actors). */
export function compileOutdoorScene(map: OutdoorMap): Scene {
  return {
    id: map.id,
    size: [map.bounds.width, map.bounds.height],
    background: "ink",
    layers: groundLayers(map),
    props: props(map),
    lights: lights(map),
    blocked: map.colliders.map((c) => rectOf(c.rect)),
    walkable: walkable(map),
    marks: marks(map),
  };
}

const compiled = new Map<string, Scene>();
/** A registered outdoor map's scene, compiled once. */
export function outdoorScene(mapId: string): Scene {
  let scene = compiled.get(mapId);
  if (!scene) compiled.set(mapId, scene = compileOutdoorScene(outdoorMap(mapId)));
  return scene;
}

/** Every registered outdoor map's scene, by id. */
export const outdoorScenes = (): Record<string, Scene> => Object.fromEntries(OUTDOOR_MAP_IDS.map((id) => [id, outdoorScene(id)]));
