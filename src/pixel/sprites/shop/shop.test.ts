import { describe, expect, it } from "vitest";
import { bakeSprite, mergeSpriteSets, type SpriteSet } from "../../kit/index.ts";
import { footprintPx, openingsOn, townProps, townSpriteId } from "../../town/map.ts";
import awnings from "./awnings.ts";
import restaurant from "./restaurant.ts";
import shops from "./shops.ts";
import shutters from "./shutters.ts";
import tea from "./tea.ts";
import { lockupOf, tradeOf } from "./_lane-shop.ts";
import workshop from "./workshop.ts";

const all: SpriteSet = mergeSpriteSets([awnings, restaurant, shops, shutters, tea, workshop]);
const BUILDINGS = ["building-restaurant", "building-tea", "building-workshop", "building-shop", "building-shutter"];

describe("shopfront sprites (pixel contract)", () => {
  it("draws one sprite per prop of every owned kind, and nothing else", () => {
    const expected = townProps(...BUILDINGS, "awning").map((p) => townSpriteId(p.id)).sort();
    expect(Object.keys(all).sort()).toEqual(expected);
  });

  it("fills each building's footprint exactly, anchored at its bottom-centre", () => {
    for (const prop of townProps(...BUILDINGS)) {
      const { w, h } = footprintPx(prop);
      const def = all[townSpriteId(prop.id)];
      expect([def.w, def.h], prop.id).toEqual([w, h]);
      expect(def.anchor, prop.id).toEqual([Math.round(w / 2), h - 1]);
      expect(def.shadow, prop.id).toBeUndefined();
    }
  });

  it("sizes awnings to their footprint width, rising above it but never below", () => {
    for (const prop of townProps("awning")) {
      const { w, h } = footprintPx(prop);
      const def = all[townSpriteId(prop.id)];
      expect(def.w, prop.id).toBe(w);
      expect(def.h, prop.id).toBeGreaterThanOrEqual(h);
      expect(def.anchor, prop.id).toEqual([Math.round(w / 2), def.h - 1]);
    }
  });

  it("puts the restaurant's glazed door exactly on its map opening", () => {
    const [prop] = townProps("building-restaurant");
    const door = openingsOn(prop).find((o) => o.kind === "door")!;
    expect([door.x0, door.x1]).toEqual([160, 224]);
    const baked = bakeSprite(townSpriteId(prop.id), all[townSpriteId(prop.id)]);
    const frame = baked.frames[0];
    // Bottle-green frame members bound the opening, glass and brass sit inside it.
    expect(frame.get(160, frame.h - 40)).toMatch(/^jade/);
    expect(frame.get(223, frame.h - 40)).toMatch(/^jade/);
    expect(frame.get(159, frame.h - 40)).not.toMatch(/^(cream|wood)/);
  });

  it("bakes every frame deterministically and solid where a building stands", () => {
    for (const [id, def] of Object.entries(all)) {
      const a = bakeSprite(id, def), b = bakeSprite(id, def);
      a.frames.forEach((f, i) => expect(Buffer.from(f.ink).equals(Buffer.from(b.frames[i].ink)), id).toBe(true));
      if (!id.includes("awning") && !id.includes("canopy")) {
        const f = a.frames[0];
        // The bottom row (the facade's foot) is solid and opaque the whole width.
        for (let x = 0; x < f.w; x++) expect(f.solid(x, f.h - 1) && f.alpha[(f.h - 1) * f.w + x] === 255, `${id} x${x}`).toBe(true);
      }
    }
  });

  it("generates lane shops and lock-ups for unnamed props instead of repeating a landmark", () => {
    const named = new Set(["town.corner-store", "town.market-house", "town.south-bakery", "town.bookshop", "town.west-store", "town.river-store"]);
    const shops = townProps("building-shop").filter((p) => !named.has(p.id)).map(tradeOf);
    const lockups = townProps("building-shutter").filter((p) => !named.has(p.id)).map(lockupOf);
    if (shops.length > 1) expect(new Set(shops).size).toBeGreaterThan(1);
    if (lockups.length > 1) expect(new Set(lockups).size).toBeGreaterThan(1);
    // Same id, same shop, every bake.
    for (const p of townProps("building-shop")) expect(tradeOf(p)).toBe(tradeOf({ ...p }));
  });
});
