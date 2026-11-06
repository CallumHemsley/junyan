import { z } from "zod";
import { giftIds, type FeatureBoundaries, type GiftId, type LocationId, type Neighbourhood } from "./contracts";

const envelopeSchema = z.object({
  version: z.literal(1),
  location: z.enum(["restaurant", "apartment", "cats", "repairs", "garden", "reading-room"]).catch("restaurant"),
  apartment: z.unknown().optional(),
  cats: z.unknown().optional(),
  repairs: z.unknown().optional(),
  garden: z.unknown().optional(),
  "reading-room": z.unknown().optional(),
  claimedGiftIds: z.array(z.unknown()).catch([]).transform(values =>
    [...new Set(values.flatMap(value => {
      const parsed = z.enum(giftIds).safeParse(value);
      return parsed.success ? [parsed.data] : [];
    }))],
  ),
});

export function initialNeighbourhood<A, C, R, G, B>(
  features: FeatureBoundaries<A, C, R, G, B>,
): Neighbourhood<A, C, R, G, B> {
  return {
    version: 1,
    location: "restaurant",
    apartment: features.apartment.initialState(),
    cats: features.cats.initialState(),
    repairs: features.repairs.initialState(),
    garden: features.garden.initialState(),
    "reading-room": features["reading-room"].initialState(),
    claimedGiftIds: [],
  };
}

export function validateNeighbourhood<A, C, R, G, B>(
  value: unknown,
  features: FeatureBoundaries<A, C, R, G, B>,
): Neighbourhood<A, C, R, G, B> {
  const parsed = envelopeSchema.safeParse(value);
  if (!parsed.success) return initialNeighbourhood(features);
  const saved = parsed.data;
  return {
    version: 1,
    location: saved.location,
    apartment: features.apartment.validate(saved.apartment) ?? features.apartment.initialState(),
    cats: features.cats.validate(saved.cats) ?? features.cats.initialState(),
    repairs: features.repairs.validate(saved.repairs) ?? features.repairs.initialState(),
    garden: features.garden.validate(saved.garden) ?? features.garden.initialState(),
    "reading-room": features["reading-room"].validate(saved["reading-room"]) ?? features["reading-room"].initialState(),
    claimedGiftIds: saved.claimedGiftIds,
  };
}

export function visitLocation<A, C, R, G, B>(
  state: Neighbourhood<A, C, R, G, B>,
  location: LocationId,
): Neighbourhood<A, C, R, G, B> {
  return state.location === location ? state : { ...state, location };
}

export function claimGift<A, C, R, G, B>(
  state: Neighbourhood<A, C, R, G, B>,
  giftId: GiftId,
  availableGiftIds: readonly string[],
  receive: (apartment: A, giftId: GiftId) => A | null,
): Neighbourhood<A, C, R, G, B> {
  if (state.claimedGiftIds.includes(giftId) || !availableGiftIds.includes(giftId)) return state;
  const apartment = receive(state.apartment, giftId);
  if (apartment === null) return state;
  return { ...state, apartment, claimedGiftIds: [...state.claimedGiftIds, giftId] };
}

export function restoreClaimedGifts<A, C, R, G, B>(
  state: Neighbourhood<A, C, R, G, B>,
  receive: (apartment: A, giftId: GiftId) => A,
): Neighbourhood<A, C, R, G, B> {
  const apartment = state.claimedGiftIds.reduce(receive, state.apartment);
  return apartment === state.apartment ? state : { ...state, apartment };
}
