import { describe, expect, it } from "vitest";
import rooftop from "../../world/maps/rooftop/map.json" with { type: "json" };
import park from "../../world/maps/landscape/park.json" with { type: "json" };
import riverbank from "../../world/maps/landscape/riverbank.json" with { type: "json" };
import { OUTDOOR_PIXEL_MAPS } from "../../world/pixel/maps.ts";
import { createAtlas } from "../engine/index.ts";
import { TILE } from "../kit/sprite.ts";
import { TOWN, footprintPx as townFootprint, openingsOn as townOpenings, townAnchor, townProps, townSpriteId } from "../town/map.ts";
import { groundLayers } from "../town/ground.ts";
import { MATERIALS, MATERIAL_ALIASES, groundMaterial, groundMaterials, type GroundMap } from "../town/ground-grid.ts";
import grass from "../sprites/ground/grass.ts";
import paving from "../sprites/ground/paving.ts";
import road from "../sprites/ground/road.ts";
import brick from "../sprites/ground/brick.ts";
import stone from "../sprites/ground/stone.ts";
import water from "../sprites/ground/water.ts";
import edges from "../sprites/ground/edges.ts";
import courtyardGround from "../sprites/ground/courtyard.ts";
import { treeSprites } from "../sprites/plant/trees.ts";
import {
  OUTDOOR_MAPS, OUTDOOR_MAP_IDS, footprintPx, mapProps, openingsOn, outdoorMap, propAnchor, propSpriteId, propsBySprite, spriteIdOf, type MapProp,
} from "./maps.ts";

const groundSprites = new Set(Object.keys({ ...grass, ...paving, ...road, ...brick, ...stone, ...water, ...edges, ...courtyardGround }));
/** Outdoor maps still on the old painter: their ground must already compile for the day they are registered. */
const LATER = [rooftop, park, riverbank] as unknown as (GroundMap & { id: string; props: { kind: string }[] })[];

describe("the outdoor map registry", () => {
  it("registers the game's outdoor pixel maps, the town first", () => {
    expect(OUTDOOR_MAP_IDS).toEqual(OUTDOOR_PIXEL_MAPS);
    expect(OUTDOOR_MAP_IDS[0]).toBe("town");
    expect(OUTDOOR_MAP_IDS).toContain("courtyard");
    expect(OUTDOOR_MAP_IDS).toContain("rooftop");
    for (const id of OUTDOOR_MAP_IDS) expect(outdoorMap(id).id).toBe(id);
    expect(() => outdoorMap("park")).toThrow(/No outdoor pixel map "park"/);
  });

  it("names a prop's sprite after its map, without the map's prefix", () => {
    expect(propSpriteId("town", "town.hedge-0")).toBe("town/hedge-0");
    expect(propSpriteId("courtyard", "courtyard.planter-3")).toBe("courtyard/planter-3");
    expect(propSpriteId("courtyard", "town.odd")).toBe("courtyard/town.odd");
    for (const p of TOWN.props) expect(propSpriteId("town", p.id)).toBe(townSpriteId(p.id));
  });

  it("tags props with their map, map by map in registry order, filtered by kind", () => {
    const benches = mapProps("all", "bench");
    expect(benches.map((p) => p.map)).toEqual([...benches.map((p) => p.map)].sort((a, b) => OUTDOOR_MAP_IDS.indexOf(a) - OUTDOOR_MAP_IDS.indexOf(b)));
    expect(new Set(benches.map((p) => p.map))).toEqual(new Set(["town", "courtyard", "rooftop"]));
    expect(mapProps("courtyard", "bench", "bicycle").map((p) => p.id)).toEqual(
      OUTDOOR_MAPS.courtyard.props.filter((p) => p.kind === "bench" || p.kind === "bicycle").map((p) => p.id));
    expect(mapProps(["courtyard", "town"], "stone-table").map((p) => p.map)).toEqual(["courtyard", "town"]);
    expect(mapProps("courtyard").length).toBe(OUTDOOR_MAPS.courtyard.props.length);
    // Stable objects, so generators see the same prop every time.
    expect(mapProps("town", "tree")[0]).toBe(mapProps("all", "tree")[0]);
    const first = mapProps("courtyard", "planter")[0];
    expect(first).toMatchObject({ ...OUTDOOR_MAPS.courtyard.props.find((p) => p.id === first.id), map: "courtyard" });
  });

  it("keeps the town's helpers as they were", () => {
    expect(townProps("tree").map((p) => p.id)).toEqual(TOWN.props.filter((p) => p.kind === "tree").map((p) => p.id));
    for (const p of TOWN.props) {
      expect(townAnchor(p)).toEqual([p.position.x + p.width / 2, p.position.y + p.height]);
      expect(townFootprint(p)).toEqual(footprintPx(p));
      expect(townOpenings(p)).toEqual(openingsOn("town", p));
    }
    const restaurant = TOWN.props.find((p) => p.id === "town.restaurant")!;
    expect(townOpenings(restaurant).some((o) => o.kind === "door")).toBe(true);
  });

  it("anchors on the footprint's bottom-centre and sizes it in whole art px", () => {
    const p = { id: "x.a", kind: "k", position: { x: 2, y: 3 }, width: 1.5, height: 0.2, variant: 0 };
    expect(propAnchor(p)).toEqual([2.75, 3.2]);
    expect(footprintPx(p)).toEqual({ w: 48, h: Math.round(0.2 * TILE) });
    expect(footprintPx({ ...p, width: 0.001, height: 0.001 })).toEqual({ w: 1, h: 1 });
  });

  it("finds each map's own openings on a footprint", () => {
    const yard = OUTDOOR_MAPS.courtyard;
    const gate = yard.props.find((p) => p.id === "courtyard.town-entry-gate")!;
    const toTown = yard.exits.find((e) => e.id === "to-town")!;
    expect(openingsOn("courtyard", gate)).toEqual([{ id: "to-town", kind: "path", x0: Math.round((toTown.rect.x - gate.position.x) * TILE), x1: Math.round((toTown.rect.x + toTown.rect.width - gate.position.x) * TILE) }]);
    // The same footprint finds nothing in the town.
    expect(openingsOn("town", gate).some((o) => o.id === "to-town")).toBe(false);
  });

  it("gives every prop of every map its own sprite id", () => {
    const all = mapProps("all");
    expect(propsBySprite().size).toBe(all.length);
    for (const p of all) expect(propsBySprite().get(spriteIdOf(p))).toBe(p);
  });
});

