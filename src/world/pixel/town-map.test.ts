import { describe, expect, it, vi } from "vitest";
import town, { SHOPFRONT_KINDS } from "../../pixel/scenes/town.ts";
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

  it("draws one sprite per map prop, at its footprint's bottom-centre, on the map's layer", () => {
    const props = town.props ?? [];
    expect(props.map(p => p.id)).toEqual(map.props.map(p => p.id));
    for (const p of map.props) {
      const prop = props.find(q => q.id === p.id)!;
      expect(prop.sprite).toBe(townSpriteId(p.id));
      expect(prop.at).toEqual(townAnchor(p as Parameters<typeof townAnchor>[0]));
      expect(prop.solid).toBe(false);
      expect(prop.layer).toBe(p.layer === "ground" ? "floor" : "object");
    }
    expect(compiled.objects.length + compiled.over.length + compiled.floor.filter(f => !f.tile).length).toBe(map.props.length);
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

  it("lights the street lamps and shop windows at dusk only", () => {
    const lamps = map.props.filter(p => p.kind === "street-lamp");
    const glows = compiled.lights.filter(l => l.phases?.includes("night"));
    expect(glows.length).toBeGreaterThanOrEqual(lamps.length + 4);
    expect(compiled.lights.every(l => !l.phases?.includes("morning"))).toBe(true);
    const at = (phase: "morning" | "night") => renderToFrame(createSceneRenderer(liveTown, atlas), { x: 15 * TILE, y: 24 * TILE, w: 6 * TILE, h: 4 * TILE }, { time: 0, phase });
    // Under lamp-0 (18, 26.5) the night is lifted above the plain night ambient elsewhere.
    const lit = at("night"), px = (x: number, y: number) => lit.data[(y * lit.w + x) * 4];
    expect(px(3 * TILE, Math.round(1.5 * TILE))).toBeGreaterThan(px(0, 0));
  });

  it("walks the town on the screen's axes", () => {
    expect(isPixelMap("town")).toBe(true);
  });
});

describe("missing town art", () => {
  it("draws as placeholders: every prop, tile and town character resolves, and none falls back to the stand-in waiter", () => {
    expect(() => compileScene(liveTown, createAtlas(sprites))).toThrow(/unknown sprite/);
    for (const p of map.props) expect(atlas.find(townSpriteId(p.id))).toBeDefined();
    for (const sprite of ["char/courier", "critter/sparrow", "critter/pigeon", "char/lin-jie", "char/zhang-laoshi", "char/xiao-zhou", "char/player"]) {
      expect(resolveActorSprite(atlas, sprite, "walk", "down").sprite.id).not.toBe("ex/waiter");
    }
    // Real art wins over its placeholder.
    expect(atlas.get("char/lin-jie/walk-down").placeholder).toBeUndefined();
    // Boxes sit on the footprint.
    const restaurant = map.props.find(p => p.id === "town.restaurant")!;
    expect(townPlaceholder("town/restaurant")).toMatchObject({ w: restaurant.width * TILE, h: restaurant.height * TILE });
    expect(townPlaceholder("food/bun")).toBeNull();
  });

  it("lists each missing id once, in one batch", async () => {
    const report = vi.fn();
    const listed = createAtlas(sprites, townAtlasOptions(report));
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
  const boxes = placedById(compiled);

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
});
