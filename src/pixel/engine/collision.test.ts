import { describe, expect, it } from "vitest";
import { isFree, move } from "./collision.ts";
import type { Rect } from "./types.ts";

const wall: Rect = [5, 0, 1, 10];
const box: Rect = [2, 2, 2, 2];

describe("move", () => {
  it("moves freely in open space", () => {
    expect(move([1, 1], [0.5, 0.25], 0.25, [wall])).toEqual([1.5, 1.25]);
  });

  it("stops flush against a collider", () => {
    const [x] = move([4, 5], [2, 0], 0.25, [wall]);
    expect(x).toBeCloseTo(4.75);
  });

  it("slides along a wall when moving diagonally into it", () => {
    const [x, y] = move([4.75, 5], [0.5, 0.5], 0.25, [wall]);
    expect(x).toBeCloseTo(4.75);
    expect(y).toBeCloseTo(5.5);
  });

  it("slides along the top of a box", () => {
    const [x, y] = move([2.5, 1.75], [0.5, 0.5], 0.25, [box]);
    expect(x).toBeCloseTo(3);
    expect(y).toBeCloseTo(1.75);
  });

  it("never tunnels through a thin collider on a big step", () => {
    const [x] = move([0, 5], [20, 0], 0.25, [wall]);
    expect(x).toBeCloseTo(4.75);
  });

  it("lets something stuck inside walk out", () => {
    expect(move([5.5, 5], [1, 0], 0.25, [wall])[0]).toBeCloseTo(6.5);
  });

  it("supports different x and y half-extents", () => {
    const [, y] = move([2.5, 1], [0, 2], [0.25, 0.1], [box]);
    expect(y).toBeCloseTo(1.9);
  });

  it("stays inside the walkable rect", () => {
    expect(move([1, 1], [-5, 20], 0.25, [], [0, 0, 10, 8])).toEqual([0.25, 7.75]);
  });

  it("does not shove an outside mover further out", () => {
    expect(move([-1, 1], [-1, 0], 0.25, [], [0, 0, 10, 8])[0]).toBe(-1);
    expect(move([-1, 1], [0.5, 0], 0.25, [], [0, 0, 10, 8])[0]).toBe(-0.5);
  });
});

describe("isFree", () => {
  it("tests a box against colliders and the walkable rect", () => {
    expect(isFree([1, 1], 0.25, [box])).toBe(true);
    expect(isFree([2.1, 2.1], 0.25, [box])).toBe(false);
    expect(isFree([0.1, 1], 0.25, [], [0, 0, 4, 4])).toBe(false);
  });
});
