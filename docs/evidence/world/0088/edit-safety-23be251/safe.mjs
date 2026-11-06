import {canStand,canWalk} from './geometry.mjs';
export function safeAfterEdit(before, after, position) {
    if (canStand(after, position))
        return position;
    for (let radius = .5; radius <= Math.hypot(after.bounds.width, after.bounds.height); radius += .5) {
        const candidates = [];
        for (let dx = -radius; dx <= radius; dx += .5)
            for (const dy of [-radius, radius])
                candidates.push({ x: position.x + dx, y: position.y + dy });
        for (let dy = -radius + .5; dy < radius; dy += .5)
            for (const dx of [-radius, radius])
                candidates.push({ x: position.x + dx, y: position.y + dy });
        candidates.sort((a, b) => Math.hypot(a.x - position.x, a.y - position.y) - Math.hypot(b.x - position.x, b.y - position.y) || a.y - b.y || a.x - b.x);
        for (const candidate of candidates)
            if (canStand(after, candidate) && canWalk(before, position, candidate))
                return candidate;
    }
    return after.defaultSpawn;
}
