import { TABLES, type Position } from "./contracts";

export function canStand(position: Position): boolean {
  return (
    Number.isFinite(position.x) &&
    Number.isFinite(position.y) &&
    position.x >= 0 &&
    position.x <= 12 &&
    position.y >= 0 &&
    position.y <= 10 &&
    TABLES.every(
      (table) => Math.hypot(table.x - position.x, table.y - position.y) >= 1.05,
    )
  );
}

export function canWalk(from: Position, to: Position): boolean {
  if (!canStand(from) || !canStand(to)) return false;
  const dx = to.x - from.x,
    dy = to.y - from.y,
    lengthSquared = dx * dx + dy * dy;
  return TABLES.every((table) => {
    const t = lengthSquared
      ? Math.max(
          0,
          Math.min(
            1,
            ((table.x - from.x) * dx + (table.y - from.y) * dy) / lengthSquared,
          ),
        )
      : 0;
    return (
      Math.hypot(table.x - from.x - t * dx, table.y - from.y - t * dy) >= 1.05
    );
  });
}

// Half-tile paths keep the waiter out of tables while preserving click-to-walk input.
export function route(from: Position, to: Position): Position[] {
  if (!canStand(from) || !canStand(to)) return [];
  const connections = (position: Position) => {
    const points: Position[] = [];
    for (
      let x = Math.floor(position.x * 2) / 2 - 0.5;
      x <= Math.ceil(position.x * 2) / 2 + 0.5;
      x += 0.5
    )
      for (
        let y = Math.floor(position.y * 2) / 2 - 0.5;
        y <= Math.ceil(position.y * 2) / 2 + 0.5;
        y += 0.5
      )
        if (canWalk(position, { x, y })) points.push({ x, y });
    return points.sort(
      (a, b) =>
        Math.hypot(a.x - position.x, a.y - position.y) -
        Math.hypot(b.x - position.x, b.y - position.y),
    );
  };
  const key = (p: Position) => `${p.x},${p.y}`;
  const queue = connections(from),
    ends = new Set(connections(to).map(key)),
    parents = new Map<string, Position | null>(
      queue.map((point) => [key(point), null]),
    );
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (ends.has(key(current))) {
      const path: Position[] = [to];
      let node: Position | null = current;
      while (node) {
        path.unshift(node);
        node = parents.get(key(node)) ?? null;
      }
      return path;
    }
    for (const [dx, dy] of [
      [0.5, 0],
      [-0.5, 0],
      [0, 0.5],
      [0, -0.5],
    ]) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (canWalk(current, next) && !parents.has(key(next))) {
        parents.set(key(next), current);
        queue.push(next);
      }
    }
  }
  return [];
}
