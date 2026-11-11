import { describe, expect, it } from "vitest";
import { footprint, itemIds, type State } from "../../features/apartment/rules";
import { furnitureProps, furnitureWorldRect } from "../../features/apartment/world";
import { mapsForNeighbourhood } from "../dynamic";
import { createGame } from "../../game";
import { content } from "../../content";
import { PREVIEW_OPACITY, previewState, runtimeFade, runtimeLights, runtimeProps } from "./outdoor";
import { outdoorScene } from "../../pixel/world/scene";
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

  it("previews the furnishing being placed at its draft cells, translucent, over an outline that says whether it fits", () => {
    const base = { placements: [placed("bed", 0, 0)], colour: "blue", rugSize: "small" } as const;
    const fits = furnitureProps({ ...base, selected: "table", draft: { x: 2, y: 1, rotation: 1 } } as never);
    const preview = fits.find((p) => p.id.endsWith(".preview"))!, outline = fits.find((p) => p.kind === "furniture-outline")!;
    expect(preview.id).toBe("apartment.furniture.table.r1.preview");
    expect({ ...preview.position, width: preview.width, height: preview.height }).toEqual(furnitureWorldRect(placed("table", 2, 1, 1), "small"));
    expect(outline.id).toBe("apartment.furniture-outline.1x2.valid");
    expect(previewState(fits as never)).toBe("valid");
    // The preview draws the table's own sprite, translucent; the outline its own; nothing is solid.
    const drawn = runtimeProps("apartment", fits as never);
    expect(drawn.find((p) => p.id === preview.id)!.sprite).toBe("apartment/furniture.table.r1");
    expect(drawn.find((p) => p.id === outline.id)).toMatchObject({ sprite: "apartment/furniture-outline.1x2.valid", layer: "floor" });
    expect(runtimeFade(fits as never)).toEqual({ [preview.id]: PREVIEW_OPACITY });
    for (const id of ["apartment/furniture-outline.1x2.valid", "apartment/furniture-outline.2x2.blocked"]) expect((residentialSprites as Record<string, unknown>)[id], id).toBeDefined();
    // On the bed it cannot go: the outline says so.
    const blocked = furnitureProps({ ...base, selected: "table", draft: { x: 0, y: 0, rotation: 0 } } as never);
    expect(previewState(blocked as never)).toBe("blocked");
    expect(blocked.find((p) => p.kind === "furniture-outline")!.id).toBe("apartment.furniture-outline.2x1.blocked");
    // Nothing being placed, nothing previewed.
    const settled = furnitureProps(base as never);
    expect(previewState(settled as never)).toBeNull();
    expect(runtimeFade(settled as never)).toEqual({});
  });

  it("lights an owned lamp at its bulb where it stands, but not one still being placed", () => {
    const props = furnitureProps({ placements: [placed("bed", 0, 0), placed("lamp", 3, 0), placed("small-lamp", 4, 2)], colour: "blue", rugSize: "small", selected: "lamp", draft: { x: 2, y: 3, rotation: 0 } } as never);
    const lights = runtimeLights(props as never);
    expect(lights).toHaveLength(2);
    const lamp = furnitureWorldRect(placed("lamp", 3, 0), "small"), small = furnitureWorldRect(placed("small-lamp", 4, 2), "small");
    expect(lights[0].at[0]).toBe(lamp.x + lamp.width / 2);
    expect(lights[0].at[1]).toBeLessThan(lamp.y + lamp.height - 2);
    expect(lights[1].at[0]).toBe(small.x + small.width / 2);
    expect(lights.every((l) => l.kind === "glow" && l.color === "gold4")).toBe(true);
  });

  it("sorts the hall bench's cushion just in front of the bench it lies on", () => {
    const scene = outdoorScene("residential-hall");
    const cushion = scene.props!.find((p) => p.id === "residential-hall.bench-cushion")!, bench = scene.props!.find((p) => p.id === "residential-hall.bench")!;
    expect(cushion.sortY).toBeGreaterThan(bench.at[1]);
    expect(cushion.sortY! - bench.at[1]).toBeLessThan(0.1);
  });
});
