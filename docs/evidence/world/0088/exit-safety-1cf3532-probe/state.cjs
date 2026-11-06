"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorld = createWorld;
exports.restoreWorld = restoreWorld;
exports.reduceWorld = reduceWorld;
exports.activityLocation = activityLocation;
const exit_safety_1 = require("./exit-safety.cjs");
const life_1 = require("./life.cjs");
const zod_1 = require("zod");
const schema_1 = require("./schema.cjs");
const geometry_1 = require("./geometry.cjs");
const spawn = schema_1.pointSchema.extend({ facing: schema_1.facingSchema });
const savedSchema = zod_1.z.object({ version: zod_1.z.literal(1), mapId: zod_1.z.string(), position: schema_1.pointSchema, facing: schema_1.facingSchema, returnPositions: zod_1.z.record(zod_1.z.string(), spawn), activeActivity: zod_1.z.enum(["restaurant", "apartment", "cats", "repairs", "garden"]).nullable(), activeAnchorId: zod_1.z.string().nullable().default(null), life: zod_1.z.unknown().optional() });
const locationMap = { restaurant: "restaurant", apartment: "apartment", cats: "courtyard", repairs: "workshop", garden: "rooftop" };
function createWorld(maps, location = "restaurant") {
    const map = maps[locationMap[location]] ?? maps.restaurant;
    return { version: 1, mapId: map.id, position: { x: map.defaultSpawn.x, y: map.defaultSpawn.y }, facing: map.defaultSpawn.facing, returnPositions: {}, activeActivity: null, activeAnchorId: null, life: (0, life_1.restoreLife)(null) };
}
function restoreWorld(value, maps, location = "restaurant") {
    const parsed = savedSchema.safeParse(value);
    if (!parsed.success)
        return createWorld(maps, location);
    const state = parsed.data, map = maps[state.mapId];
    if (!map)
        return createWorld(maps, location);
    const position = (0, exit_safety_1.safeExitPosition)(map, state.position);
    const returnPositions = Object.fromEntries(Object.entries(state.returnPositions).filter(([id, p]) => maps[id] && (0, exit_safety_1.isExitConnected)(maps[id], p)));
    const activeActivity = state.activeActivity && (0, geometry_1.nearbyAnchors)(map, position).some(a => a.featureId === state.activeActivity) ? state.activeActivity : null;
    const activeAnchorId = activeActivity ? ((0, geometry_1.nearbyAnchors)(map, position).find(a => a.id === state.activeAnchorId && a.featureId === activeActivity)?.id ?? (0, geometry_1.nearbyAnchors)(map, position).find(a => a.featureId === activeActivity)?.id ?? null) : null;
    return { ...state, position: { x: position.x, y: position.y }, returnPositions, activeActivity, activeAnchorId, life: (0, life_1.restoreLife)(state.life) };
}
function reduceWorld(state, action, maps) {
    if (action.type === "world-clock") {
        const previous = (0, life_1.restoreLife)(state.life);
        const life = (0, life_1.advanceLife)(previous, action.elapsedMs - previous.elapsedMs, true);
        return life === previous ? state : { ...state, life };
    }
    if (action.type === "world-life")
        return state;
    const map = maps[state.mapId];
    if (!map)
        return createWorld(maps);
    if (action.type === "world-close")
        return state.activeActivity ? { ...state, activeActivity: null, activeAnchorId: null } : state;
    if (action.type === "world-interact") {
        const anchor = (0, geometry_1.nearbyAnchors)(map, state.position).find(a => a.id === action.anchorId);
        if (!anchor || anchor.featureId === "exploration")
            return state;
        return { ...state, activeActivity: anchor.featureId, activeAnchorId: anchor.id };
    }
    if (state.activeActivity || !(0, geometry_1.canWalk)(map, state.position, action.position))
        return state;
    const dx = action.position.x - state.position.x, dy = action.position.y - state.position.y;
    if (!dx && !dy)
        return state;
    const facing = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "east" : "west" : dy > 0 ? "south" : "north";
    const exit = map.exits.find(exit => (0, geometry_1.contains)(exit.rect, action.position));
    if (exit) {
        const target = maps[exit.targetMapId], entrance = target?.entrances.find(e => e.id === exit.targetEntranceId);
        if (target && entrance && (0, geometry_1.canStand)(target, entrance.position))
            return { ...state, mapId: target.id, position: entrance.position, facing: entrance.facing, returnPositions: { ...state.returnPositions, [map.id]: { ...state.position, facing } }, activeActivity: null, activeAnchorId: null };
    }
    return { ...state, position: action.position, facing };
}
function activityLocation(feature) { return feature; }
