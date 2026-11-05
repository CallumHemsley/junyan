import type { Line, Word } from "../contracts";

export const featureIds = ["apartment", "cats", "repairs", "garden"] as const;
export type FeatureId = typeof featureIds[number];
export type LocationId = "restaurant" | FeatureId;
export const giftIds = ["repairs.stool", "garden.planter", "cats.cushion"] as const;
export type GiftId = typeof giftIds[number];

export type FeatureViewProps<State, Action> = {
  state: State;
  day: number;
  onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void;
  onPlay: (line: Line) => void;
  recoveredWordIds?: readonly string[];
  freshWordIds?: readonly string[];
};

export type FeatureBoundary<State> = {
  initialState: () => State;
  validate: (value: unknown) => State | null;
};

export type Neighbourhood<Apartment, Cats, Repairs, Garden> = {
  version: 1;
  location: LocationId;
  apartment: Apartment;
  cats: Cats;
  repairs: Repairs;
  garden: Garden;
  claimedGiftIds: GiftId[];
};

export type FeatureBoundaries<Apartment, Cats, Repairs, Garden> = {
  apartment: FeatureBoundary<Apartment>;
  cats: FeatureBoundary<Cats>;
  repairs: FeatureBoundary<Repairs>;
  garden: FeatureBoundary<Garden>;
};
