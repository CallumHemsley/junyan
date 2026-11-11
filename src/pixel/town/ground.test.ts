import { describe, expect, it } from "vitest";
import { TOWN } from "./map.ts";
import { groundLayers } from "./ground.ts";
import { groundMaterials, tileSpan } from "./ground-grid.ts";
import grass from "../sprites/ground/grass.ts";
import paving from "../sprites/ground/paving.ts";
import road from "../sprites/ground/road.ts";
import brick from "../sprites/ground/brick.ts";
import stone from "../sprites/ground/stone.ts";
import water from "../sprites/ground/water.ts";
import edges from "../sprites/ground/edges.ts";

const known = new Set(Object.keys({ ...grass, ...paving, ...road, ...brick, ...stone, ...water, ...edges }));

describe("town ground", () => {
  it("rounds fractional rect edges to the nearest tile, halves outward, never to nothing", () => {
    expect(tileSpan(17.7, 10.3)).toEqual([18, 28]);
    expect(tileSpan(32.5, 3)).toEqual([32, 36]);
    expect(tileSpan(64.5, 0.5)).toEqual([64, 65]);
    expect(tileSpan(3, 0.2)).toEqual([3, 4]);
  });

  it("covers the whole map with every layer and only known ground sprites", () => {
    const layers = groundLayers();
    const { width, height } = TOWN.bounds;
    for (const layer of layers) {
      expect(layer.rows).toHaveLength(height);
      for (const row of layer.rows) expect(row).toHaveLength(width);
      for (const id of Object.values(layer.legend ?? {})) expect(known.has(id as string), `${layer.name}: ${id}`).toBe(true);
    }
  });

  it("fills every non-water cell with a base tile and draws water last", () => {
    const layers = groundLayers();
    const base = layers[0], waterLayer = layers.find((l) => l.name === "ground-water")!;
    const grid = groundMaterials();
    grid.forEach((row, y) => row.forEach((m, x) => {
      expect(base.rows[y][x] === ".", `base at ${x},${y}`).toBe(m === "water");
      expect(waterLayer.rows[y][x] !== ".", `water at ${x},${y}`).toBe(m === "water");
    }));
    const waterIndex = layers.indexOf(waterLayer);
    expect(layers.slice(waterIndex + 1).every((l) => l.name?.startsWith("ground-water-edge"))).toBe(true);
  });

  it("puts kerbs on the road and header courses where brick meets paving", () => {
    const ids = new Set(groundLayers().flatMap((l) => Object.values(l.legend ?? {}) as string[]));
    for (const id of ["ground/edge-kerb-n-a", "ground/edge-kerb-s-a", "ground/edge-header-n", "ground/edge-grass-n-a", "ground/edge-coping-e", "ground/edge-water-n", "ground/road-track-n", "ground/road-crown-s", "ground/edge-kerb-ne", "ground/paving-h", "ground/paving-d"])
      expect(ids.has(id), id).toBe(true);
  });

  it("is deterministic", () => {
    expect(groundLayers()).toEqual(groundLayers());
  });
});
