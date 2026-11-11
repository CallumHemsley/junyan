import { describe, expect, it } from "vitest";
import { bakeSprite } from "../../kit/index.ts";
import { initialState, plantIds, type State } from "../../../features/garden/rules.ts";
import { projectGarden } from "../../../world/maps/rooftop/index.ts";
import sprites, { GARDEN_FOOTPRINTS, GARDEN_FRAMES, gardenFrame, gardenState, type Care } from "./rooftop-garden.ts";

const CARES: readonly Care[] = ["dry", "ready", "extra"];

/** The garden's state with one pot set to the given growth, droop and care. */
function withPot(id: (typeof plantIds)[number], growth: number, drooping: boolean, care: Care): State {
  const state = initialState();
  return { ...state, plants: { ...state.plants, [id]: { ...state.plants[id], growth, drooping, care } } };
}

describe("the rooftop garden's run-time sprites", () => {
  it("draws every plant the garden can grow, its shade and both crates", () => {
    for (const id of plantIds) expect(sprites[`rooftop/garden-${id}`], id).toBeDefined();
    for (const id of ["rooftop/garden-shade", "rooftop/garden-crate-a", "rooftop/garden-crate-b"]) expect(sprites[id], id).toBeDefined();
  });

  it("gives each pot one frame per state, in the order projectGarden's variant uses", () => {
    expect(GARDEN_FRAMES).toBe(24);
    for (const id of plantIds) {
      expect(sprites[`rooftop/garden-${id}`].frames, id).toBe(GARDEN_FRAMES);
      const seen = new Set<number>();
      for (let growth = 0; growth <= 3; growth++) for (const drooping of [false, true]) for (const care of CARES) {
        const pot = projectGarden(withPot(id, growth, drooping, care)).props.find((p) => p.id === `rooftop.garden-${id}`)!;
        expect(pot.variant, `${id} ${growth} ${drooping} ${care}`).toBe(gardenFrame(growth, drooping, care));
        expect(gardenState(pot.variant)).toEqual({ growth, drooping, care });
        seen.add(pot.variant);
      }
      // Every frame is some state, and no two states share a frame.
      expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: GARDEN_FRAMES }, (_, i) => i));
    }
  });

  it("pins the order: growth major, then upright before drooping, then dry, ready, extra", () => {
    expect([gardenFrame(0, false, "dry"), gardenFrame(0, false, "ready"), gardenFrame(0, false, "extra"), gardenFrame(0, true, "dry"), gardenFrame(1, false, "dry"), gardenFrame(3, true, "extra")]).toEqual([0, 1, 2, 3, 6, 23]);
  });

  it("sizes each sprite to its projected footprint, anchored on its bottom-centre", () => {
    const props = projectGarden(initialState()).props;
    const footprint = (id: string) => { const p = props.find((q) => q.id === `rooftop.${id}`)!; return { width: p.width, height: p.height }; };
    for (const id of plantIds) expect(footprint(`garden-${id}`)).toEqual(GARDEN_FOOTPRINTS.pot);
    expect(footprint("garden-shade")).toEqual(GARDEN_FOOTPRINTS.shade);
    expect(footprint("garden-crate-a")).toEqual(GARDEN_FOOTPRINTS["crate-a"]);
    expect(footprint("garden-crate-b")).toEqual(GARDEN_FOOTPRINTS["crate-b"]);
    for (const [id, def] of Object.entries(sprites)) {
      expect(def.anchor, id).toEqual([Math.round(def.w / 2), def.h - 1]);
      expect(bakeSprite(id, def).frames.every((f) => f.ink.some((v) => v !== 0)), id).toBe(true);
    }
  });

  it("shows growth: a grown plant covers more than a seedling", () => {
    for (const id of plantIds) {
      const baked = bakeSprite(id, sprites[`rooftop/garden-${id}`]);
      const ink = (frame: number) => baked.frames[frame].ink.reduce((n, v) => n + (v ? 1 : 0), 0);
      expect(ink(gardenFrame(3, false, "ready")), id).toBeGreaterThan(ink(gardenFrame(0, false, "ready")));
    }
  });
});
