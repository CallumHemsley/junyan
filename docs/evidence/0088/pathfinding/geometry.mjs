export const PLAYER_RADIUS = .22;
export function contains(rect, p) {
    return p.x >= rect.x && p.y >= rect.y && p.x <= rect.x + rect.width && p.y <= rect.y + rect.height;
}
export function canStand(map, p, radius = PLAYER_RADIUS) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < radius || p.y < radius || p.x > map.bounds.width - radius || p.y > map.bounds.height - radius)
        return false;
    const samples = [{ x: p.x - radius, y: p.y - radius }, { x: p.x + radius, y: p.y - radius }, { x: p.x - radius, y: p.y + radius }, { x: p.x + radius, y: p.y + radius }];
    if (!samples.every(sample => map.walkable.some(rect => contains(rect, sample))))
        return false;
    return map.colliders.every(({ rect }) => {
        const x = Math.max(rect.x, Math.min(p.x, rect.x + rect.width));
        const y = Math.max(rect.y, Math.min(p.y, rect.y + rect.height));
        return Math.hypot(p.x - x, p.y - y) > radius;
    });
}
export function canWalk(map, from, to) {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / .1));
    for (let i = 0; i <= steps; i++)
        if (!canStand(map, { x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }))
            return false;
    return true;
}
export function movePlayer(map, from, delta) {
    const length = Math.hypot(delta.x, delta.y), steps = Math.max(1, Math.ceil(length / .1));
    let p = from;
    for (let i = 0; i < steps; i++) {
        const next = { x: p.x + delta.x / steps, y: p.y + delta.y / steps };
        if (canWalk(map, p, next))
            p = next;
        else {
            const x = { x: next.x, y: p.y }, y = { x: p.x, y: next.y };
            if (canWalk(map, p, x))
                p = x;
            else if (canWalk(map, p, y))
                p = y;
        }
    }
    return p;
}
export function findPath(map, from, to) {
    if (!canStand(map, from) || !canStand(map, to))
        return [];
    if (canWalk(map, from, to))
        return [to];
    const key = (p) => `${p.x},${p.y}`;
    const connect = (p) => {
        const found = [];
        for (let x = Math.floor(p.x * 2) / 2 - .5; x <= Math.ceil(p.x * 2) / 2 + .5; x += .5)
            for (let y = Math.floor(p.y * 2) / 2 - .5; y <= Math.ceil(p.y * 2) / 2 + .5; y += .5)
                if (canWalk(map, p, { x, y }))
                    found.push({ x, y });
        return found;
    };
    const queue = connect(from), ends = new Set(connect(to).map(key));
    const parents = new Map(queue.map(p => [key(p), null]));
    for (let i = 0; i < queue.length && i < 100000; i++) {
        const p = queue[i];
        if (ends.has(key(p))) {
            const path = [to];
            let node = p;
            while (node) {
                path.unshift(node);
                node = parents.get(key(node)) ?? null;
            }
            const smooth = [];
            let previous = from;
            for (let n = 0; n < path.length; n++)
                if (n === path.length - 1 || !canWalk(map, previous, path[n + 1])) {
                    smooth.push(path[n]);
                    previous = path[n];
                }
            return smooth;
        }
        for (const [dx, dy] of [[.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
            const n = { x: p.x + dx, y: p.y + dy };
            if (!parents.has(key(n)) && canWalk(map, p, n)) {
                parents.set(key(n), p);
                queue.push(n);
            }
        }
    }
    return [];
}
export function nearbyAnchors(map, p) {
    return map.anchors.filter(a => Math.hypot(a.position.x - p.x, a.position.y - p.y) <= a.radius).sort((a, b) => Math.hypot(a.position.x - p.x, a.position.y - p.y) - Math.hypot(b.position.x - p.x, b.position.y - p.y));
}
