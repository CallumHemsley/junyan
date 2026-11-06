import { readFile, writeFile } from 'node:fs/promises';
const path = 'src/world/maps/courtyard/map.json';
const map = JSON.parse(await readFile(path, 'utf8'));
const upsert = (items, value) => { const index = items.findIndex(item => item.id === value.id); if (index < 0) items.push(value); else items[index] = value; };
function prop(id, kind, x, y, width, height, layer = 'object', solid = false, variant = 0) {
  const key = `courtyard.${id}`;
  upsert(map.props, { id: key, kind, position: { x, y }, width, height, layer, variant });
  if (solid) upsert(map.colliders, { id: key, rect: { x, y, width, height } });
}
prop('folding-board', 'folding-board', 30.8, 10.7, 1.1, .65, 'object', true);
prop('sorting-basket', 'sorting-basket', 30.6, 12.3, .75, .65, 'object', true);
prop('laundry-damp-floor', 'damp-paving', 31.5, 11.2, 2.7, 2.3, 'ground');
prop('jar-damp-floor', 'damp-paving', 28.7, 20.1, 2.6, 1.8, 'ground', false, 1);
prop('laundry-runoff', 'runoff-channel', 33.65, 11.7, .18, 2.1, 'ground');
prop('laundry-runoff-drain', 'drain', 33.4, 13.8, .7, .35, 'ground');
prop('black-cat-resting-mat', 'resting-mat', 34.65, 19.35, 1.2, .9, 'ground');
prop('town-entry-mat', 'entry-mat', 21.8, 34.4, 2.4, .9, 'ground');
prop('town-entry-gate', 'entry-gate', 20.6, 34.8, 4.8, 1.2);
upsert(map.occluders, { id: 'courtyard.town-entry-gate', rect: { x: 20.6, y: 34.8, width: 4.8, height: 1.2 }, height: 2.8, fadeWhenPlayerBehind: true });
for (const [suffix, x] of [['left', 20.6], ['right', 25]]) upsert(map.colliders, { id: `courtyard.town-entry-post-${suffix}`, rect: { x, y: 34.8, width: .4, height: 1.2 } });
prop('town-entry-wall-left', 'boundary-wall', 16.6, 35.4, 4, .4, 'object', true);
prop('town-entry-wall-right', 'boundary-wall', 25.4, 35.4, 4, .4, 'object', true);
prop('town-entry-planter-left', 'threshold-planter', 18.5, 34.1, 1.3, .9, 'object', true);
prop('town-entry-planter-right', 'threshold-planter', 27.2, 34, 1.5, .9, 'object', true, 1);
upsert(map.terrain, { id: 'courtyard.town-entry-stone', rect: { x: 21.2, y: 33.2, width: 3.6, height: 3.5 }, material: 'threshold-stone', variant: 3 });
upsert(map.landmarks, { id: 'courtyard.town-threshold', position: { x: 23, y: 34.2 }, kind: 'open-town-gateway' });
await writeFile(path, JSON.stringify(map, null, 2) + '\n');
