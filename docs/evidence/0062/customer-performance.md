# 0062 customer performance evidence

## Ownership and scope

- Owner: Codex cloud worker, ticket 0062; branch `codex/0062-natural-customer-performances`.
- Checkout: `/workspace/junyan-0062`; base `66ac123` from current `origin/main` on 2026-11-05.
- Reserved strict ports: Vite 5412, preview 5413. Start with `pnpm exec vite --host 0.0.0.0 --port 5412 --strictPort`; no server started in this checkpoint.
- Production content, voices, audio manifest and scene remain reserved to 0058 then 0060 / 0059. No changes to those files, dependencies, schema, doctor, ticket 0057, or `.claude`.

## Append-only decisions and observations

2026-11-05: Read AGENTS, ticket README, 0062, accepted decisions 0001–0004, build recommendation, design-system and character direction, character and content-audio documentation. No bundled pstack located; follow supplied harness steps. First boundary: isolate review/export tooling from production synthesis and scene edits. State shapes: review row `{character, voiceId, role, lineId, text, audio, sha256, listening}`; generator inputs remain existing `{characters, orders}` and voice config. No new production contract.

2026-11-05: User reports Ryan+calm and Aiden doctor takes rejected on pinned Qwen 0.6B. Do not extrapolate prompt effectiveness from the adapter accepting `instruct`. Establish model support and audible benefit before producing a cast-wide batch. Seek ordinary ordering speech, not exaggerated acting. This is user feedback, not worker listening evidence.

2026-11-05: Static findings (not auditory diagnoses): full restaurant lines concatenate tokens without punctuation; this may affect phrase boundaries, but needs an A/B before any text change. `personality` is editorial metadata, never synthesis input. Qwen adapter rejects speed other than 1; Kokoro rejects instructions. Compare punctuation at the line boundary against unchanged baseline before considering broader model/runtime changes. Do not alter global sampling, frontend or generator VERSION merely to audition a performance.

2026-11-05: `customerPose` sets `greeting: !eating`; backpack arm remains raised before checkout/served (`renderer.js` lines 45–48, 154). All other characters share a phase-based seated pose except glasses lean. This warrants in-context visual review, not an unverified claim that the gesture is unpleasant. Scene owner must approve any change; a bounded greeting would require explicit elapsed state/time, not a hidden render timer.

2026-11-05: Exported all 24 line references (12 social lines, 12 orders), copied actual baseline WAVs with hashes, and made a manual-play HTML index. No autoplay, generation, model downloads or production edits. Listening status remains NOT REVIEWED for every row.

## Cast review targets

These are hypotheses to assess, not things heard by this worker.

| Customer | Retain | Listen/observe across greeting, every order, retry, thanks |
| --- | --- | --- |
| 林姐 / Serena | warm familiar adult neighbour | `早上好`, `不急慢慢来`, `麻烦你了谢谢`: ordinary small courtesy, phrase boundary before 谢谢; no soothing recital or overemphasis |
| 小李 / Yunxi | brisk polite office worker | `早`, `不对再看看吧`, `谢谢明天见`: short greeting, clear correction without scolding, natural goodbye; brisk must not mean clipped consonants |
| 张老师 / Uncle_Fu | mellow precise retired teacher | `早上好呀`, `慢慢来再看看`, `辛苦了谢谢`: no conspicuous drawl, theatrical elder mannerisms or patronizing correction |
| 小周 / Xiaobei | bright sociable adult student | `你好呀`, `不对呀再看看吧`, `谢谢你呀`: light particles without a cartoon bounce; inspect raised hand during ordering and retry |

For every order: exact words and quantities, Mandarin tones and sandhi, no missing/repeated words, natural lexical stress and sentence ending. Compare transitions between speakers at unchanged playback gain; record level issues separately for 0057.

## Mac generation handoff

