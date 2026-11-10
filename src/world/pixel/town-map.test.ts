import { describe, expect, it, vi } from "vitest";
import town, { LAMP_GLASS, SHOPFRONT_KINDS, shadeSpriteId } from "../../pixel/scenes/town.ts";
import { compileScene, createAtlas, createSceneRenderer, renderToFrame, resolveActorSprite, type Rect } from "../../pixel/engine/index.ts";
import { TILE, type SpriteDef } from "../../pixel/kit/index.ts";
import { sprites } from "../../pixel/registry.ts";
import { townAnchor, townSpriteId } from "../../pixel/town/map.ts";
import { townPlaceholder } from "../../pixel/town/placeholders.ts";
import { content } from "../../content";
import { createGame } from "../../game";
import { worldMaps } from "../registry";
import { createWorld } from "../state";
import { actorsFor } from "../life-bridge";
import type { ActorPose } from "../life";
import { isPixelMap } from "./maps";
import { FADED, birdSprite, lifeActor, liveTown, occluderFade, placedById, townActors, townAtlasOptions, townPhase, townPlayer } from "./town";

const map = worldMaps.town;
const atlas = createAtlas(sprites, townAtlasOptions());
const compiled = compileScene(liveTown, atlas);
const rect = (r: Rect) => r.map(v => Math.round(v * 1e4) / 1e4).join(",");

describe("the town scene is the town map", () => {
  it("shares the map's size, colliders and walkable bounds; props never collide", () => {
    expect(town.size).toEqual([map.bounds.width, map.bounds.height]);
    expect(compiled.colliders.map(rect).sort()).toEqual(map.colliders.map(({ rect: r }) => rect([r.x, r.y, r.width, r.height])).sort());
    const [x, y, w, h] = compiled.walkable;
    for (const r of map.walkable) {
      expect(r.x).toBeGreaterThanOrEqual(x);
      expect(r.y).toBeGreaterThanOrEqual(y);
      expect(r.x + r.width).toBeLessThanOrEqual(x + w + 1e-9);
      expect(r.y + r.height).toBeLessThanOrEqual(y + h + 1e-9);
    }
  });

  it("draws one sprite per map prop, at its footprint's bottom-centre, on the map's layer, with its optional shade under it", () => {
    const props = town.props ?? [];
    expect(props.filter(p => !p.optional).map(p => p.id)).toEqual(map.props.map(p => p.id));
    for (const p of map.props) {
      const prop = props.find(q => q.id === p.id)!, anchor = townAnchor(p as Parameters<typeof townAnchor>[0]);
      expect(prop.sprite).toBe(townSpriteId(p.id));
      expect(prop.at).toEqual(anchor);
      expect(prop.solid).toBe(false);
      expect(prop.layer).toBe(p.layer === "ground" ? "floor" : "object");
      expect(props.find(q => q.id === `${p.id}-shade`)).toEqual({ id: `${p.id}-shade`, sprite: shadeSpriteId(p.id), at: anchor, layer: "floor", solid: false, optional: true });
    }
    // Shades are drawn only where their art exists.
    const shades = map.props.filter(p => atlas.has(shadeSpriteId(p.id))).length;
    expect(compiled.objects.length + compiled.over.length + compiled.floor.filter(f => !f.tile).length).toBe(map.props.length + shades);
    const withShade = compileScene(liveTown, createAtlas({ ...sprites, "town/junction-shade": { w: 8, h: 4, layer: "floor", draw: p => p.rect(0, 0, 8, 4, "leaf1") } }, townAtlasOptions()));
    expect(withShade.floor.some(f => f.prop?.id === "town.junction-shade")).toBe(true);
  });

  it("marks every exit, entrance, anchor and landmark where the map has it, and a sign on every shopfront", () => {
    for (const e of map.exits) expect(compiled.marks[`exit/${e.id}`]).toEqual({ at: [e.rect.x, e.rect.y], size: [e.rect.width, e.rect.height] });
    for (const e of map.entrances) expect(compiled.marks[`entrance/${e.id}`].at).toEqual([e.position.x, e.position.y]);
    expect(compiled.marks["entrance/from-park"].facing).toBe("right");
    for (const a of map.anchors) expect(compiled.marks[`anchor/${a.id}`].at).toEqual([a.position.x, a.position.y]);
    for (const l of map.landmarks) expect(compiled.marks[`landmark/${l.id}`].at).toEqual([l.position.x, l.position.y]);
    const shops = map.props.filter(p => SHOPFRONT_KINDS.includes(p.kind));
    expect(shops.length).toBeGreaterThan(5);
    for (const p of shops) {
      const sign = compiled.marks[`sign/${p.id}`];
      expect(sign.size).toBeDefined();
      // On the facade, inside the footprint.
      expect(sign.at[0]).toBeGreaterThanOrEqual(p.position.x);
      expect(sign.at[0] + sign.size![0]).toBeLessThanOrEqual(p.position.x + p.width);
      expect(sign.at[1]).toBeGreaterThanOrEqual(p.position.y);
      expect(sign.at[1] + sign.size![1]).toBeLessThanOrEqual(p.position.y + p.height);
    }
    expect(Object.keys(compiled.marks).filter(k => k.startsWith("sign/")).length).toBe(shops.length);
  });

  it("lights the street lamps' glass and the shop windows at dusk only", () => {
    const lamps = map.props.filter(p => p.kind === "street-lamp");
    const glows = compiled.lights.filter(l => l.phases?.includes("night"));
    expect(glows.length).toBeGreaterThanOrEqual(lamps.length + 4);
    expect(compiled.lights.every(l => !l.phases?.includes("morning"))).toBe(true);
    for (const lamp of lamps) {
      const [x, y] = townAnchor(lamp as Parameters<typeof townAnchor>[0]);
      expect(town.lights!.some(l => l.kind === "glow" && l.at[0] === x && Math.abs(l.at[1] - (y - LAMP_GLASS)) < 1e-9)).toBe(true);
    }
    // At night lamp-0's glass (18.175, 26.85 − 2.9) lifts the picture round it above the same night unlit.
    const view = { x: 16 * TILE, y: 22 * TILE, w: 4 * TILE, h: 4 * TILE };
    const withLights = createSceneRenderer(liveTown, atlas), without = createSceneRenderer({ ...liveTown, lights: [] }, atlas);
    const pixel = (renderer: typeof withLights, phase: "morning" | "night") => {
      const frame = renderToFrame(renderer, view, { time: 0, phase });
      const i = (Math.round(2 * TILE) * view.w + Math.round(2.2 * TILE)) * 4;
      return frame.data[i] + frame.data[i + 1];
    };
    expect(pixel(withLights, "night")).toBeGreaterThan(pixel(without, "night") + 20);
    expect(pixel(withLights, "morning")).toBe(pixel(without, "morning"));
  }, 30_000);

  it("keeps parked bicycles off the canal and the south hedge clear of the fig's base", () => {
    const box = (p: { position: { x: number; y: number }; width: number; height: number }) => ({ x: p.position.x, y: p.position.y, width: p.width, height: p.height });
    const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    const water = map.terrain.filter(t => t.material === "water").map(t => t.rect);
    for (const bike of map.props.filter(p => p.kind === "bicycle")) for (const w of water) expect(overlaps(box(bike), w), bike.id).toBe(false);
    const hedge = map.props.find(p => p.id === "town.hedge-6")!, fig = map.props.find(p => p.id === "town.south-fig")!;
    expect(overlaps(box(hedge), box(fig))).toBe(false);
  });

  it("folds every open door leaf against its jamb, clear of the doorway", () => {
    const leaves = map.props.filter(p => p.kind === "open-door-leaf");
    expect(leaves.length).toBe(3);
    for (const leaf of leaves) {
      const exit = map.exits.find(e => e.kind === "door" && Math.abs(e.rect.y - leaf.position.y) < 1.5 && Math.abs(e.rect.x - leaf.position.x) < 1)!;
      expect(exit, leaf.id).toBeDefined();
      expect(leaf.position.x + leaf.width, leaf.id).toBeLessThanOrEqual(exit.rect.x);
    }
  });

  it("walks the town on the screen's axes", () => {
    expect(isPixelMap("town")).toBe(true);
  });
});