describe("ground for any outdoor map", () => {
  it("draws every outdoor map's materials with the ground tiles", () => {
    for (const map of [...OUTDOOR_MAP_IDS.map(outdoorMap), ...LATER]) for (const t of map.terrain)
      expect(groundMaterial(t.material), `${map.id}: ${t.material}`).not.toBeNull();
    for (const target of Object.values(MATERIAL_ALIASES)) expect(MATERIALS).toContain(target);
    expect(groundMaterial("lava")).toBeNull();
    expect(() => groundMaterials({ bounds: { width: 2, height: 2 }, terrain: [{ id: "x", rect: { x: 0, y: 0, width: 1, height: 1 }, material: "lava" }] })).toThrow(/unknown material "lava"/);
  });

  it("rasterises a map's aliased materials and covers it with known tiles only", () => {
    const yard = outdoorMap("courtyard");
    const grid = groundMaterials(yard);
    expect(grid).toHaveLength(yard.bounds.height);
    expect(grid[0]).toHaveLength(yard.bounds.width);
    // The west alley is brick paving; the cross passage worn stone; the planted ground moss.
    expect(grid[20][6]).toBe("brick");
    expect(grid[23][30]).toBe("paving");
    expect(grid[37][0]).toBe("grass");
    // The courtyard ships its own tile table (ticket 0178), so its layers use its own tiles.
    expect(Object.values(groundLayers(yard)[0].legend ?? {}).some((id) => String(id).startsWith("ground/moss-earth"))).toBe(true);
    for (const map of [yard, ...LATER]) {
      const layers = groundLayers(map);
      for (const layer of layers) {
        expect(layer.rows, `${map.id} ${layer.name}`).toHaveLength(map.bounds.height);
        for (const row of layer.rows) expect(row).toHaveLength(map.bounds.width);
        for (const id of Object.values(layer.legend ?? {})) expect(groundSprites.has(id as string), `${map.id} ${layer.name}: ${id}`).toBe(true);
      }
    }
  });

  it("keeps the town's ground the default", () => {
    expect(groundLayers()).toEqual(groundLayers(TOWN));
  });
});

describe("shared kinds on new maps", () => {
  it("draws a tree it does not know as a plain, deterministic plane instead of throwing", () => {
    const tree: MapProp = { id: "elsewhere.new-plane", kind: "tree", position: { x: 4, y: 6 }, width: 1.2, height: 1.2, variant: 0, map: "elsewhere" };
    const atlas = () => createAtlas(treeSprites([tree]));
    const a = atlas().get("elsewhere/new-plane"), b = atlas().get("elsewhere/new-plane");
    expect(a.frameCount).toBe(4);
    expect(a.frame(0).data).toEqual(b.frame(0).data);
    expect(a.frame(0).data.some((v) => v > 0)).toBe(true);
    expect(atlas().get("elsewhere/new-plane-shade").h).toBeGreaterThan(0);
    // Every tree in the later maps draws.
    const later = (LATER as unknown as { id: string; props: Omit<MapProp, "map">[] }[]).flatMap((m) => m.props.filter((p) => p.kind === "tree").slice(0, 3).map((p) => ({ ...p, map: m.id })));
    expect(later.length).toBeGreaterThan(0);
    expect(() => { const set = createAtlas(treeSprites(later)); for (const p of later) set.get(spriteIdOf(p)).frame(0); }).not.toThrow();
  }, 30_000);
});
