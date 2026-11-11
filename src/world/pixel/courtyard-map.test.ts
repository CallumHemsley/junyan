import { describe, expect, it } from "vitest";
import { compileScene, createAtlas, createSceneRenderer, renderToFrame, resolveActorSprite, type Rect } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import { sprites } from "../../pixel/registry.ts";
import { scenes } from "../../pixel/scenes/index.ts";
import { mapProps, propAnchor, propSpriteId, type RawProp } from "../../pixel/world/maps.ts";
import { shadeSpriteId } from "../../pixel/world/scene.ts";
import { townPlaceholder } from "../../pixel/town/placeholders.ts";
import { content } from "../../content";
import { createGame } from "../../game";
import { worldMaps } from "../registry";
import { createWorld } from "../state";
import { actorsFor } from "../life-bridge";
import { courtyardForCats } from "../maps/courtyard/habitat";
import { isPixelMap } from "./maps";
import { FADED, liveOutdoor, occluderFade, outdoorActors, outdoorAtlasOptions, outdoorPlayer, placedById } from "./outdoor";

const map = worldMaps.courtyard;
const scene = scenes.courtyard;
const live = liveOutdoor("courtyard");
const atlas = createAtlas(sprites, outdoorAtlasOptions());
const compiled = compileScene(live, atlas);
const rect = (r: Rect) => r.map(v => Math.round(v * 1e4) / 1e4).join(",");
/** The town kinds the courtyard shares, drawn by the town's generators. */
const SHARED = ["bench", "bicycle", "drain", "laundry", "planter", "stone-table"];

describe("the courtyard scene is the courtyard map", () => {
  it("is drawn by the pixel engine and walked on the screen's axes", () => {
    expect(isPixelMap("courtyard")).toBe(true);
    expect(live.actors).toBeUndefined();
    expect(live).toBe(liveOutdoor("courtyard"));
  });

  it("shares the map's size, colliders and walkable bounds; props never collide", () => {
    expect(scene.size).toEqual([map.bounds.width, map.bounds.height]);
    expect(compiled.colliders.map(rect).sort()).toEqual(map.colliders.map(({ rect: r }) => rect([r.x, r.y, r.width, r.height])).sort());
    const [x, y, w, h] = compiled.walkable;
    for (const r of map.walkable) {
      expect(r.x).toBeGreaterThanOrEqual(x);
      expect(r.y).toBeGreaterThanOrEqual(y);
      expect(r.x + r.width).toBeLessThanOrEqual(x + w + 1e-9);
      expect(r.y + r.height).toBeLessThanOrEqual(y + h + 1e-9);
    }
    expect(scene.layers[0].rows).toHaveLength(map.bounds.height);
  });

  it("draws one sprite per map prop at its footprint's bottom-centre; foreground props sort with people", () => {
    const props = scene.props ?? [];
    expect(props.filter(p => !p.optional).map(p => p.id)).toEqual(map.props.map(p => p.id));
    for (const p of map.props) {
      const prop = props.find(q => q.id === p.id)!;
      expect(prop.sprite).toBe(propSpriteId("courtyard", p.id));
      expect(prop.sprite.startsWith("courtyard/")).toBe(true);
      expect(prop.at).toEqual(propAnchor(p as RawProp));
      expect(prop.solid).toBe(false);
      expect(prop.layer).toBe(p.layer === "ground" ? "floor" : "object");
      expect(props.find(q => q.id === `${p.id}-shade`)?.sprite).toBe(shadeSpriteId("courtyard", p.id));
    }
    // Trees ship a floor shade; any shade that is drawn is placed too, exactly as the town test counts them.
    const shades = map.props.filter(p => atlas.has(shadeSpriteId("courtyard", p.id))).length;
    expect(compiled.objects.length + compiled.over.length + compiled.floor.filter(f => !f.tile).length).toBe(map.props.length + shades);
  });

  it("marks every exit, entrance, anchor and landmark where the map has it", () => {
    for (const e of map.exits) expect(compiled.marks[`exit/${e.id}`]).toEqual({ at: [e.rect.x, e.rect.y], size: [e.rect.width, e.rect.height] });
    for (const e of map.entrances) expect(compiled.marks[`entrance/${e.id}`].at).toEqual([e.position.x, e.position.y]);
    expect(compiled.marks["entrance/from-town"].facing).toBe("up");
    for (const a of map.anchors) expect(compiled.marks[`anchor/${a.id}`].at).toEqual([a.position.x, a.position.y]);
    for (const l of map.landmarks) expect(compiled.marks[`landmark/${l.id}`].at).toEqual([l.position.x, l.position.y]);
  });

  it("keeps its two-way path with the town through the moon gate", () => {
    const toTown = map.exits.find(e => e.id === "to-town")!;
    expect(worldMaps.town.entrances.some(e => e.id === toTown.targetEntranceId)).toBe(true);
    const fromTown = worldMaps.town.exits.find(e => e.targetMapId === "courtyard")!;
    expect(map.entrances.some(e => e.id === fromTown.targetEntranceId)).toBe(true);
    expect(compiled.marks[`entrance/${fromTown.targetEntranceId}`]).toBeDefined();
  });

  it("draws the kinds it shares with the town with the town's art, and everything else as placeholders, never throwing", () => {
    const shared = mapProps("courtyard", ...SHARED);
    expect(shared).toHaveLength(26);
    for (const p of shared) expect(atlas.has(propSpriteId("courtyard", p.id)), p.id).toBe(true);
    for (const p of map.props) expect(atlas.find(propSpriteId("courtyard", p.id)), p.id).toBeDefined();
    // A row house with no art yet is a box on its footprint.
    const home = map.props.find(p => p.id === "courtyard.central-home")!;
    expect(townPlaceholder("courtyard/central-home")).toMatchObject({ w: home.width * TILE, h: home.height * TILE, layer: "object" });
    // The whole courtyard renders.
    const renderer = createSceneRenderer(live, atlas);
    const frame = renderToFrame(renderer, { x: 0, y: 0, w: map.bounds.width * TILE, h: map.bounds.height * TILE }, { time: 0, phase: "morning" });
    expect(frame.data.some(v => v > 0)).toBe(true);
  }, 30_000);
});

