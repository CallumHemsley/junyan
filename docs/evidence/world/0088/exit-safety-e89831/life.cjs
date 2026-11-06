"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialLifeState = exports.lifeStateSchema = void 0;
exports.advanceLife = advanceLife;
exports.restoreLife = restoreLife;
const zod_1 = require("zod");
const id = zod_1.z.string().min(1).max(200);
const discovery = zod_1.z.strictObject({ mapId: id, landmarkId: id, day: zod_1.z.number().int().positive().max(Number.MAX_SAFE_INTEGER) });
const reaction = zod_1.z.strictObject({ mapId: id, targetId: id, reaction: zod_1.z.enum(['wave', 'sit', 'watch', 'flutter', 'ripple', 'sway']), atMs: zod_1.z.number().finite().nonnegative() });
exports.lifeStateSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    elapsedMs: zod_1.z.number().finite().nonnegative().default(0),
    discoveries: zod_1.z.array(discovery).max(10000),
    reactions: zod_1.z.array(reaction).max(100),
    serviceDepartures: zod_1.z.array(zod_1.z.strictObject({ day: zod_1.z.number().int().positive().max(Number.MAX_SAFE_INTEGER), table: zod_1.z.number().int().min(1).max(4), orderId: id })).max(4).default([]),
    pauses: zod_1.z.array(zod_1.z.strictObject({ mapId: id, targetId: id, startMs: zod_1.z.number().finite().nonnegative(), durationMs: zod_1.z.number().finite().positive(), previousMs: zod_1.z.number().finite().nonnegative() })).max(100).default([]),
}).superRefine((value, context) => {
    const keys = value.discoveries.map(item => JSON.stringify([item.mapId, item.landmarkId]));
    if (new Set(keys).size !== keys.length)
        context.addIssue({ code: 'custom', message: 'Duplicate discovery' });
});
const initialLifeState = () => ({ version: 1, elapsedMs: 0, discoveries: [], reactions: [], pauses: [], serviceDepartures: [] });
exports.initialLifeState = initialLifeState;
function advanceLife(state, deltaMs, visible) {
    if (!visible || !Number.isFinite(deltaMs) || deltaMs <= 0 || !Number.isFinite(state.elapsedMs + deltaMs))
        return state;
    return { ...state, elapsedMs: state.elapsedMs + deltaMs };
}
function restoreLife(value) {
    const parsed = exports.lifeStateSchema.safeParse(value);
    return parsed.success ? parsed.data : (0, exports.initialLifeState)();
}