describe("missing town art", () => {
  // Today's sprites without the town's own art, as before the parallel workers landed it.
  const pending = (id: string) => /^(town|ground|critter)\//.test(id) || id.startsWith("char/courier/");
  const bare = Object.fromEntries(Object.entries(sprites).filter(([id]) => !pending(id)));
  const placeholderAtlas = createAtlas(bare, townAtlasOptions());

  it("draws as placeholders: every prop, tile and town character resolves, and none falls back to the stand-in waiter", () => {
    expect(() => compileScene(liveTown, createAtlas(bare))).toThrow(/unknown sprite/);
    const boxes = compileScene(liveTown, placeholderAtlas);
    expect(boxes.floor.filter(f => f.tile).every(f => f.sprite.placeholder)).toBe(true);
    for (const p of map.props) expect(placeholderAtlas.find(townSpriteId(p.id))?.placeholder).toBe(true);
    // Shades never become placeholders.
    expect([...boxes.floor, ...boxes.objects].some(f => f.prop?.optional)).toBe(false);
    for (const sprite of ["char/courier", "critter/sparrow", "critter/pigeon", "char/lin-jie", "char/zhang-laoshi", "char/xiao-zhou", "char/player"]) {
      expect(resolveActorSprite(placeholderAtlas, sprite, "walk", "down").sprite.id).not.toBe("ex/waiter");
    }
    // Real art wins over its placeholder.
    expect(placeholderAtlas.get("char/lin-jie/walk-down").placeholder).toBeUndefined();
    expect(atlas.get("town/restaurant").placeholder).toBeUndefined();
    // Boxes sit on the footprint.
    const restaurant = map.props.find(p => p.id === "town.restaurant")!;
    expect(townPlaceholder("town/restaurant")).toMatchObject({ w: restaurant.width * TILE, h: restaurant.height * TILE });
    expect(townPlaceholder("food/bun")).toBeNull();
  });

  it("lists each missing id once, in one batch", async () => {
    const report = vi.fn();
    const listed = createAtlas(bare, townAtlasOptions(report));
    compileScene(liveTown, listed);
    compileScene(liveTown, listed);
    await Promise.resolve();
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0]).toMatch(/placeholder boxes: .*town\/restaurant/);
  });
});