1. Check out this branch in a new Mac worktree. Run `python3 scripts/ticket-0062/prepare-audition.py --output output/0062-audition`. Open its `index.html` manually for all-four baseline review; log line ID, actual audible issue, timestamp, listener and listening setup. The pack is not the playable restaurant and cannot satisfy contextual acceptance alone.
2. Use the parent's already available Qwen environment, offline; do not install a new model. Inspect installed `mlx_audio` CustomVoice implementation and cached model config/model card for the exact pinned 0.6B revision. Record whether instruction conditioning is implemented and supported by this model size, with source paths/lines. An accepted keyword or differing hash is not proof. If instructions are unsupported or listening gives no useful effect, stop prompt auditions and report the limit; larger models or paid services require an explicit choice and existing authorized runtime.
3. First useful same-identity comparison: duplicate the exported content/voices into `output/0062-punctuation/`, adding only punctuation via each affected line's `text` field (leave tokens, IDs, speakers and presets unchanged). Start with a documented problematic phrase for each customer, not a full batch. Use `--plan` to inspect intended differences before generation. These are generator fixtures, not schema-approved production game content. Inspect/compare all resulting takes, including an unchanged baseline; discard changes with no audible improvement.
4. Exact isolated commands, from the worktree (set `QWEN_PY` and `KOKORO_PY` to the parent's existing interpreter paths):

```sh
python3 scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --plan
HF_HUB_OFFLINE=1 "$QWEN_PY" scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --engine qwen --write-content
HF_HUB_OFFLINE=1 "$KOKORO_PY" scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --engine kokoro --write-content
```

Run sequentially. Kokoro must use its separate existing runtime, with the pinned frontend/model cache. Missing runtime/cache is a blocker, not permission to install a substitute. Generated references are `/audio/` URLs; do not put audition references in production before copying the verified manifest/WAVs together after ownership release.

5. Capture actual before/after listening notes and files; present all four to Callum for review. No subjective approval can be inferred from signal metrics. Once shared ownership is released, make only approved production changes, coordinate level effects with 0057, then rerun rules/content, audio/offline, build and full opening → three customers → change → journal journey on strict ports 5412/5413. Automated browser audio stays muted; deliberate audition playback is manual. Capture phone/desktop screenshots and a short video with sound; inspect both screenshots and console. Independent review of exact patch on current main precedes any merge.

## Executed validation

- `python3 scripts/ticket-0062/prepare-audition.py --output output/0062-audition`: PASS, 24 references, 4 customers; real baseline WAV copies and SHA-256 metadata.
- `python3 scripts/content-audio.py --plan > output/0062-audition/production-plan.jsonl`: exit 0; read-only production cache plan.
- `python3 scripts/content-audio.py --self-check`: PASS, mocked pipeline safety/routing checks, not real synthesis.
- Plain `pnpm test` / `pnpm build`: initially blocked by pnpm refusing a symlinked modules directory; removed only our symlink and copied existing installed dependencies into our own checkout. No install or dependency-file changes.
- `pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false test`: PASS, 169 tests / 11 files.
- `pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false build`: PASS; two dependency PURE-comment warnings.
- Host: x86_64 Linux; Python reports mlx/kokoro/torch absent. No Mac GPU connection configured. No subjective listening, candidate synthesis, browser journey, screenshot inspection, audio/offline browser check or video recorded by this worker.

## Evidence locations and verdict

- Existing audible baseline files: `/workspace/junyan-0062/output/0062-audition/*.wav` (ignored copies of shipped assets).
- Manual listening index: `/workspace/junyan-0062/output/0062-audition/index.html`.
- Hashes and review inventory: `/workspace/junyan-0062/output/0062-audition/baseline.json`.
- No candidate WAVs, screenshots or video yet. No listening approval.
- BLOCKED for ticket completion: Mac model-capability inspection and real auditions/listening; shared production ownership release; Callum all-four review; contextual browser evidence and independent exact-patch review. This preparation checkpoint is reviewable but does not implement or complete 0062.