describe("the courtyard cast from game state", () => {
  const game = createGame(content, 42);
  const world = { ...createWorld(worldMaps), mapId: "courtyard", position: { x: 23, y: 33.5 }, facing: "north" as const };
  const yard = courtyardForCats(map, game.neighbourhood!.cats, game.day);

  it("draws its cats, its aunt, its sparrows and the laundry neighbour, then the player", () => {
    const poses = actorsFor(yard, game, world, 4000, false);
    const kinds = new Set(poses.map(p => p.kind));
    expect(kinds.has("cat")).toBe(true);
    const actors = outdoorActors(poses, outdoorPlayer(world.position, world.facing, { walking: false, distance: 0 }));
    expect(actors.at(-1)).toMatchObject({ id: "player", sprite: "char/player", at: [23, 33.5], facing: "up" });
    const cats = actors.filter((_, i) => poses[i]?.kind === "cat");
    expect(cats.length).toBe(2);
    for (const cat of cats) expect(cat.sprite).toBe("critter/cat-tabby");
    for (const actor of actors) {
      expect(actor.sprite).toMatch(/^(char|critter)\//);
      expect(resolveActorSprite(atlas, actor.sprite, actor.action ?? "idle", actor.facing ?? "down").sprite.id).not.toBe("ex/waiter");
    }
  });
});

describe("walking behind the courtyard's tall things", () => {
  it("fades only occluders whose art covers the player", () => {
    const placed = placedById(compiled);
    for (const o of map.occluders) expect(placed.has(o.id), o.id).toBe(true);
    // The open lane: nothing fades.
    expect(occluderFade(placed, map.occluders, { x: 23, y: 31 })).toEqual({});
    // Behind the laundry line on the window court (north of it): its washing hangs over the player.
    expect(occluderFade(placed, map.occluders, { x: 34, y: 8.6 })).toEqual({ "courtyard.laundry-east": FADED });
    // In front of it (south of its line), the washing hangs behind the player.
    expect(occluderFade(placed, map.occluders, { x: 34, y: 11 })["courtyard.laundry-east"]).toBeUndefined();
  });
});
