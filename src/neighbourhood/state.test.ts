import { describe, expect, it } from "vitest";
import { claimGift, initialNeighbourhood, validateNeighbourhood, visitLocation, restoreClaimedGifts } from "./state";
import type { FeatureBoundary, GiftId } from "./contracts";

type LocalState = { count: number };
const boundary: FeatureBoundary<LocalState> = {
  initialState: () => ({ count: 0 }),
  validate: (value) => {
    if (typeof value !== "object" || value === null || !("count" in value)) return null;
    return typeof value.count === "number" && Number.isInteger(value.count) && value.count >= 0
      ? { count: value.count } : null;
  },
};
const features = { apartment: boundary, cats: boundary, repairs: boundary, garden: boundary };

describe("neighbourhood save boundary", () => {
  it("initializes old saves without feature progress", () => {
    expect(validateNeighbourhood(undefined, features)).toEqual(initialNeighbourhood(features));
    expect(validateNeighbourhood({ version: 9 }, features)).toEqual(initialNeighbourhood(features));
  });

  it("repairs only the invalid feature while preserving siblings, gifts and location", () => {
    const saved = { ...initialNeighbourhood(features), location: "garden", apartment: { count: 4 }, cats: { count: -1 }, repairs: { count: 2 }, garden: { count: 3 }, claimedGiftIds: ["repairs.stool", "repairs.stool"] };
    expect(validateNeighbourhood(saved, features)).toEqual({ ...saved, cats: { count: 0 }, claimedGiftIds: ["repairs.stool"] });
  });

  it("repairs malformed navigation and claims without losing feature progress", () => {
    const saved = { ...initialNeighbourhood(features), apartment: { count: 3 }, location: "hospital", claimedGiftIds: null };
    expect(validateNeighbourhood(saved, features)).toMatchObject({ apartment: { count: 3 }, location: "restaurant", claimedGiftIds: [] });
  });

  it("retains known gift receipts when one receipt is invalid", () => {
    const saved = { ...initialNeighbourhood(features), claimedGiftIds: ["repairs.stool", "unknown", "cats.cushion"] };
    expect(validateNeighbourhood(saved, features).claimedGiftIds).toEqual(["repairs.stool", "cats.cushion"]);
  });

  it("creates independent initial feature states", () => {
    const state = initialNeighbourhood(features);
    expect(state.apartment).not.toBe(state.cats);
    expect(state.apartment).not.toBe(initialNeighbourhood(features).apartment);
  });
});

describe("neighbourhood transitions", () => {
  it("visits every optional location and returns with feature progress unchanged", () => {
    const start = initialNeighbourhood(features);
    let state = start;
    for (const location of ["apartment", "cats", "repairs", "garden", "restaurant"] as const) {
      state = visitLocation(state, location);
      expect(state.location).toBe(location);
      expect(state.apartment).toBe(start.apartment);
      expect(state.cats).toBe(start.cats);
    }
    expect(visitLocation(state, "restaurant")).toBe(state);
  });

  it("delivers available gifts with their receipt in one immutable update and ignores retries", () => {
    const start = initialNeighbourhood(features);
    const receive = (apartment: LocalState, _giftId: GiftId) => ({ count: apartment.count + 1 });
    expect(claimGift(start, "repairs.stool", [], receive)).toBe(start);
    const next = claimGift(start, "repairs.stool", ["repairs.stool"], receive);
    expect(next.apartment.count).toBe(1);
    expect(next.claimedGiftIds).toEqual(["repairs.stool"]);
    expect(start.apartment.count).toBe(0);
    expect(start.claimedGiftIds).toEqual([]);
    const restored = validateNeighbourhood(JSON.parse(JSON.stringify(next)), features);
    expect(claimGift(restored, "repairs.stool", ["repairs.stool"], receive)).toBe(restored);
  });

  it("records a missing receipt when the apartment already retains the gift", () => {
    const state = initialNeighbourhood(features);
    const next = claimGift(state, "cats.cushion", ["cats.cushion"], apartment => apartment);
    expect(next.apartment).toBe(state.apartment);
    expect(next.claimedGiftIds).toEqual(["cats.cushion"]);
  });

  it("restores claimed gifts after only the apartment payload resets", () => {
    const apartment: FeatureBoundary<GiftId[]> = {
      initialState: () => [],
      validate: value => Array.isArray(value) && value.every(id => id === "repairs.stool" || id === "cats.cushion") ? value : null,
    };
    const boundaries = { ...features, apartment };
    const saved = { ...initialNeighbourhood(boundaries), apartment: null, cats: { count: 3 }, claimedGiftIds: ["repairs.stool", "cats.cushion"] };
    const restored = validateNeighbourhood(saved, boundaries);
    const receive = (inventory: GiftId[], gift: GiftId) => inventory.includes(gift) ? inventory : [...inventory, gift];
    const reconciled = restoreClaimedGifts(restored, receive);
    expect(reconciled.apartment).toEqual(["repairs.stool", "cats.cushion"]);
    expect(restoreClaimedGifts(reconciled, receive)).toBe(reconciled);
    expect(reconciled.cats).toBe(restored.cats);
    expect(reconciled.cats.count).toBe(3);
  });

  it("does not mark an unaccepted gift as claimed", () => {
    const state = initialNeighbourhood(features);
    expect(claimGift(state, "cats.cushion", ["cats.cushion"], () => null)).toBe(state);
  });
});
