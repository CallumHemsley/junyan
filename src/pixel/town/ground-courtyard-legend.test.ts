import { describe, expect, it } from "vitest";
import courtyardMap from "../../world/maps/courtyard/map.json" with { type: "json" };
import courtyard from "../sprites/ground/courtyard.ts";
import { COURTYARD_GROUND, courtyardGroundIds } from "./ground-courtyard-legend.ts";

describe("courtyard ground legend", () => {
  it("covers every terrain material in the courtyard map", () => {
    const materials = new Set((courtyardMap as { terrain: { material: string }[] }).terrain.map((t) => t.material));
    for (const m of materials) expect(COURTYARD_GROUND[m], m).toBeDefined();
  });

  it("refers only to sprites the courtyard file draws", () => {
    for (const id of courtyardGroundIds()) expect(id in courtyard, id).toBe(true);
  });

  it("draws four seamless-sized variants per material", () => {
    for (const spec of Object.values(COURTYARD_GROUND)) {
      expect(spec.base).toHaveLength(4);
      for (const [id] of spec.base) expect(courtyard[id as keyof typeof courtyard]).toMatchObject({ w: 32, h: 32, layer: "floor" });
    }
  });
});
