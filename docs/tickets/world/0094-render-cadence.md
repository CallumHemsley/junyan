# world/0094 — deterministic render cadence

Status ACTIVE. Owner existing native Sol6.1 medium /root/restaurant_world_art, reassigned focused follow-up. Branch codex/0094-render-cadence; isolated worktree /workspace/junyan-0094; optional evidence strict port5506. Source base38361754979f953bd18e8fa5f2348cac3b207faa. Highest qualified ticket0093 checked; no remote0094 branch.

Lease ONLY new src/world/frame-cadence.ts, src/world/frame-cadence.test.ts, docs/evidence/world/0094/** and this ticket. NO WorldViewport/world.css edits (0093 exclusive), game/life/movement/time/save/schema/renderer/dependency changes. No FPS product setting.

Root diagnostic: reset-to-now 30Hz throttle at ordinary60Hz/rounded/jittered timestamps repeatedly draws every third RAF (~20Hz).10s counts202/200/200 with50ms gaps. This is scheduling evidence, not rendering CPU attribution or actual App acceptance.

Narrow deterministic API:
- export type FrameCadence (readonly schedule state, no global clock)
- createFrameCadence(): FrameCadence
- advanceFrameCadence(state: FrameCadence, rafTimestampMs: number): {state: FrameCadence; draw: boolean}
- createFrameCadence resets explicitly on visibility change/resume; caller passes RAF timestamps, never game elapsed time.

Fixed30fps target. Phase-preserving deadline with small documented tolerance derived from supported timestamp rounding/jitter, not unexplained epsilon. At most one draw per callback; skip missed deadlines after stalls, no catch-up burst. Specify first-frame/reset/backward/nonfinite/equal timestamp behavior; bounded O(1), pure state.

Tests: exact60/90/120Hz,0.1ms rounded and bounded ±0.1ms jitter, long stalls, explicit visibility reset, one draw per RAF, near30Hz with endpoint accounting, stable cadence rather than16.7/50ms alternation. Record source/repro and limits. Independent actual RAF/draw completions must be compared separately from draw duration/CPU.

Handback:0093 alone adopts helper into exclusive viewport loop, preserving hidden-tab suspension, movement/camera/life timing, selected-target behavior and383 day-summary CSS/callbacks. Do not publish unrelated held0091 audit evidence.
