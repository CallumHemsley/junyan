---
id: 8
title: Mandarin voice bake-off and the TTS pipeline
status: doing
priority: medium
type: explore
created: 2026-10-31
---

## Why

Under decision 0001 the audio carries the tones, so voice quality is core, not polish. The research puts MiniMax Speech 2.8 and Fish Audio S2 Pro at the top for Mandarin and says MiniMax exposes pinyin tone overrides, but every comparison found was vendor-run. We need our own ears on our own lines.

## Done when

- The same twenty lines from [[ideas/prototype-counter-kit]], including polyphones (行, 得, 了, 还, 长) and tone-sandhi cases (不是, 一个, 你好), rendered through MiniMax 2.8-hd, Fish S2 Pro, and one cheap baseline (OpenAI or Azure), with one fixed voice per regular.
- A blind ranking by a native speaker (or two), recorded in the ticket, on naturalness, tone correctness and character fit.
- A chosen provider, and a script that renders a lines JSON to audio files keyed by content hash, applying pinyin overrides from the token data, with cost per line recorded.
- A note on whether the grandmother and the child need distinct voices or just rate and pitch.

## Notes

- Working spec (provider contracts, pinyin-override syntax, script design, 20-line test set with expected spoken pinyin): [[ideas/research-voice-pipeline]].
- Comparison table and API details in [[ideas/research-ai-assets]] §6.
- Fish bills per UTF-8 byte, so Chinese costs three times the headline rate.
- Can run through Codex; it is self-contained.

### Sample preparation — 2026-11-01

- Owner: Codex orchestrator; branch `codex/0008-voice-bakeoff`; worktree `/Users/callumhemsley/Personal/junyan`. No dev server needed for offline audio preparation.
- User requested real MiniMax, Fish Audio and OpenAI samples for native Mandarin review. Provider work reserved as tickets 0013–0015, using Sol 6.1 medium agents in separate worktrees.
- No provider credentials were present in the process environment at start. Never substitute prototype/system speech for missing provider output.

- Shared 20-line corpus extracted to `scripts/voice-samples/lines.json`; plain Hanzi first pass, pronunciation notes remain reviewer metadata. Secure credential request timed out; no paid calls made. Three provider agents are running.

- User steered toward local open source models. Cancelled API-provider prep; tickets 0016–0017 cover real Qwen3-TTS and Kokoro synthesis on this Mac without API keys.

- Kokoro delivered: 40 real local WAVs, two voices × twenty lines. Integrated generator commit `7658d4e`; independently decoded WAVs, verified hashes/corpus, silence/clipping limits and built a provider-blind standalone listening page plus CSV export under `output/voice-samples/review/`. JavaScript syntax and CSV Unicode/escaping checks passed. Native listening is still pending; known G2P concerns remain in the provider README. Qwen generation is still in progress.
