import { expect, it } from 'vitest';
import { content } from '../../content';
import { createGame } from '../../game';
import { restoreNeighbourhood } from '../../neighbourhood/model';
import { actorsFor, lifeContext, performLifeInteraction, planFor } from '../../world/life-bridge';
import { restoreLife } from '../../world/life/interactions';
import { releaseServedCustomer } from '../../world/life/presence';
import { sampleLife } from '../../world/life/sample';
import { worldLifeFrame } from '../../world/life/scene';
import { navigationFor } from '../../world/life/navigation';
import { worldMaps } from '../../world/registry';
import { createWorld, restoreWorld } from '../../world/state';
import { mapsForNeighbourhood } from '../../world/dynamic';
import { sampleActor } from '../../world/characters';
import { readingRoomHost } from './neighbours';
import { instruction } from './content';
import { initialState, legal, reduce } from './rules';
import { placementRect } from './world';

const context = { elapsedMs: 4000, reducedMotion: false, excludedCharacterIds: [] };
const lin = content.characters.find(character => character.id === 'lin-jie')!;
function completedWindow() {
  let state = initialState();
  for (const [id, x] of [['table', 2], ['chair', 1]] as const) {
    state = reduce(state, { type: 'select', id });
    state = reduce(state, { type: 'preview', x, y: 0 });
    state = reduce(state, { type: 'place' });
  }
  return reduce(state, { type: 'check' });
}
function releasedGame() {
  const game = createGame(content, 42), world = createWorld(worldMaps, 'reading-room');
  const table = game.customers.find(customer => content.orders.find(order => order.id === customer.orderId)?.customer === lin.name)!.table;
  game.customers.find(customer => customer.table === table)!.phase = 'served';
  return { game, world, table };
}

it('retains Lin in breakfast service until the real acknowledgement releases her on both life seams', () => {
  const { game, world, table } = releasedGame();
  const host = () => [actorsFor(worldMaps['reading-room'], game, world, 4000, false), worldLifeFrame(worldMaps['reading-room'], game, world, false).actors];
  expect(host()).toEqual([[], []]);
  world.life = releaseServedCustomer(restoreLife(world.life), game, table);
  expect(host().every(actors => actors.length === 1 && actors[0].characterId === lin.id)).toBe(true);
  expect(worldLifeFrame(worldMaps['reading-room'], game, world, false).actors).toEqual(actorsFor(worldMaps['reading-room'], game, world, restoreLife(world.life).elapsedMs, false));
});

it('uses exact canonical requests, then her own neutral thanks after actual completion', () => {
  let state = initialState();
  expect(readingRoomHost(state, context)[0].greeting).toBe(instruction.window);
  state = reduce(state, { type: 'select', id: 'chair' });
  expect(readingRoomHost(state, context)[0].greeting).toBe(instruction.left);
  state = reduce(completedWindow(), { type: 'begin-brief', brief: 'alcove' });
  state = reduce(reduce(state, { type: 'select', id: 'table' }), { type: 'rotate' });
  expect(readingRoomHost(state, context)[0].greeting).toBe(instruction.rotate);
  expect(readingRoomHost(completedWindow(), context)[0].greeting).toBe(lin.thanks);
  expect(lin.thanks.tokens.map(token => token.text).join('')).toBe('麻烦你了谢谢');
});

it('gives request and completion acknowledgements through the reachable existing greet action', () => {
  const { game, world, table } = releasedGame();
  world.life = releaseServedCustomer(restoreLife(world.life), game, table);
  world.position = { x: 12.5, y: 7.5 };
  const request = performLifeInteraction(worldMaps['reading-room'], game, world, { type: 'world-life', actionId: 'reading-room.host/greet', elapsedMs: 10000 });
  expect(request.line).toBe(instruction.window);
  expect(request.events).toEqual([{ type: 'reacted', mapId: 'reading-room', targetId: 'reading-room.host', reaction: 'wave', atMs: 10000 }]);
  game.neighbourhood!['reading-room'] = completedWindow();
  const thanks = performLifeInteraction(mapsForNeighbourhood(game.neighbourhood!)['reading-room'], game, world, { type: 'world-life', actionId: 'reading-room.host/greet', elapsedMs: 12000 });
  expect(thanks.line).toBe(lin.thanks);
  expect(thanks.state.pauses.find(pause => pause.targetId === 'reading-room.host')).toMatchObject({ startMs: 12000, durationMs: 1800 });
});

