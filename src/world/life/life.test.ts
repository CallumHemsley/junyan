import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { content } from '../../content';
import { compileLife, entranceExclusions, initialLifeState, interactLife, nearbyLife, restoreLife, sampleLife } from './index';
import type { LifeContext, LifeMap, Navigation } from './model';

const map = (): LifeMap => ({
  id: 'park', entrances: [{ id: 'from-town', facing: 'south', position: { x: 1, y: 1 } }],
  exits: [{ id: 'to-town', targetMapId: 'town', targetEntranceId: 'from-park', kind: 'path', rect: { x: 0, y: 0, width: .5, height: .5 } }],
  npcHooks: [{ id: 'park.teacher', characterId: 'zhang-laoshi', position: { x: 4, y: 4 }, route: [{ x: 8, y: 4 }, { x: 8, y: 8 }] }],
  landmarks: [{ id: 'park.pond', kind: 'pond', position: { x: 4, y: 6 } }],
});
const navigation: Navigation = {
  canStand: (p, radius) => p.x >= radius && p.y >= radius && p.x <= 12 - radius && p.y <= 12 - radius,
  canWalk: (a, b, radius) => navigation.canStand(a, radius) && navigation.canStand(b, radius),
  route: (_a, b) => [b],
};
const context = (elapsedMs = 0): LifeContext => ({ day: 1, elapsedMs, seed: 42, player: { x: 11, y: 11 }, reducedMotion: false });

describe('world life routes and motion', () => {
  it('returns repeatable visible motion, valid footprints, and closed routes on repeated visits', () => {
    const plan = compileLife(map(), navigation);
    expect(plan.diagnostics).toEqual([]);
    const positions = new Set<string>();
    for (let t = 0; t < 180000; t += 400) {
      const actors = sampleLife(plan, context(t));
      expect(actors).toEqual(sampleLife(plan, context(t)));
      expect(actors).toHaveLength(1);
      expect(navigation.canStand(actors[0].position, actors[0].radius)).toBe(true);
      positions.add(JSON.stringify(actors[0].position));
    }
    expect(positions.size).toBeGreaterThan(25);
    const duration = plan.actors[0].durationMs;
    const first = sampleLife(plan, context(0))[0].position;
    const again = sampleLife(plan, context(duration))[0].position;
    expect(again.x).toBeCloseTo(first.x, 8);
    expect(again.y).toBeCloseTo(first.y, 8);
  });

  it('rejects swept collision even when route endpoints are safe', () => {
    const nav: Navigation = { ...navigation, canWalk: (a, b) => !(Math.min(a.x, b.x) < 6 && Math.max(a.x, b.x) > 6) };
    const plan = compileLife(map(), nav);
    expect(plan.actors).toEqual([]);
    expect(plan.diagnostics[0].reason).toBe('unreachable-route-or-entrance-crossing');
  });

  it('rejects a route across door/stair triggers and safe arrival clearances', () => {
    const input = map();
    input.exits = [{ id: 'to-town', targetMapId: 'town', targetEntranceId: 'from-park', kind: 'path', rect: { x: 5, y: 3, width: 1, height: 2 } }];
    expect(compileLife(input, navigation).actors).toEqual([]);
    input.exits = [];
    input.entrances = [{ id: 'from-town', facing: 'south', position: { x: 6, y: 4 } }];
    expect(compileLife(input, navigation).actors).toEqual([]);
    expect(entranceExclusions(input)).toHaveLength(1);
  });

  it('passes entrance exclusions to the shared planner and accepts a collision-free detour', () => {
    const input = map();
    input.npcHooks = [{ id: 'park.walker', characterId: 'xiao-li', position: { x: 3, y: 5 }, route: [{ x: 9, y: 5 }] }];
    input.entrances = [{ id: 'from-town', facing: 'south', position: { x: 6, y: 5 } }];
    const nav: Navigation = { ...navigation, route: (a, b, _radius, exclusions) => {
      expect(exclusions.length).toBeGreaterThan(0);
      return [{ x: a.x, y: 8 }, { x: b.x, y: 8 }, b];
    } };
    const plan = compileLife(input, nav);
    expect(plan.actors).toHaveLength(1);
    for (let t = 0; t < 100000; t += 100) {
      const pose = sampleLife(plan, context(t))[0];
      expect(Math.abs(pose.position.x - 6) < .79 && Math.abs(pose.position.y - 5) < .79).toBe(false);
    }
  });

  it('does not invent residents for unknown hook IDs or duplicate hook identities', () => {
    const input = map();
    input.npcHooks = [...input.npcHooks, input.npcHooks[0], { ...input.npcHooks[0], id: 'park.unknown', characterId: 'random-person' }];
    const plan = compileLife(input, navigation);
    expect(plan.actors).toHaveLength(1);
    expect(plan.diagnostics.map(item => item.reason)).toEqual(['duplicate-hook', 'unknown-character']);
  });

  it('preserves cat story authority and prevents residents duplicating active service', () => {
    const input = map();
    input.npcHooks = [...input.npcHooks, { id: 'park.white', characterId: 'white-cat', position: { x: 3, y: 3 }, route: [{ x: 7, y: 3 }] }];
    const plan = compileLife(input, navigation);
    const ctx = { ...context(20000), excludedCharacterIds: ['zhang-laoshi'], cats: { story: { node: 'search' as const }, repeat: { status: 'idle' as const } } };
    const actors = sampleLife(plan, ctx);
    expect(actors).toHaveLength(1);
    expect(actors[0].position).toEqual({ x: 3, y: 3 });
    expect(actors[0].action).toBe('idle');
    const reunited = { ...ctx, cats: { ...ctx.cats, story: { node: 'reunited' as const, day: 1 } } };
    expect(new Set(Array.from({ length: 100 }, (_, i) => JSON.stringify(sampleLife(plan, { ...reunited, elapsedMs: i * 1000 })[0].position))).size).toBeGreaterThan(5);
  });

  it('keeps reduced-motion poses static while retaining traversable world positions', () => {
    const plan = compileLife(map(), navigation);
    const normal = sampleLife(plan, context(22000))[0];
    const reduced = sampleLife(plan, { ...context(22000), reducedMotion: true })[0];
    expect(reduced.position).toEqual(normal.position);
    expect(reduced.phaseMs).toBe(0);
    expect(sampleLife(plan, context(Number.NaN))).toEqual([]);
  });
});

