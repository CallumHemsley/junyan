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

// Half-tile paths keep the waiter out of tables while preserving click-to-walk input.
export function route(from: Position, to: Position): Position[] {
  if (!canStand(to)) return [];
  const nearest = (p: Position) => ({
    x: Math.round(p.x * 2) / 2,
    y: Math.round(p.y * 2) / 2,
  });
  const start = nearest(from),
    end = nearest(to);
  if (!canStand(end)) return [];
  const key = (p: Position) => `${p.x},${p.y}`;
  const queue = [start],
    parents = new Map<string, Position | null>([[key(start), null]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (key(current) === key(end)) {
      const path: Position[] = [to];
      let node: Position | null = current;
      while (node && key(node) !== key(start)) {
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
      if (canStand(next) && !parents.has(key(next))) {
        parents.set(key(next), current);
        queue.push(next);
      }
    }
  }
  return [];
}