describe("the town cast from game state", () => {
  const pose = (extra: Partial<ActorPose>): ActorPose => ({ id: "town.x", characterId: "lin-jie", kind: "resident", position: { x: 3, y: 4 }, facing: "south", action: "idle", activity: "idle", phaseMs: 0, radius: .22, ...extra });

  it("maps regulars, the courier and the birds to their sprites", () => {
    expect(lifeActor(pose({}))).toMatchObject({ id: "life/town.x", sprite: "char/lin-jie", at: [3, 4], facing: "down", action: "idle" });
    expect(lifeActor(pose({ characterId: "resident-courier", action: "walk", facing: "west" }))).toMatchObject({ sprite: "char/courier", action: "walk", facing: "left" });
    expect(lifeActor(pose({ characterId: "zhang-laoshi", activity: "sit" })).action).toBe("sit");
    const bird = pose({ id: "town.canal-birds", characterId: "bird", kind: "bird", facing: "north", yaw: Math.PI });
    expect(lifeActor(bird)).toMatchObject({ sprite: "critter/pigeon", facing: "left", action: "idle" });
    expect(lifeActor({ ...bird, action: "walk" }).action).toBe("hop");
    expect(lifeActor({ ...bird, activity: "startle" }).action).toBe("fly");
    expect(lifeActor({ ...bird, phaseMs: 1600 }).action).toBe("peck");
    expect(birdSprite("town.park-birds")).toBe("critter/sparrow");
  });

  it("draws everyone life places in the town, then the player", () => {
    const game = createGame(content, 42);
    const world = { ...createWorld(worldMaps), mapId: "town", position: { x: 34, y: 32 }, facing: "south" as const };
    const poses = actorsFor(map, game, world, 4000, false);
    expect(poses.length).toBeGreaterThan(0);
    const player = townPlayer(world.position, world.facing, { walking: true, distance: 2 });
    const actors = townActors(poses, player);
    expect(actors.at(-1)).toMatchObject({ id: "player", sprite: "char/player", at: [34, 32], facing: "down", action: "walk", distance: 2 });
    expect(actors.slice(0, -1).map(a => a.at)).toEqual(poses.map(p => [p.position.x, p.position.y]));
    for (const actor of actors) expect(actor.sprite).toMatch(/^(char|critter)\//);
  });

  it("follows the day's light", () => {
    expect(townPhase(0)).toBe("morning");
    expect(["midday", "evening", "night"]).toContain(townPhase(99));
  });
});

describe("walking behind tall things", () => {
  // A stand-in canopy for the junction tree (footprint 1.5×1.5 at 18, 28.2): 48×160 art px rising from its footprint.
  const canopy: SpriteDef = { w: 48, h: 160, anchor: [24, 159], draw: p => p.rect(0, 0, 48, 160, "leaf2") };
  const tall = placedById(compileScene(liveTown, createAtlas({ ...sprites, "town/junction": canopy }, townAtlasOptions())));
  const pending = (id: string) => /^(town|ground)\//.test(id);
  const boxes = placedById(compileScene(liveTown, createAtlas(Object.fromEntries(Object.entries(sprites).filter(([id]) => !pending(id))), townAtlasOptions())));
  const real = placedById(compiled);

  it("fades a canopy the player stands behind, never one the player stands in front of or beside", () => {
    expect(occluderFade(tall, map.occluders, { x: 18.75, y: 27.4 })).toMatchObject({ "town.junction": FADED });
    expect(occluderFade(tall, map.occluders, { x: 18.75, y: 30.5 })["town.junction"]).toBeUndefined();
    expect(occluderFade(tall, map.occluders, { x: 23, y: 27.4 })["town.junction"]).toBeUndefined();
  });

  it("ignores occluders not marked to fade, and art that does not rise over the player", () => {
    expect(occluderFade(tall, map.occluders.map(o => ({ ...o, fadeWhenPlayerBehind: false })), { x: 18.75, y: 27.4 })).toEqual({});
    // A placeholder box only covers its footprint, which the player cannot be behind and inside at once.
    expect(occluderFade(boxes, map.occluders, { x: 18.75, y: 27.4 })).toEqual({});
  });

  it("fades the drawn junction tree's crown while the player is behind it", () => {
    expect(occluderFade(real, map.occluders, { x: 18.75, y: 27.4 })).toMatchObject({ "town.junction": FADED });
    expect(occluderFade(real, map.occluders, { x: 18.75, y: 30.6 })["town.junction"]).toBeUndefined();
  });
});