describe('world proximity and repeat visits', () => {
  it('offers actor actions and discoveries only within reach and unobstructed sight', () => {
    const plan = compileLife(map(), navigation);
    const actor = sampleLife(plan, context())[0];
    expect(nearbyLife(plan, [actor], actor.position, navigation).some(item => item.kind === 'greet')).toBe(true);
    expect(nearbyLife(plan, [actor], { x: 12, y: 0 }, navigation)).toEqual([]);
    expect(nearbyLife(plan, [actor], actor.position, { ...navigation, canWalk: () => false })).toEqual([]);
  });

  it('rechecks proximity when activating stale affordances', () => {
    const plan = compileLife(map(), navigation);
    const state = initialLifeState();
    const result = interactLife(state, plan, [], context(), 'park.pond/inspect', navigation);
    expect(result.state).toBe(state);
    expect(result.events).toEqual([]);
  });

  it('persists a discovery once and permits repeat nonverbal reactions on later visits', () => {
    const plan = compileLife(map(), navigation);
    const ctx = { ...context(1000), player: { x: 4, y: 5.5 } };
    const first = interactLife(initialLifeState(), plan, [], ctx, 'park.pond/inspect', navigation);
    expect(first.events.map(event => event.type)).toEqual(['discovered', 'reacted']);
    expect(first.line).toBeUndefined();
    expect(first.state.reactions[0].reaction).toBe('ripple');
    const saved = restoreLife(JSON.parse(JSON.stringify(first.state)));
    const again = interactLife(saved, plan, [], { ...ctx, day: 3, elapsedMs: 3000 }, 'park.pond/inspect', navigation);
    expect(again.events.map(event => event.type)).toEqual(['reacted']);
    expect(again.state.discoveries).toEqual([{ mapId: 'park', landmarkId: 'park.pond', day: 1 }]);
    expect(again.state.reactions).toHaveLength(1);
    const retry = interactLife(again.state, plan, [], { ...ctx, day: 3, elapsedMs: 3000 }, 'park.pond/inspect', navigation);
    expect(retry.state).toBe(again.state);
  });

  it('reuses each regular greeting unchanged with existing audio and segmented words', () => {
    for (const character of content.characters) {
      const input = map();
      input.npcHooks = [{ ...input.npcHooks[0], characterId: character.id }];
      const plan = compileLife(input, navigation), actors = sampleLife(plan, context());
      const ctx = { ...context(), player: actors[0].position };
      const result = interactLife(initialLifeState(), plan, actors, ctx, `${actors[0].id}/greet`, navigation);
      expect(result.line).toBe(character.greeting);
      expect(result.line!.tokens.length).toBeGreaterThan(0);
      expect(existsSync(`public${result.line!.audio}`)).toBe(true);
      result.line!.tokens.forEach(word => expect(existsSync(`public${word.audio}`)).toBe(true));
    }
  });

  it('contains invalid nested life saves without changing unrelated game state', () => {
    expect(restoreLife({ version: 17 })).toEqual(initialLifeState());
    expect(restoreLife({ version: 1, discoveries: [{ mapId: 'x', landmarkId: 'y', day: -1 }], reactions: [] })).toEqual(initialLifeState());
    const item = { mapId: 'x', landmarkId: 'y', day: 1 };
    expect(restoreLife({ version: 1, discoveries: [item, item], reactions: [] })).toEqual(initialLifeState());
  });
});

