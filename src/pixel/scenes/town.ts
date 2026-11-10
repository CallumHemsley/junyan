/**
 * The lane neighbourhood (弄堂) outside the breakfast shop, compiled from the town map
 * (`src/world/maps/town/map.json`, 80×64; map units are pixel tiles). Nothing is hand-copied: the
 * map moves and the scene follows.
 *
 * - Ground: `groundLayers()` (ticket 0163 owns it).
 * - Props: one sprite per map prop, `town/<id>` at the footprint's bottom-centre, visual only. The
 *   map's colliders are the scene's `blocked` rects and its walkable rects bound the scene, so the game's
 *   collision is exactly the map's.
 * - Lights: a pool under every street lamp and a glow at every shop window, evening and night.
 * - Marks: `exit/<id>` (areas), `entrance/<id>` (with facing), `anchor/<id>`, `landmark/<id>`, and
 *   `sign/<prop id>` boards on shopfronts where the DOM puts the shop's name.
 */
import { defineScene, type Facing, type GlowLight, type Layer, type Mark, type Prop, type Rect } from "../engine/index.ts";
import { groundLayers } from "../town/ground.ts";
import { TOWN, townAnchor, townSpriteId, type TownProp } from "../town/map.ts";

type MapRect = { x: number; y: number; width: number; height: number };
type MapFacing = "north" | "south" | "east" | "west";

const map = TOWN as typeof TOWN & {
  walkable: MapRect[];
  colliders: { id: string; rect: MapRect }[];
  entrances: { id: string; position: { x: number; y: number }; facing: MapFacing }[];
  anchors: { id: string; position: { x: number; y: number } }[];
};

const FACING: Record<MapFacing, Facing> = { north: "up", south: "down", east: "right", west: "left" };
const rectOf = (r: MapRect): Rect => [r.x, r.y, r.width, r.height];

/** Map layers are `object` or `ground`; ground props (mats, drains, gutters) lie flat under everyone. */
const layerOf = (p: TownProp): Layer | undefined => p.layer === "ground" ? "floor" : p.layer === "object" ? "object" : undefined;

/** Shopfronts: their windows glow at dusk and they carry a blank board for the DOM's shop name. */
export const SHOPFRONT_KINDS = ["building-restaurant", "building-tea", "building-workshop", "building-shop", "building-shutter"];
const LIT_KINDS = ["building-restaurant", "building-tea", "building-workshop", "building-shop"];
const DUSK = ["evening", "night"] as const;

/**
 * Where a shopfront's sign board is, in tiles: centred on the facade, up to four tiles wide, its
 * bottom 2.25 tiles above the street (just over a door) and three-quarters of a tile tall. Shopfront
 * art keeps this area a blank board.
 */
export function signRect(p: TownProp): Rect {
  const w = Math.min(4, Math.max(1, p.width - 2)), h = 0.75;
  return [p.position.x + (p.width - w) / 2, p.position.y + p.height - 2.25 - h, w, h];
}

function props(): Prop[] {
  return TOWN.props.map((p) => ({ id: p.id, sprite: townSpriteId(p.id), at: townAnchor(p), layer: layerOf(p), solid: false }));
}

function lights(): GlowLight[] {
  const lamps = TOWN.props.filter((p) => p.kind === "street-lamp").map((p): GlowLight => {
    const [x, y] = townAnchor(p);
    // The pool falls round the foot of the post; centred a little up it so the head glows too.
    return { kind: "glow", at: [x, y - 1], radius: 3.2, color: "gold4", strength: 0.6, aspect: 0.75, phases: DUSK };
  });
  const windows = TOWN.props.filter((p) => LIT_KINDS.includes(p.kind)).flatMap((p) => {
    // One warm glow per four tiles of frontage, a tile above the street.
    const count = Math.max(1, Math.round(p.width / 4)), y = p.position.y + p.height - 1;
    return Array.from({ length: count }, (_, i): GlowLight => ({
      kind: "glow", at: [p.position.x + (p.width * (i + 0.5)) / count, y], radius: 1.9, color: "orange3", strength: 0.45, flicker: 0.04, phases: DUSK,
    }));
  });
  return [...lamps, ...windows];
}

function marks(): Record<string, Mark> {
  const out: Record<string, Mark> = {};
  for (const e of TOWN.exits) out[`exit/${e.id}`] = { at: [e.rect.x, e.rect.y], size: [e.rect.width, e.rect.height] };
  for (const e of map.entrances) out[`entrance/${e.id}`] = { at: [e.position.x, e.position.y], facing: FACING[e.facing] };
  for (const a of map.anchors) out[`anchor/${a.id}`] = { at: [a.position.x, a.position.y] };
  for (const l of TOWN.landmarks) out[`landmark/${l.id}`] = { at: [l.position.x, l.position.y] };
  for (const p of TOWN.props) if (SHOPFRONT_KINDS.includes(p.kind)) {
    const [x, y, w, h] = signRect(p);
    out[`sign/${p.id}`] = { at: [x, y], size: [w, h] };
  }
  return out;
}

/** The bounding box of the map's walkable rects (movement itself uses the rects, in the game rules). */
function walkable(): Rect {
  const rects = map.walkable;
  const x0 = Math.min(...rects.map((r) => r.x)), y0 = Math.min(...rects.map((r) => r.y));
  const x1 = Math.max(...rects.map((r) => r.x + r.width)), y1 = Math.max(...rects.map((r) => r.y + r.height));
  return [x0, y0, x1 - x0, y1 - y0];
}

export default defineScene({
  id: "town",
  size: [TOWN.bounds.width, TOWN.bounds.height],
  background: "ink",
  layers: groundLayers(),
  props: props(),
  lights: lights(),
  blocked: map.colliders.map((c) => rectOf(c.rect)),
  walkable: walkable(),
  marks: marks(),
});
