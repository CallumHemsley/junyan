import { describe, expect, it } from "vitest";
import type { GlowLight } from "../engine/index.ts";
import { scenes } from "../scenes/index.ts";
import town from "../scenes/town.ts";
import type { OutdoorMap } from "./maps.ts";
import { LAMP_GLASS, compileOutdoorScene, outdoorScene, outdoorScenes, shadeSpriteId, signRect } from "./scene.ts";

const prop = (id: string, kind: string, x: number, y: number, width: number, height: number, layer?: string) =>
  ({ id: `lane.${id}`, kind, position: { x, y }, width, height, variant: 0, ...(layer ? { layer } : {}) });

/** A small made-up outdoor map: a shop, a lamp, a drain, a tree in the foreground, a stool with no layer. */
const LANE: OutdoorMap = {
  id: "lane",
  bounds: { width: 12, height: 8 },
  terrain: [{ id: "lane.road", rect: { x: 0, y: 5, width: 12, height: 3 }, material: "worn-stone" }],
  props: [
    prop("shop", "building-shop", 2, 0, 6, 4, "object"),
    prop("lamp", "street-lamp", 9, 4.6, 0.4, 0.4, "object"),
    prop("drain", "drain", 4, 6, 1, 0.4, "ground"),
    prop("tree", "courtyard-tree", 10, 6, 1.2, 1.2, "foreground"),
    prop("stool", "stool", 1, 6, 0.5, 0.5),
  ],
  exits: [{ id: "to-town", rect: { x: 0, y: 5, width: 0.5, height: 3 }, targetMapId: "town", kind: "path" }],
  entrances: [{ id: "from-town", position: { x: 1, y: 6.5 }, facing: "east" }],
  anchors: [{ id: "lane.bench", position: { x: 6, y: 6 } }],
  landmarks: [{ id: "lane.sign", kind: "sign", position: { x: 5, y: 4 } }],
  walkable: [{ x: 0.5, y: 4.5, width: 11, height: 3 }, { x: 3, y: 4, width: 2, height: 1 }],
  colliders: [{ id: "lane.shop", rect: { x: 2, y: 0, width: 6, height: 4 } }],
  occluders: [],
  npcHooks: [],
};

describe("the outdoor scene compiler", () => {
  const scene = compileOutdoorScene(LANE);

  it("takes the map's size, ground, colliders and walkable bounds", () => {
    expect(scene.id).toBe("lane");
    expect(scene.size).toEqual([12, 8]);
    expect(scene.background).toBe("ink");
    expect(scene.layers[0].rows).toHaveLength(8);
    expect(scene.layers[0].rows[0]).toHaveLength(12);
    expect(scene.blocked).toEqual([[2, 0, 6, 4]]);
    expect(scene.walkable).toEqual([0.5, 4, 11, 3.5]);
    expect(scene.actors).toBeUndefined();
  });

  it("puts one sprite per prop at its footprint's bottom-centre, ground props on the floor and the rest with people", () => {
    const visible = scene.props!.filter((p) => !p.optional);
    expect(visible.map((p) => [p.id, p.sprite, p.at, p.layer, p.solid])).toEqual([
      ["lane.shop", "lane/shop", [5, 4], "object", false],
      ["lane.lamp", "lane/lamp", [9.2, 5], "object", false],
      ["lane.drain", "lane/drain", [4.5, 6.4], "floor", false],
      ["lane.tree", "lane/tree", [10.6, 7.2], "object", false],
      ["lane.stool", "lane/stool", [1.25, 6.5], undefined, false],
    ]);
    const shades = scene.props!.filter((p) => p.optional);
    expect(shades.map((p) => p.sprite)).toEqual(visible.map((p) => `${p.sprite}-shade`));
    expect(shades.every((p) => p.layer === "floor" && !p.solid)).toBe(true);
    expect(shadeSpriteId("lane", "lane.tree")).toBe("lane/tree-shade");
  });

  it("lights lamps and shop windows at dusk only", () => {
    const lights = scene.lights!.filter((l): l is GlowLight => l.kind === "glow");
    expect(lights).toHaveLength(scene.lights!.length);
    expect(lights.find((l) => l.color === "gold4")!.at).toEqual([9.2, 5 - LAMP_GLASS]);
    // A six-tile shop front glows in two windows, a tile above the street.
    expect(lights.filter((l) => l.color === "orange3").map((l) => l.at)).toEqual([[3.5, 3], [6.5, 3]]);
    expect(lights.every((l) => l.phases?.join() === "evening,night")).toBe(true);
  });

  it("marks exits, entrances, anchors, landmarks and shop signs", () => {
    expect(scene.marks).toEqual({
      "exit/to-town": { at: [0, 5], size: [0.5, 3] },
      "entrance/from-town": { at: [1, 6.5], facing: "right" },
      "anchor/lane.bench": { at: [6, 6] },
      "landmark/lane.sign": { at: [5, 4] },
      "sign/lane.shop": { at: [signRect(LANE.props[0])[0], signRect(LANE.props[0])[1]], size: [4, 0.75] },
    });
  });
});

describe("registered outdoor scenes", () => {
  it("compiles each registered map once and lists it among the scenes", () => {
    expect(outdoorScene("courtyard")).toBe(outdoorScene("courtyard"));
    expect(town).toBe(outdoorScene("town"));
    expect(Object.keys(outdoorScenes())).toEqual(["town", "courtyard", "rooftop", "park", "riverbank", "workshop", "reading-room"]);
    expect(scenes.workshop).toBe(outdoorScene("workshop"));
    expect(scenes.rooftop).toBe(outdoorScene("rooftop"));
    expect(scenes.courtyard).toBe(outdoorScene("courtyard"));
    expect(scenes.town).toBe(town);
    expect(scenes.cafe.id).toBe("cafe");
  });
});
