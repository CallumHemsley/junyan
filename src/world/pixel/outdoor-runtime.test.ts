import { describe, expect, it } from "vitest";
import { initialState } from "../../features/garden/rules";
import { projectGarden, rooftopMap } from "../maps/rooftop";
import { frameView, runtimeProps } from "./outdoor";

describe("runtime props on outdoor maps", () => {
  it("draws the garden's projected pots as rooftop sprites showing their state, and skips the map's own props", () => {
    const projected = projectGarden(initialState());
    const props = runtimeProps("rooftop", [...rooftopMap.props, ...projected.props]);
    expect(props.map((p) => p.id)).toEqual(projected.props.map((p) => p.id));
    const pot = props[0], source = projected.props[0];
    expect(pot.sprite).toBe(`rooftop/${source.id.slice("rooftop.".length)}`);
    expect(pot.at).toEqual([source.position.x + source.width / 2, source.position.y + source.height]);
    expect(pot.frame).toBe(source.variant);
    expect(props.every((p) => p.solid === false)).toBe(true);
  });

  it("picks a sprite for a projected prop's shape and state when one is drawn, and sorts a prop on its parent", () => {
    const at = { position: { x: 4, y: 4 }, layer: "object" };
    const props = runtimeProps("rooftop", [
      { id: "rooftop.bench", kind: "x", width: 3, height: 1.5, variant: 0, ...at },
      { id: "rooftop.bench.cup", kind: "x", width: 0.5, height: 0.5, variant: 0, ...at },
      { id: "rooftop.ghost", kind: "x", width: 1.5, height: 3, variant: "blocked", ...at },
      { id: "rooftop.sign", kind: "x", width: 1, height: 1, variant: "low", ...at },
    ], (id) => ["rooftop/bench-30x15", "rooftop/ghost-blocked-15x30", "rooftop/sign-low"].includes(id));
    expect(props.map((p) => p.sprite)).toEqual(["rooftop/bench-30x15", "rooftop/bench.cup", "rooftop/ghost-blocked-15x30", "rooftop/sign-low"]);
    expect(props[1].sortY).toBeCloseTo(5.5 + 0.01);
    expect(props[0].sortY).toBeUndefined();
    // Without an atlas check it is the plain id, as before.
    expect(runtimeProps("rooftop", [{ id: "rooftop.bench", kind: "x", width: 3, height: 1.5, variant: 0, ...at }])[0].sprite).toBe("rooftop/bench");
  });

  it("frames an activity's points in the visible area, zooming out by whole steps only when they do not fit", () => {
    const bay = [{ x: 13.5, y: 4, z: 0 }, { x: 22.5, y: 4, z: 0 }, { x: 13.5, y: 11.5, z: 0 }, { x: 22.5, y: 11.5, z: 1.7 }, { x: 17, y: 3, z: 3.2 }];
    // A wide desktop with a panel at the right: the bay fits at the usual zoom, centred in the free area.
    const wide = frameView(bay, { width: 2400, height: 1400 }, { x: 0, y: 0, width: 1900, height: 1250 }, 1, 2);
    expect(wide.zoom).toBe(2);
    // A narrower one where the scene's edge stops the camera short of centring it: zoom out rather than hide it.
    expect(frameView(bay, { width: 1440, height: 916 }, { x: 0, y: 0, width: 900, height: 780 }, 1, 2).zoom).toBe(1);
    // Never below 1, however small the view.
    expect(frameView(bay, { width: 10, height: 10 }, { x: 0, y: 0, width: 10, height: 10 }, 1, 2).zoom).toBe(1);
  });
});
