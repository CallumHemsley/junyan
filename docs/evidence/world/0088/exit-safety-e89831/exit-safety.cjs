"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitComponent = exitComponent;
exports.isExitConnected = isExitConnected;
exports.safeExitPosition = safeExitPosition;
const geometry_1 = require("./geometry.cjs");
const components = new WeakMap();
const key = (p) => `${p.x},${p.y}`;
function exits(map) {
    const seeds = [];
    for (const { rect: r } of map.exits) {
        const center = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        if ((0, geometry_1.canStand)(map, center))
            seeds.push(center);
        for (let x = Math.ceil(r.x * 2) / 2; x <= r.x + r.width; x += .5)
            for (let y = Math.ceil(r.y * 2) / 2; y <= r.y + r.height; y += .5)
                if ((0, geometry_1.canStand)(map, { x, y }))
                    seeds.push({ x, y });
    }
    // Isolated authored test/interior maps without exits retain their spawn component.
    if (!map.exits.length && (0, geometry_1.canStand)(map, map.defaultSpawn))
        seeds.push(map.defaultSpawn);
    return seeds;
}
function exitComponent(map) {
    const known = components.get(map);
    if (known)
        return known;
    const seeds = exits(map), queue = [], seen = new Set();
    const add = (p) => { const id = key(p); if (!seen.has(id)) {
        seen.add(id);
        queue.push(p);
    } };
    for (const p of seeds)
        for (let x = Math.floor(p.x * 2) / 2 - .5; x <= Math.ceil(p.x * 2) / 2 + .5; x += .5)
            for (let y = Math.floor(p.y * 2) / 2 - .5; y <= Math.ceil(p.y * 2) / 2 + .5; y += .5)
                if ((0, geometry_1.canWalk)(map, p, { x, y }))
                    add({ x, y });
    for (let i = 0; i < queue.length; i++) {
        const p = queue[i];
        for (const [dx, dy] of [[.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
            const n = { x: p.x + dx, y: p.y + dy };
            if (!seen.has(key(n)) && (0, geometry_1.canWalk)(map, p, n))
                add(n);
        }
    }
    const result = [...seeds, ...queue];
    components.set(map, result);
    return result;
}
function isExitConnected(map, p) {
    if (!(0, geometry_1.canStand)(map, p))
        return false;
    if (exits(map).some(exit => (0, geometry_1.canWalk)(map, p, exit)))
        return true;
    return exitComponent(map).some(n => Math.abs(n.x - p.x) <= 1 && Math.abs(n.y - p.y) <= 1 && (0, geometry_1.canWalk)(map, p, n));
}
function safeExitPosition(map, p) {
    if (isExitConnected(map, p))
        return p;
    const points = [...exitComponent(map)].sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y) || a.y - b.y || a.x - b.x);
    // An edited/corrupt map can cover every exit. Callers must reject the edit
    // or restore to the static safe world; never throw or keep disconnected feet.
    if (!points.length)
        return null;
    return points[0];
}
