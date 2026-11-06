import { describe, expect, it } from 'vitest';
import { advanceFrameCadence, createFrameCadence } from './frame-cadence';

const PERIOD = 1000 / 30;
const timestampModes = {
  exact: (time: number, _index: number) => time,
  rounded: (time: number, _index: number) => Math.round(time * 10) / 10,
  jittered: (time: number, index: number) => time + [0.1, -0.1, 0, -0.1, 0.1, 0][index % 6],
  roundedJittered: (time: number, index: number) => Math.round(time * 10) / 10 + [0.1, -0.1, 0, -0.1, 0.1, 0][index % 6],
};

function simulate(hz: number, mode: keyof typeof timestampModes, durationMs = 10_000) {
  let state = createFrameCadence();
  const draws: number[] = [], indices: number[] = [];
  for (let index = 0; index <= Math.round(durationMs / 1000 * hz); index++) {
    const time = timestampModes[mode](index * 1000 / hz, index);
    const next = advanceFrameCadence(state, time);
    state = next.state;
    if (next.draw) { draws.push(time); indices.push(index); }
  }
  return { draws, indices, state };
}

describe('fixed 30fps render cadence', () => {
  for (const hz of [60, 90, 120]) for (const mode of Object.keys(timestampModes) as (keyof typeof timestampModes)[]) {
    it(`keeps stable phase at ${hz}Hz with ${mode} timestamps`, () => {
      const { draws, indices } = simulate(hz, mode);
      expect(draws).toHaveLength(301);
      const frameGaps = indices.slice(1).map((index, i) => index - indices[i]);
      expect(new Set(frameGaps)).toEqual(new Set([hz / 30]));
      const gaps = draws.slice(1).map((time, i) => time - draws[i]);
      expect(Math.min(...gaps)).toBeGreaterThan(PERIOD - .4);
      expect(Math.max(...gaps)).toBeLessThan(PERIOD + .4);
      expect(draws.at(-1)! - draws[0]).toBeCloseTo(10_000, 0);
    });
  }

  it('draws the first callback immediately and counts endpoints separately from intervals', () => {
    let state = createFrameCadence();
    const first = advanceFrameCadence(state, 127.6);
    expect(first.draw).toBe(true);
    state = first.state;
    expect(advanceFrameCadence(state, 127.6 + PERIOD - .31).draw).toBe(false);
    expect(advanceFrameCadence(state, 127.6 + PERIOD - .29).draw).toBe(true);
    const { draws } = simulate(120, 'exact', 60_000);
    expect(draws.length - 1).toBe(1800);
  });

  it('skips missed deadlines after a long stall without a catch-up burst', () => {
    const first = advanceFrameCadence(createFrameCadence(), 0);
    const stalled = advanceFrameCadence(first.state, 100_005);
    expect(stalled.draw).toBe(true);
    const next = advanceFrameCadence(stalled.state, 100_010);
    expect(next.draw).toBe(false);
    expect(advanceFrameCadence(next.state, 100_033.34).draw).toBe(false);
    expect(advanceFrameCadence(next.state, 100_038.34).draw).toBe(true);
    expect(stalled.state).toEqual({ phase: 'running', originMs: 100_005, lastTimestampMs: 100_005, lastDrawMs: 100_005, nextFrame: 1 });
  });

  it('does not burst when a stall ends just before an old phase deadline', () => {
    const state = advanceFrameCadence(createFrameCadence(), 0).state;
    const recovered = advanceFrameCadence(state, 100_032.9);
    expect(recovered.draw).toBe(true);
    expect(advanceFrameCadence(recovered.state, 100_033.34).draw).toBe(false);
    expect(advanceFrameCadence(recovered.state, 100_049.6).draw).toBe(false);
    expect(advanceFrameCadence(recovered.state, 100_066.23).draw).toBe(true);
  });

  it('preserves phase through ordinary lateness within one period', () => {
    const state = advanceFrameCadence(createFrameCadence(), 0).state;
    const late = advanceFrameCadence(state, PERIOD + .1);
    expect(late.state.phase === 'running' && late.state.originMs).toBe(0);
    expect(advanceFrameCadence(late.state, PERIOD * 2).draw).toBe(true);
  });

  it('handles callbacks just below, at and above the full-period stall boundary', () => {
    for (const offset of [-.01, 0, .01]) {
      const state = advanceFrameCadence(createFrameCadence(), 0).state;
      const time = 2 * PERIOD + offset;
      const recovered = advanceFrameCadence(state, time);
      expect(recovered.draw).toBe(true);
      expect(recovered.state.phase === 'running' && recovered.state.originMs).toBe(offset < 0 ? 0 : time);
      expect(advanceFrameCadence(recovered.state, time + .5).draw).toBe(false);
      expect(advanceFrameCadence(recovered.state, time + PERIOD).draw).toBe(true);
    }
  });

  it('prevents adjacent draws below the stall threshold while retaining phase', () => {
    const state = advanceFrameCadence(createFrameCadence(), 0).state;
    const recovered = advanceFrameCadence(state, 66.2);
    expect(recovered.draw).toBe(true);
    expect(recovered.state.phase === 'running' && recovered.state.originMs).toBe(0);
    expect(advanceFrameCadence(recovered.state, 66.67).draw).toBe(false);
    expect(advanceFrameCadence(recovered.state, 99.54).draw).toBe(true);
  });

  for (const hz of [60, 90, 120]) {
    it(`withstands adversarial timestamp phases at ${hz}Hz`, () => {
      for (const origin of [.05, .049999, 1_000_000_000.05]) for (const sign of [-1, 1]) {
        let state = createFrameCadence();
        const indices: number[] = [];
        for (let index = 0; index <= hz * 10; index++) {
          const time = Math.round((origin + index * 1000 / hz) * 10) / 10 + (index === 0 ? sign : -sign) * .1;
          const next = advanceFrameCadence(state, time);
          state = next.state;
          if (next.draw) indices.push(index);
        }
        expect(indices).toHaveLength(301);
        expect(new Set(indices.slice(1).map((index, i) => index - indices[i]))).toEqual(new Set([hz / 30]));
      }
    });
  }

  it('caps near-30Hz callbacks with inclusive endpoint accounting', () => {
    for (const hz of [29.97, 30, 30.03]) for (const mode of Object.keys(timestampModes) as (keyof typeof timestampModes)[]) {
      const { draws } = simulate(hz, mode, 60_000);
      const elapsed = draws.at(-1)! - draws[0];
      expect(draws.length - 1).toBeLessThanOrEqual(Math.floor((elapsed + .3) / PERIOD));
      expect((draws.length - 1) / elapsed * 1000).toBeGreaterThan(29.9);
    }
  });

  it('restarts immediately when the caller explicitly resets on visibility changes', () => {
    let state = advanceFrameCadence(createFrameCadence(), 100).state;
    state = advanceFrameCadence(state, 110).state;
    expect(advanceFrameCadence(state, 120).draw).toBe(false);
    const resumed = advanceFrameCadence(createFrameCadence(), 120);
    expect(resumed.draw).toBe(true);
    expect(advanceFrameCadence(resumed.state, 130).draw).toBe(false);
  });

  it('ignores repeated, backward and nonfinite timestamps without changing schedule', () => {
    const initial = Object.freeze(createFrameCadence());
    for (const time of [NaN, Infinity, -Infinity]) {
      expect(advanceFrameCadence(initial, time)).toEqual({ state: initial, draw: false });
    }
    const state = Object.freeze(advanceFrameCadence(initial, 200).state);
    for (const time of [200, 199, -1, NaN, Infinity, -Infinity]) {
      const next = advanceFrameCadence(state, time);
      expect(next.state).toBe(state);
      expect(next.draw).toBe(false);
    }
    expect(advanceFrameCadence(state, 200 + PERIOD).draw).toBe(true);
  });

  it('accepts a finite origin without mutating the supplied state', () => {
    const state = Object.freeze(advanceFrameCadence(createFrameCadence(), -50).state);
    const before = structuredClone(state);
    expect(advanceFrameCadence(state, -25).draw).toBe(false);
    expect(state).toEqual(before);
  });
});
