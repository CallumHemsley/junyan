import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const snapshot = process.argv[2] ?? `${process.cwd()}/src/world`;
const { worldMapSchema } = await import(pathToFileURL(`${snapshot}/schema.ts`));
const { canStand, canWalk, findPath } = await import(pathToFileURL(`${snapshot}/geometry.ts`));
const map = worldMapSchema.parse(JSON.parse(await readFile('src/world/maps/courtyard/map.json', 'utf8')));
const origin = map.defaultSpawn;
assert(canStand(map, origin), 'default spawn must fit the shared player footprint');
const destinations = [
  ...map.entrances.map(p => ({ id: p.id, point: p.position })),
  ...map.anchors.map(p => ({ id: p.id, point: p.position })),
  ...map.exits.map(p => ({ id: p.id, point: { x: p.rect.x + p.rect.width / 2, y: p.rect.y + p.rect.height / 2 } })),
  ...map.npcHooks.flatMap(h => h.route.map((point, i) => ({ id: `${h.id}.route.${i}`, point }))),
];
for (const hook of map.npcHooks) for (let i = 1; i < hook.route.length; i++) assert(canWalk(map, hook.route[i - 1], hook.route[i]), `${hook.id} segment ${i} must clear shared swept collision`);
const routes = [];
for (const d of destinations) {
  assert(canStand(map, d.point), `${d.id} must fit the shared player footprint`);
  const path = findPath(map, origin, d.point);
  assert(path.length, `${d.id} must be reachable through shared pathfinding`);
  let previous = origin, length = 0;
  for (const point of path) {
    assert(canWalk(map, previous, point), `${d.id} path must use swept collision`);
    length += Math.hypot(point.x - previous.x, point.y - previous.y); previous = point;
  }
  routes.push({ id: d.id, length: Number(length.toFixed(2)), waypoints: path });
}
for (const entrance of map.entrances) assert(!map.exits.some(({ rect }) => entrance.position.x >= rect.x && entrance.position.x <= rect.x + rect.width && entrance.position.y >= rect.y && entrance.position.y <= rect.y + rect.height), `${entrance.id} cannot bounce immediately through an exit`);
const cells = new Set(), queue = [{ x: Math.round(origin.x * 2) / 2, y: Math.round(origin.y * 2) / 2 }];
cells.add(`${queue[0].x},${queue[0].y}`);
for (let i = 0; i < queue.length; i++) for (const [dx, dy] of [[.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
  const point = { x: queue[i].x + dx, y: queue[i].y + dy }, key = `${point.x},${point.y}`;
  if (!cells.has(key) && canWalk(map, queue[i], point)) { cells.add(key); queue.push(point); }
}
const result = { mapId: map.id, bounds: map.bounds, reachableAreaSampledTiles: cells.size / 4, sampleStep: .5, authoredLandmarks: map.landmarks.length, props: map.props.length, sharedFoundationSnapshot: snapshot, routes, limits: 'Geometry proof only. No browser traversal, reciprocal registry graph, save, activity or visual acceptance is inferred.' };
await writeFile('docs/evidence/world/0080/geometry-proof.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, routes: routes.map(({ id, length }) => ({ id, length })) }, null, 2));
