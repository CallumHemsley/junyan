# 0063 evidence and append-only decisions

## 2026-11-05 — starting at 66ac123

Owner: Codex cloud agent 0063. Branch `codex/0063-restaurant-background-sounds`, checkout `/workspace/junyan-0063`, strict ports 5414/5415.

Read AGENTS, ticket workflow, assigned ticket, accepted decisions 0001–0004, build recommendation, design system/tokens/mockup brief, foreground playback and offline build code. No bundled pstack found under /workspace or /opt; using the supplied harness-adapted poteto/autopilot discipline.

Current surface has foreground speech only. The offline plugin precaches every dist file and uses scope-relative URLs; new public assets need no cache/schema/dependency change. Shared App.tsx/styles/playback lease belongs to 0061 and is untouched.

Compared shapes: a WebAudio scheduler offers randomized separate events but introduces context/timer ownership; one long native looping media element preserves offline decoding and one playback owner with less state. Choose one 73-second original prepared mix with irregular event spacing. Native codec loop boundary is not guaranteed sample-exact; quiet matched endpoints reduce the seam, which still needs listening verification.

State shape: `{restaurant, visible, unlocked, muted, level, speaking}`. Playback intent requires restaurant + visible + user gesture + nonzero unmuted level. A pending/playing flag prevents duplicate play calls; a generation invalidates stale promise settlements; policy/load failure blocks automatic retries until a new gesture. Speech ducking scales ambience only and never touches foreground playback.

Original procedural non-speech sound design will use filtered noise for quiet steam/preparation, inharmonic decays for ceramic cup contacts and modulated noise/bubbles for pouring. No samples, copied music, external service, speech, dependencies or schema changes. These are intended auditory metaphors, not claimed field recordings. Subjective resemblance and mix approval remain unverified: this agent cannot perceive audio, and must not substitute waveform checks for listening.

## 2026-11-05 — standalone checkpoint

Original Ogg is 339,123 bytes, 73 seconds mono 24 kHz. Implemented controller and six meaningful lifecycle/ownership tests. `node_modules/.bin/vitest run`: 12 files / 175 tests pass, including 13 unchanged foreground playback tests. First TypeScript run caught an overly broad fixture preload string; fixed to literal type. `pnpm_config_verify_deps_before_run=false pnpm build`: PASS (TypeScript + Vite; pre-existing third-party Zod annotation warnings). Plain pnpm initially tried automatic reinstallation and stopped at its esbuild script approval gate; frozen install populated dependencies, then per-command pnpm dependency-check override allowed scripts. No scripts approved; no dependency/lockfile/config change retained.

App.tsx, shared styles, and playback.ts untouched. Ambience is not yet audible in the game; controls, persisted preference, visibility/page lifecycle wiring and real speech ducking integration await root's 0061 lease release. No listening, screenshots or game journey claimed at this checkpoint. Ticket remains doing; not ready to merge.
