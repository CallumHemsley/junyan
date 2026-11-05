// Authoring example only. Foundation owns the production Zod schema and types.
export type WorldPoint = { x: number; y: number };
export type WorldFacing = "north" | "east" | "south" | "west";
export type WorldRect = WorldPoint & { width: number; height: number };
export type WorldMapDefinitionV1 = {
  version: 1;
  id: string;
  bounds: { width: number; height: number };
  defaultSpawn: WorldPoint & { facing: WorldFacing };
  walkable: WorldRect[];
  colliders: { id: string; rect: WorldRect }[];
  occluders: { id: string; rect: WorldRect; height: number; fadeWhenPlayerBehind: boolean }[];
  entrances: { id: string; position: WorldPoint; facing: WorldFacing }[];
  exits: { id: string; rect: WorldRect; targetMapId: string; targetEntranceId: string; kind: "door" | "stairs" | "path" }[];
  anchors: { id: string; position: WorldPoint; radius: number; featureId: "restaurant" | "apartment" | "cats" | "repairs" | "garden" | "exploration"; interactionId: string }[];
  terrain: { id: string; rect: WorldRect; material: string; variant: number }[];
  props: { id: string; kind: string; position: WorldPoint; width: number; height: number; layer: "ground" | "object" | "foreground"; variant: number }[];
  palette: Record<string, [number, number, number]>;
  npcHooks: { id: string; position: WorldPoint; route: WorldPoint[]; characterId: string }[];
  landmarks: { id: string; position: WorldPoint; kind: string }[];
};

export type WorldPlayerV1 = {
  mapId: string;
  position: WorldPoint;
  facing: WorldFacing;
  returnPositions: Record<string, WorldPoint & { facing: WorldFacing }>;
  activeActivity: { featureId: string; anchorId: string } | null;
};
export type CameraInput = {
  focus: WorldPoint;
  viewport: { width: number; height: number };
  zoom: number;
};
export type ActorSampleInput = {
  characterId: string;
  facing: WorldFacing;
  action: "idle" | "walk" | "interact";
  elapsedMs: number;
  reducedMotion: boolean;
};
export type AtmosphereSampleInput = {
  mapId: string;
  day: number;
  timeOfDay: number;
  elapsedMs: number;
  seed: number;
  reducedMotion: boolean;
};
