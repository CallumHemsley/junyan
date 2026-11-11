import { describe, expect, it } from "vitest";
import { footprint, itemIds, type State } from "../../features/apartment/rules";
import { furnitureProps, furnitureWorldRect } from "../../features/apartment/world";
import { mapsForNeighbourhood } from "../dynamic";
import { createGame } from "../../game";
import { content } from "../../content";
import { runtimeProps } from "./outdoor";
import apartment from "../maps/residential/apartment.json";
import residentialSprites from "../../pixel/sprites/life/residential";

// Every furnishing the player can own draws in the pixel apartment (ticket 0202): the closed PR #44
// found the blue vase, large basket and small lamp blocking the floor with no picture.
const placed = (id: State["placements"][number]["id"], x: number, y: number, rotation: 0 | 1 = 0) => ({ id, x, y, rotation });

describe("owned furnishings in the pixel apartment", () => {
  it("projects each placement as a prop on its cells, with its colour scheme as the frame", () => {
    const state = { placements: [placed("bed", 0, 0), placed("table", 2, 0, 1), placed("rug", 3, 1)], colour: "cream", rugSize: "large" } as unknown as State;
    const props = furnitureProps(state);
    expect(props.map((p) => p.id)).toEqual(["apartment.furniture.bed.r0", "apartment.furniture.table.r1", "apartment.furniture.rug.large-r0"]);
    for (const [i, p] of props.entries()) expect({ ...p.position, width: p.width, height: p.height }).toEqual(furnitureWorldRect(state.placements[i], state.rugSize));
    expect(props.map((p) => p.layer)).toEqual(["object", "object", "ground"]);
    expect(props.every((p) => p.variant === 1)).toBe(true);
    const drawn = runtimeProps("apartment", [...apartment.props, ...props] as never);
    expect(drawn.map((p) => p.sprite)).toEqual(["apartment/furniture.bed.r0", "apartment/furniture.table.r1", "apartment/furniture.rug.large-r0"]);
    expect(drawn.every((p) => p.frame === 1)).toBe(true);
  });

  it("has a sprite, the size of its cells, for every item in every orientation and rug size", () => {
    for (const id of itemIds) for (const rotation of [0, 1] as const) for (const rugSize of id === "rug" ? ["small", "large"] as const : ["small"] as const) {
      const key = id === "rug" ? `${rugSize}-r${rotation}` : `r${rotation}`;
      const sprite = (residentialSprites as Record<string, { w: number; frames?: number }>)[`apartment/furniture.${id}.${key}`];
      expect(sprite, `${id} ${key}`).toBeDefined();
      expect(sprite.w).toBe(footprint(id, rotation, rugSize)[0] * 64);
      expect(sprite.frames).toBe(2);
    }
  });

  it("adds the owned furnishings to the apartment the game walks, beside their colliders", () => {
    const neighbourhood = createGame(content, 42).neighbourhood!;
    const maps = mapsForNeighbourhood({ ...neighbourhood, apartment: { ...neighbourhood.apartment, placements: [placed("bed", 0, 0), placed("small-lamp", 3, 0)] } } as never);
    const ids = maps.apartment!.props.map((p) => p.id);
    expect(ids).toContain("apartment.furniture.small-lamp.r0");
    expect(maps.apartment!.colliders.map((c) => c.id)).toContain("apartment.furniture.small-lamp");
  });
});