it('advances only explicit visible play time and restores it without real-clock catchup', async () => {
  const { advanceLife } = await import('./interactions');
  const first = advanceLife(initialLifeState(), 1600, true);
  expect(first.elapsedMs).toBe(1600);
  expect(advanceLife(first, 86400000, false)).toBe(first);
  expect(advanceLife(first, Number.NaN, true)).toBe(first);
  expect(restoreLife(JSON.parse(JSON.stringify(first))).elapsedMs).toBe(1600);
});

it('sits with a walking cat, persists the pause, then resumes its route without teleporting', () => {
  const input = map();
  input.npcHooks = [{ id: 'park.black', characterId: 'black-cat', position: { x: 4, y: 4 }, route: [{ x: 8, y: 4 }] }];
  const plan = compileLife(input, navigation);
  let elapsedMs = 0;
  while (sampleLife(plan, context(elapsedMs))[0].action !== 'walk') elapsedMs += 100;
  const actor = sampleLife(plan, context(elapsedMs))[0];
  const ctx = { ...context(elapsedMs), player: actor.position };
  const result = interactLife(initialLifeState(), plan, [actor], ctx, `${actor.id}/sit`, navigation);
  const restored = restoreLife(JSON.parse(JSON.stringify(result.state)));
  const seated = sampleLife(plan, { ...ctx, elapsedMs: elapsedMs + 5000 }, navigation, restored)[0];
  expect(seated.position).toEqual(actor.position);
  expect(seated.activity).toBe('sit');
  expect(seated.action).toBe('idle');
  const resumed = sampleLife(plan, { ...ctx, elapsedMs: elapsedMs + 9100 }, navigation, restored)[0];
  expect(resumed.action).toBe('walk');
  expect(Math.hypot(resumed.position.x - actor.position.x, resumed.position.y - actor.position.y)).toBeCloseTo(.06, 5);
});

it('rejects authoritative habitat positions inside safe-arrival clearance', () => {
  const input = map(), plan = compileLife(input, navigation);
  const actors = sampleLife(plan, { ...context(), habitats: [{ characterId: 'zhang-laoshi', position: { x: 1, y: 1 }, activity: 'sit' }] }, navigation);
  expect(actors).toEqual([]);
});

it('preserves a validated authoritative habitat even when a decorative cat route is invalid', () => {
  const input = map();
  input.npcHooks = [{ id: 'park.white', characterId: 'cats.white', position: { x: 4, y: 4 }, route: [{ x: -1, y: -1 }] }];
  const plan = compileLife(input, navigation);
  expect(plan.actors).toEqual([]);
  expect(plan.diagnostics[0].reason).toBe('blocked-route-stop');
  const actors = sampleLife(plan, { ...context(), habitats: [{ characterId: 'white-cat', position: { x: 5, y: 4 }, activity: 'sit' }] }, navigation);
  expect(actors).toHaveLength(1);
  expect(actors[0].position).toEqual({ x: 5, y: 4 });
  expect(actors[0].action).toBe('idle');
});

it('does not duplicate a named regular through two canonical aliases on one map', () => {
  const input = map();
  input.npcHooks.push({ ...input.npcHooks[0], id: 'park.duplicate-teacher', characterId: 'glasses' });
  const plan = compileLife(input, navigation);
  expect(plan.actors).toHaveLength(1);
  expect(plan.diagnostics.map(item => item.reason)).toContain('duplicate-character');
});
