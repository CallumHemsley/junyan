const FRAME_INTERVAL_MS = 1000 / 30;
const TIMESTAMP_RESOLUTION_MS = .1;
const TIMESTAMP_JITTER_MS = .1;
// Quantization and jitter affect both the phase origin and the current timestamp.
const DEADLINE_TOLERANCE_MS = 2 * (TIMESTAMP_RESOLUTION_MS / 2 + TIMESTAMP_JITTER_MS);
// Two accepted draws can occupy opposite ends of the deadline tolerance window.
const DRAW_PAIR_TOLERANCE_MS = 2 * DEADLINE_TOLERANCE_MS;

export type FrameCadence =
  | Readonly<{ phase: 'unstarted' }>
  | Readonly<{ phase: 'running'; originMs: number; lastTimestampMs: number; lastDrawMs: number; nextFrame: number }>;

export function createFrameCadence(): FrameCadence {
  return { phase: 'unstarted' };
}

export function advanceFrameCadence(state: FrameCadence, rafTimestampMs: number): { state: FrameCadence; draw: boolean } {
  if (!Number.isFinite(rafTimestampMs)) return { state, draw: false };
  if (state.phase === 'unstarted') {
    return { state: { phase: 'running', originMs: rafTimestampMs, lastTimestampMs: rafTimestampMs, lastDrawMs: rafTimestampMs, nextFrame: 1 }, draw: true };
  }
  if (rafTimestampMs <= state.lastTimestampMs) return { state, draw: false };
  const current = { ...state, lastTimestampMs: rafTimestampMs };
  const elapsedMs = rafTimestampMs - state.originMs;
  if (elapsedMs + DEADLINE_TOLERANCE_MS < state.nextFrame * FRAME_INTERVAL_MS) return { state: current, draw: false };
  if (rafTimestampMs - state.lastDrawMs < FRAME_INTERVAL_MS - DRAW_PAIR_TOLERANCE_MS) return { state: current, draw: false };
  if (elapsedMs >= (state.nextFrame + 1) * FRAME_INTERVAL_MS) {
    return { state: { phase: 'running', originMs: rafTimestampMs, lastTimestampMs: rafTimestampMs, lastDrawMs: rafTimestampMs, nextFrame: 1 }, draw: true };
  }
  return { state: { ...current, lastDrawMs: rafTimestampMs, nextFrame: state.nextFrame + 1 }, draw: true };
}
