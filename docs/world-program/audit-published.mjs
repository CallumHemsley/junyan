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
console.log(JSON.stringify({ foundation: git('rev-parse',foundation).trim(), note: 'Schema and local standing samples only. This does not prove graph reachability, traversal or visual quality.', results },null,2));
