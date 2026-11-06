"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapRegistry = createMapRegistry;
const schema_1 = require("./schema.cjs");
function createMapRegistry(definitions) {
    const registry = {};
    for (const raw of definitions) {
        const map = schema_1.worldMapSchema.parse(raw);
        if (registry[map.id])
            throw new Error(`Duplicate world map ${map.id}`);
        for (const group of [map.entrances, map.exits, map.anchors, map.colliders, map.props, map.terrain, map.occluders, map.npcHooks, map.landmarks])
            if (new Set(group.map(item => item.id)).size !== group.length)
                throw new Error(`Duplicate world content ID in ${map.id}`);
        registry[map.id] = map;
    }
    return registry;
}
