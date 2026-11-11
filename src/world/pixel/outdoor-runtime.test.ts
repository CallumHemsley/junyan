import { describe, expect, it } from "vitest";
import { initialState } from "../../features/garden/rules";
import { projectGarden, rooftopMap } from "../maps/rooftop";
import { runtimeProps } from "./outdoor";

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
});
