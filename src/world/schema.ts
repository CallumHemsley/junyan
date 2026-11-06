import { z } from "zod";

const finite = z.number().finite();
export const pointSchema = z.object({ x: finite, y: finite });
export const facingSchema = z.enum(["north", "east", "south", "west"]);
export const rectSchema = pointSchema.extend({ width: finite.positive(), height: finite.positive() });
const spawnSchema = pointSchema.extend({ facing: facingSchema });
export const featureSchema = z.enum(["restaurant", "apartment", "cats", "repairs", "garden", "reading-room", "exploration"]);
export const worldMapSchema = z.object({
  version: z.literal(1), id: z.string().min(1),
  bounds: z.object({ width: finite.positive().max(1024), height: finite.positive().max(1024) }),
  defaultSpawn: spawnSchema,
  walkable: z.array(rectSchema).min(1),
  colliders: z.array(z.object({ id: z.string(), rect: rectSchema })),
  occluders: z.array(z.object({ id: z.string(), rect: rectSchema, height: finite.nonnegative(), fadeWhenPlayerBehind: z.boolean() })),
  entrances: z.array(z.object({ id: z.string(), position: pointSchema, facing: facingSchema })),
  exits: z.array(z.object({ id: z.string(), rect: rectSchema, targetMapId: z.string(), targetEntranceId: z.string(), kind: z.enum(["door", "stairs", "path"]) })),
  anchors: z.array(z.object({ id: z.string(), position: pointSchema, radius: finite.positive(), featureId: featureSchema, interactionId: z.string() })),
  terrain: z.array(z.object({ id: z.string(), rect: rectSchema, material: z.string(), variant: z.union([z.string(), z.number()]) })),
  props: z.array(z.object({ id: z.string(), kind: z.string(), position: pointSchema, width: finite.positive(), height: finite.positive(), layer: z.enum(["ground", "object", "foreground"]), variant: z.union([z.string(), z.number()]) })),
  palette: z.record(z.string(), z.tuple([z.number().min(0).max(255), z.number().min(0).max(255), z.number().min(0).max(255)])),
  npcHooks: z.array(z.object({ id: z.string(), position: pointSchema, route: z.array(pointSchema), characterId: z.string() })),
  landmarks: z.array(z.object({ id: z.string(), position: pointSchema, kind: z.string() })),
});
export type WorldMapDefinition = z.infer<typeof worldMapSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Rect = z.infer<typeof rectSchema>;
export type Facing = z.infer<typeof facingSchema>;
export type FeatureId = z.infer<typeof featureSchema>;
export type Spawn = Point & { facing: Facing };
export type WorldState = {
  version: 1; mapId: string; position: Point; facing: Facing;
  returnPositions: Record<string, Spawn>;
  activeActivity: Exclude<FeatureId, "exploration"> | null;
  activeAnchorId: string | null;
  life?: import("./life").LifeState;
};
