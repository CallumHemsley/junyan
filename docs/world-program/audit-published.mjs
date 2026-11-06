import { execFileSync } from 'node:child_process';
import { stripTypeScriptTypes, createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const foundation = process.argv[2] || 'origin/codex/0078-world-foundation';
const importSource = async (path) => {
  const source = stripTypeScriptTypes(git('show', `${foundation}:${path}`))
    .replace('from "zod"', `from ${JSON.stringify(pathToFileURL(require.resolve('zod')).href)}`);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};
const { worldMapSchema } = await importSource('src/world/schema.ts');
const { canStand, nearbyAnchors } = await importSource('src/world/geometry.ts');
const refs = git('for-each-ref', '--format=%(refname)', 'refs/remotes/origin/codex/').trim().split('\n').filter(Boolean);
const results = [];
const maps = [(await importSource('src/world/restaurant.ts')).restaurantMap];
for (const ref of refs) {
  if (!/\/00(79|80|81|82|83|84)-/.test(ref)) continue;
  const files = git('ls-tree', '-r', '--name-only', ref, 'src/world/maps').trim().split('\n').filter(p => p.endsWith('.json'));
  for (const file of files) {
    const raw = JSON.parse(git('show', `${ref}:${file}`));
    if (!raw.bounds) continue;
    const parsed = worldMapSchema.safeParse(raw);
    if (!parsed.success) {
      results.push({ ref, head: git('rev-parse', ref).trim(), file, issues: parsed.error.issues });
      continue;
    }
    const map = parsed.data;
    maps.push(map);
    const blockedEntrances = map.entrances.filter(e => !canStand(map, e.position)).map(e => e.id);
    const inaccessibleAnchorSamples = map.anchors.filter(a => {
      for (let y = a.position.y-a.radius; y <= a.position.y+a.radius; y += .25)
        for (let x = a.position.x-a.radius; x <= a.position.x+a.radius; x += .25)
          if (canStand(map, {x,y}) && nearbyAnchors(map, {x,y}).some(n => n.id === a.id)) return false;
      return true;
    }).map(a => a.id);
    results.push({ ref, head: git('rev-parse', ref).trim(), file, mapId: map.id, schema: 'pass', spawnCanStand: canStand(map,map.defaultSpawn), blockedEntrances, inaccessibleAnchorSamples });
  }
}
const graphIssues = [];
for (const map of maps) for (const exit of map.exits) {
  const target = maps.find(m => m.id === exit.targetMapId);
  const entrance = target?.entrances.find(e => e.id === exit.targetEntranceId);
  if (!entrance) graphIssues.push(`${map.id}/${exit.id}: missing target entrance`);
  else if (target.exits.some(e => entrance.position.x >= e.rect.x && entrance.position.x <= e.rect.x+e.rect.width && entrance.position.y >= e.rect.y && entrance.position.y <= e.rect.y+e.rect.height)) graphIssues.push(`${map.id}/${exit.id}: arrival lies inside target exit trigger`);
}
const reached = new Set(['restaurant']);
for (let changed = true; changed;) {
  changed = false;
  for (const map of maps) if (reached.has(map.id)) for (const exit of map.exits)
    if (maps.some(m => m.id === exit.targetMapId) && !reached.has(exit.targetMapId)) { reached.add(exit.targetMapId); changed = true; }
}
for (const map of maps) if (!reached.has(map.id)) graphIssues.push(`${map.id}: not graph-reachable from restaurant`);
console.log(JSON.stringify({ graphIssues, graphReachableMaps: [...reached], foundation: git('rev-parse',foundation).trim(), note: 'Schema, portal-reference graph and local standing samples only. Graph links do not prove collision-connected approach paths, ordinary-control traversal or visual quality.', results },null,2));
