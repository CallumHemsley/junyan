"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worldMapSchema = exports.featureSchema = exports.rectSchema = exports.facingSchema = exports.pointSchema = void 0;
const zod_1 = require("zod");
const finite = zod_1.z.number().finite();
exports.pointSchema = zod_1.z.object({ x: finite, y: finite });
exports.facingSchema = zod_1.z.enum(["north", "east", "south", "west"]);
exports.rectSchema = exports.pointSchema.extend({ width: finite.positive(), height: finite.positive() });
const spawnSchema = exports.pointSchema.extend({ facing: exports.facingSchema });
exports.featureSchema = zod_1.z.enum(["restaurant", "apartment", "cats", "repairs", "garden", "exploration"]);
exports.worldMapSchema = zod_1.z.object({
    version: zod_1.z.literal(1), id: zod_1.z.string().min(1),
    bounds: zod_1.z.object({ width: finite.positive().max(1024), height: finite.positive().max(1024) }),
    defaultSpawn: spawnSchema,
    walkable: zod_1.z.array(exports.rectSchema).min(1),
    colliders: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), rect: exports.rectSchema })),
    occluders: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), rect: exports.rectSchema, height: finite.nonnegative(), fadeWhenPlayerBehind: zod_1.z.boolean() })),
    entrances: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), position: exports.pointSchema, facing: exports.facingSchema })),
    exits: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), rect: exports.rectSchema, targetMapId: zod_1.z.string(), targetEntranceId: zod_1.z.string(), kind: zod_1.z.enum(["door", "stairs", "path"]) })),
    anchors: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), position: exports.pointSchema, radius: finite.positive(), featureId: exports.featureSchema, interactionId: zod_1.z.string() })),
    terrain: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), rect: exports.rectSchema, material: zod_1.z.string(), variant: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]) })),
    props: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), kind: zod_1.z.string(), position: exports.pointSchema, width: finite.positive(), height: finite.positive(), layer: zod_1.z.enum(["ground", "object", "foreground"]), variant: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]) })),
    palette: zod_1.z.record(zod_1.z.string(), zod_1.z.tuple([zod_1.z.number().min(0).max(255), zod_1.z.number().min(0).max(255), zod_1.z.number().min(0).max(255)])),
    npcHooks: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), position: exports.pointSchema, route: zod_1.z.array(exports.pointSchema), characterId: zod_1.z.string() })),
    landmarks: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), position: exports.pointSchema, kind: zod_1.z.string() })),
});