it('restores the host from existing save fields and preserves meaningful replay requests', () => {
  const { game, world, table } = releasedGame();
  world.life = releaseServedCustomer(restoreLife(world.life), game, table);
  game.neighbourhood!['reading-room'] = completedWindow();
  const data = JSON.parse(JSON.stringify({ neighbourhood: game.neighbourhood, world }));
  game.neighbourhood = restoreNeighbourhood(data.neighbourhood, game.day);
  const savedWorld = restoreWorld(data.world, mapsForNeighbourhood(game.neighbourhood));
  expect(actorsFor(worldMaps['reading-room'], game, savedWorld, 10000, false)[0].greeting).toBe(lin.thanks);
  const replay = reduce(game.neighbourhood['reading-room'], { type: 'restart' });
  expect(replay.completedLayouts.window).not.toBeNull();
  expect(readingRoomHost(replay, context)[0].greeting).toBe(instruction.window);
  expect(readingRoomHost(replay, context)[0].position).toEqual(readingRoomHost(completedWindow(), context)[0].position);
});

it('keeps the book-bearing host outside every legal furniture footprint and clear of the exit', () => {
  const host = readingRoomHost(initialState(), context)[0], navigation = navigationFor(worldMaps['reading-room']);
  expect(navigation.canStand(host.position, host.radius)).toBe(true);
  expect(navigation.route(worldMaps['reading-room'].defaultSpawn, host.position, host.radius, [])).not.toHaveLength(0);
  for (const brief of ['window', 'alcove'] as const) for (const id of ['table', 'chair'] as const) for (const rotation of [0, 1] as const) for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
    const placement = { id, rotation, x, y };
    if (!legal(brief, [], placement)) continue;
    const rect = placementRect(placement, brief);
    expect(host.position.x + host.radius > rect.x && host.position.x - host.radius < rect.x + rect.width && host.position.y + host.radius > rect.y && host.position.y - host.radius < rect.y + rect.height).toBe(false);
  }
  const sample = sampleActor({ characterId: host.characterId, facing: host.facing, action: host.action, posture: 'work', heldObject: host.heldObject, elapsedMs: 0, reducedMotion: true });
  expect(sample.frameId).toContain('/book');
  expect(sample.frame.pixels).not.toEqual(sampleActor({ characterId: lin.id, facing: host.facing, action: host.action, posture: 'work', elapsedMs: 0, reducedMotion: true }).frame.pixels);
  expect(sample.frame.seatContact).toBeUndefined();
});

it('freezes reduced motion and rejects invalid clocks without altering other maps or actors', () => {
  expect(readingRoomHost(initialState(), { ...context, elapsedMs: NaN })).toEqual([]);
  expect(readingRoomHost(initialState(), { ...context, elapsedMs: -1 })).toEqual([]);
  expect(readingRoomHost(initialState(), { ...context, elapsedMs: 0, reducedMotion: true })).toEqual(readingRoomHost(initialState(), { ...context, elapsedMs: 5500, reducedMotion: true }));
  const { game, world } = releasedGame();
  for (const map of Object.values(worldMaps)) {
    const onMap = { ...world, mapId: map.id };
    const oldActors = sampleLife(planFor(map, game), lifeContext(game, onMap, 10000, false), navigationFor(map), restoreLife(onMap.life));
    const actors = actorsFor(map, game, onMap, 10000, false);
    expect(actors.filter(actor => actor.id !== 'reading-room.host')).toEqual(oldActors);
    if (map.id !== 'reading-room') expect(actors.some(actor => actor.id === 'reading-room.host')).toBe(false);
  }
});
