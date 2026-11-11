import { describe, expect, it } from "vitest";
import { bakeFrame, compileScene, createAtlas, createSceneRenderer, hashFrame, renderToFrame, sceneSprites } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import { sprites } from "../../pixel/registry.ts";
import { liveOutdoor, outdoorAtlasOptions } from "./outdoor";
import { keptMaps, neighbourMaps } from "./prebake";

describe("prebaking the next maps", () => {
  it("knows each map's outdoor neighbours from the exits, both ways", () => {
    expect(neighbourMaps("restaurant")).toEqual(["town"]);
    expect(neighbourMaps("town")).toEqual(["courtyard", "park", "residential-hall", "riverbank", "workshop"]);
    expect(neighbourMaps("park")).toEqual(["courtyard", "riverbank", "town"]);
    expect(neighbourMaps("riverbank")).toEqual(["park", "town"]);
    // The reading room opens off the hall, so each bakes the other.
    expect(neighbourMaps("reading-room")).toContain("residential-hall");
    expect(neighbourMaps("residential-hall")).toContain("reading-room");
    expect(neighbourMaps("ward")).toEqual([]);
  });

  it("keeps one neighbourhood baked: the current outdoor map and its neighbours", () => {
    expect(keptMaps("restaurant")).toEqual(["town"]);
    expect(keptMaps("park")).toEqual(["courtyard", "park", "riverbank", "town"]);
    expect(keptMaps("riverbank")).toEqual(["park", "riverbank", "town"]);
    expect(keptMaps("ward")).toEqual([]);
  });

  it("renders a map byte-identically from pre-baked frames (worker bytes) and from lazy baking", () => {
    const scene = liveOutdoor("rooftop");
    const lazy = createSceneRenderer(scene, createAtlas(sprites, outdoorAtlasOptions()));
    const preAtlas = createAtlas(sprites, outdoorAtlasOptions());
    const pre = createSceneRenderer(scene, preAtlas);
    for (const sprite of sceneSprites(compileScene(scene, preAtlas))) for (let i = 0; i < sprite.frameCount; i++) sprite.adopt(i, bakeFrame(sprite.def, i));
    pre.warm();
    const view = { x: 0, y: 0, w: scene.size[0] * TILE, h: scene.size[1] * TILE };
    for (const phase of ["morning", "night"] as const) {
      expect(hashFrame(renderToFrame(pre, view, { time: 1234, phase }))).toBe(hashFrame(renderToFrame(lazy, view, { time: 1234, phase })));
    }
  }, 30_000);

  it("bakes a landscape tree crown to the same bytes frame by frame as all at once", () => {
    const atlas = createAtlas(sprites);
    const ids = atlas.ids().filter((id) => id.startsWith("park/") && /tree-\d+$/.test(id)).slice(0, 2);
    expect(ids.length).toBe(2);
    for (const id of ids) {
      const sprite = atlas.get(id);
      expect(sprite.frameCount).toBeGreaterThan(1);
      for (let i = 0; i < sprite.frameCount; i++) expect(bakeFrame(sprite.def, i)).toEqual(sprite.frame(i).data);
    }
  }, 30_000);
});
