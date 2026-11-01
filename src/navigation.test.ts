import { describe, it, expect } from "vitest";
import { canStand, route } from "./navigation";
import { TABLES } from "./contracts";
describe("restaurant walking", () => {
  it("routes around furniture instead of through a table", () => {
    const path = route({ x: 3, y: 1 }, { x: 3, y: 6 });
    expect(path.length).toBeGreaterThan(0);
    expect(path.at(-1)).toEqual({ x: 3, y: 6 });
    expect(path.every(canStand)).toBe(true);
    expect(path.some((p) => Math.abs(p.x - 3) > 1)).toBe(true);
    let previous = { x: 3, y: 1 };
    for (const point of path) {
      const midpoint = {
        x: (previous.x + point.x) / 2,
        y: (previous.y + point.y) / 2,
      };
      expect(
        TABLES.every(
          (t) => Math.hypot(t.x - midpoint.x, t.y - midpoint.y) >= 1.05,
        ),
      ).toBe(true);
      previous = point;
    }
  });
  it("rejects tables, off-map and non-finite targets", () => {
    for (const target of [
      { x: 3, y: 4 },
      { x: 13, y: 4 },
      { x: NaN, y: 2 },
    ])
      expect(route({ x: 6, y: 1 }, target)).toEqual([]);
  });
  it("reaches each table interaction point from the kitchen", () => {
    for (const table of TABLES) {
      const target = { x: table.x, y: table.y + 1.3 };
      expect(route({ x: 6, y: 1 }, target).at(-1)).toEqual(target);
    }
  });
});
