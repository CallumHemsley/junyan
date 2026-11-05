import {describe, expect, it} from 'vitest';
import {gifts, initialState, reduce, recoveryForTransition, validate, type State} from './rules';
const start = (day = 1) => reduce(reduce(initialState(), {type: 'sync'}, day), {type: 'tidy', value: true}, day);
const sync = (state: State, day: number) => reduce(state, {type: 'sync'}, day);

describe('rooftop care', () => {
  it('binds a new roof without replaying past days', () => {
    const state = sync(initialState(), 1_000_000);
    expect(state.day).toBe(1_000_000);
    expect(state.plants.flower.growth).toBe(0);
    expect(sync(state, 1_000_000)).toBe(state);
  });
  it('keeps wet advice safe from accidental repeated water commands', () => {
    const state = start();
    expect(reduce(state, {type: 'water', plant: 'flower'}, 1)).toBe(state);
    const waited = reduce(state, {type: 'wait', plant: 'flower'}, 1);
    expect(sync(waited, 2).plants.flower.growth).toBe(1);
    const watered = reduce(state, {type: 'water', plant: 'climber'}, 1);
    expect(reduce(watered, {type: 'water', plant: 'climber'}, 1)).toBe(watered);
    expect(sync(watered, 2).plants.climber.growth).toBe(1);
  });
  it('shows pooled water then droop and allows recovery without stage loss', () => {
    const wet = reduce(start(), {type: 'water-extra', plant: 'flower'}, 1);
    expect(wet.plants.flower.care).toBe('extra');
    const droop = sync(wet, 2);
    expect(droop.plants.flower.drooping).toBe(true);
    expect(droop.plants.flower.growth).toBe(0);
    const recovered = sync(reduce(droop, {type: 'water', plant: 'flower'}, 2), 3);
    expect(recovered.plants.flower.drooping).toBe(false);
    expect(recovered.plants.flower.growth).toBe(1);
  });
  it('settles only once across huge day gaps and never on rollback or invalid time', () => {
    const state = start();
    const later = sync(state, Number.MAX_SAFE_INTEGER);
    expect(later.plants.flower.growth).toBe(1);
    expect(sync(later, Number.MAX_SAFE_INTEGER)).toBe(later);
    for (const day of [1, NaN, Infinity, 0, 2.5]) expect(sync(later, day)).toBe(later);
    expect(reduce(state, {type: 'water', plant: 'tree'}, 2)).toBe(state);
  });
  it('rains on exposed pots after settling care and permits waiting for rain', () => {
    const state = sync(start(3), 4);
    expect(state.plants.flower.care).toBe('dry');
    expect(state.plants.tree.care).toBe('ready');
    expect(sync(state, 5).plants.tree.growth).toBe(1);
  });
  it('uses only one flower heat condition with visible reversible shade', () => {
    let state = start(3);
    state = reduce(state, {type: 'shade', site: 1}, 3);
    expect(sync(state, 4).plants.flower.result?.outcome).toBe('shade');
    state = reduce(state, {type: 'shade', site: 0}, 3);
    expect(sync(state, 4).plants.flower.growth).toBe(1);
  });
  it('moves into empty sites only and can move back', () => {
    const state = start();
    expect(reduce(state, {type: 'move', plant: 'flower', site: 2}, 1)).toBe(state);
    const moved = reduce(state, {type: 'move', plant: 'flower', site: 1}, 1);
    expect(moved.plants.flower.site).toBe(1);
    expect(reduce(moved, {type: 'move', plant: 'flower', site: 0}, 1).plants.flower.site).toBe(0);
  });
  it('caps growth, preserves mature decoration, and earns one durable gift', () => {
    let state = start();
    for (let day = 1; day <= 10; day++) {
      for (const plant of ['flower', 'climber', 'tree'] as const) state = reduce(state, {type: 'water', plant}, day);
      state = sync(state, day + 1);
    }
    expect(Object.values(state.plants).map(p => p.growth)).toEqual([3, 3, 3]);
    expect(gifts(state)).toEqual(['garden.planter']);
    expect(gifts(validate(JSON.parse(JSON.stringify(state)))!)).toEqual(['garden.planter']);
  });
  it('recovers related words only from successful meaningful transitions', () => {
    const state = start();
    const water = {type: 'water', plant: 'climber'} as const;
    const watered = reduce(state, water, 1);
    expect(recoveryForTransition(state, watered, water)).toContain('garden.dry');
    expect(recoveryForTransition(watered, reduce(watered, water, 1), water)).toEqual([]);
    const next = sync(watered, 2);
    expect(recoveryForTransition(watered, next, {type: 'sync'})).toEqual([]);
    const observed = reduce(next, {type: 'observe', plant: 'climber'}, 2);
    expect(recoveryForTransition(next, observed, {type: 'observe', plant: 'climber'})).toContain('garden.tall');
    expect(recoveryForTransition(observed, reduce(observed, {type: 'observe', plant: 'climber'}, 2), {type: 'observe', plant: 'climber'})).toEqual([]);
  });
  it('validates saves at the boundary including placements, growth and reward invariants', () => {
    expect(validate(initialState())).not.toBeNull();
    for (const value of [null, {}, {...start(), day: Infinity}, {...start(), planterEarned: true}]) expect(validate(value)).toBeNull();
    const duplicate = start(); duplicate.plants.tree.site = duplicate.plants.flower.site;
    expect(validate(duplicate)).toBeNull();
    const bad = start(); bad.plants.tree.growth = 4;
    expect(validate(bad)).toBeNull();
  });
});
