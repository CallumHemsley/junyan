# Local content audio

Generate game speech without keys or paid services. The script reads
`src/content/content.json` and `src/content/voices.json`; it never edits the voice
presets. Native Mandarin review is still required: technical validation cannot
prove that a take says exactly the authored text or has correct tones.

## Start here

```sh
python3 scripts/content-audio.py --self-check
python3 scripts/content-audio.py --plan
```

Both commands use only the Python standard library. `--plan` prints one JSON
object per distinct asset, including engine, voice IDs, reference count and cache
status. It imports no models, downloads nothing and writes nothing (even with
`--write-content`). The parent content/voice contract must exist before planning
real game content; unknown customer names or voice IDs fail before generation.

Run each engine in its own environment. The auditioned MLX/Qwen and
PyTorch/Kokoro environments have incompatible Torch/Transformers requirements;
do not install both requirement files into the same environment.

```sh
python3.12 -m venv output/content-qwen-venv
output/content-qwen-venv/bin/python -m pip install -r scripts/voice-samples/qwen-requirements.txt
python3.12 -m venv output/content-kokoro-venv
output/content-kokoro-venv/bin/python -m pip install -r scripts/voice-samples/kokoro-local-requirements.txt

output/content-qwen-venv/bin/python scripts/content-audio.py --engine qwen --limit 1
output/content-kokoro-venv/bin/python scripts/content-audio.py --engine kokoro --limit 1
```

Use Apple Silicon for MLX/Qwen; Kokoro runs on CPU. `--limit N` limits attempted
new/replacement assets, not cached assets or model retries. Each asset has at most
three attempts. Omit the limit for the full batch. Generation writes audio and
manifest by default, but only `--write-content` changes JSON references:

```sh
output/content-qwen-venv/bin/python scripts/content-audio.py --engine qwen --write-content
output/content-kokoro-venv/bin/python scripts/content-audio.py --engine kokoro --write-content
python3 scripts/content-audio.py --plan
```

Run the two commands sequentially, not concurrently. A nonblocking output lock
prevents competing writers to one audio directory. Keep the tiny
`public/audio/.content-audio.lock` file local/untracked; do not remove it while a
writer runs. Commit wanted WAVs, `manifest.json` and updated content together,
not virtual environments, smoke fixtures or lock files. The final plan should
show every asset cached before treating a game batch as complete. A successful
partial/limited run can still have pending assets.

For an isolated smoke run, use all three path options:

```sh
python3 scripts/content-audio.py --content output/smoke/content.json --voices output/smoke/voices.json --output output/smoke/audio --plan
```

The same options work in an engine environment. The script always emits game
URLs under `/audio/`, so use default `public/audio` for production content, or
copy the complete verified smoke assets/manifest there before publishing smoke
content. Never write production content pointing at an ignored smoke directory.

## Add a voice, character or line

1. **Voice:** add a preset to `voices.json` under a stable ID. It needs `engine`,
   `model`, full 40-character commit `revision`, `speaker`, `language`, `speed`
   and `instructions` (explicitly `null` when unused). Changing a preset causes
   affected assets to get new names. Changing an editorial voice ID alone does
   not change the audio identity. `wordVoice` selects shared dictionary speech.
2. **Character:** add `{id, name, voiceId, personality, greeting, thanks, retry}`
   to `content.characters`. `personality` is editorial English, not model input. Also provide `appearance`
   with RGB `shirt` and `hair` tuples and a supported `accessory` (`bun`, `tie`,
   `glasses`, or `backpack`); the game renders these through Pixel Plays.
   Match each order's `customer` to exactly one character's display `name`.
3. **Line:** author `{id, tokens: Word[], audio}` in the appropriate character or
   order. Tokens retain authored `id`, `hanzi`, `pinyin`, `gloss`, `audio`.
   Every line speaks the exact NFC-normalized concatenation of token `hanzi`;
   include punctuation in authored tokens if desired. No text segmentation,
   English translation, personality instructions or pinyin is appended to speech.
4. **Generate:** run the plan, then each affected engine with `--write-content`.
   Listen to changed lines and dictionary words before shipping them.

For a tooling-only extension check, use disposable copies of both JSON files and
an empty temporary audio directory with `--plan`. Add a nested line/word or a
voice alias there: new Hanzi/pinyin/presets should introduce pending assets,
while a renamed editorial voice ID with an identical preset should retain asset
names. Planning does not validate the game's complete Zod schema; validate
authored game content separately. Do not use real synthesis to test discovery.

Character greetings/reactions and their order lines use that character's voice.
Every dictionary word, including all nested line tokens and food words, uses
`wordVoice`. Legacy top-level `thanks`/`retry` lines use `wordVoice`. Recursive
walking discovers additional nested words/lines without changes to the script;
objects with `tokens` are lines, objects with `id`/`hanzi`/`audio` are words.
`help.welcome`, `help.lookup`, `help.steps[].line` and `help.pace` use that same
shared narrator (currently Serena), including each presegmented dictionary word.
Add Help content without changing `VERSION`: the recursive walker discovers it
and retains existing clip identities. `contentWords` must enumerate Help tokens
too so journal lookups survive saved-state validation. Glosses are authoring
metadata only; the player sees Hanzi, tapped pinyin and food/sequence pictures.
Identical text/preset/pronunciation within one asset kind deduplicates across
all references. IDs and glosses are not spoken and do not invalidate audio.

## Auditioned presets and offline caching

| IDs | Engine/model | Pinned revision | Speaker/language |
| --- | --- | --- | --- |
| `serena`, `uncle-fu` | `qwen`, `mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit` | `08c72cad5e2fd0f41730c8bd1f28149585e46361` | `Serena`, `Uncle_Fu` / `Chinese` |
| `yunxi`, `xiaobei` | `kokoro`, `hexgrad/Kokoro-82M` | `f3ff3571791e39611d31c381e3a41a3af07b4987` | `zm_yunxi`, `zf_xiaobei` / `z` |

All four use speed `1` and instructions `null`. Qwen's CustomVoice adapter
rejects other speeds instead of pretending to apply an unsupported setting.
Kokoro rejects non-null instructions. Qwen sampling uses temperature 0.9,
top-k 50, top-p 1, repetition penalty 1.05, no streaming; seeds are derived from
the content hash with a deterministic retry offset. Its length-dependent token
budget is recorded with each take. Kokoro uses the pinned config, v1.0 weights
and speaker tensor, with the Chinese Misaki frontend. There is no voice cloning.

Hugging Face downloads are anonymous and pinned; first inference may download
model/frontend assets. Retain the Hugging Face cache, optionally setting
`HF_HOME` to a large local directory **before** launching Python. After the first
successful run, `HF_HUB_OFFLINE=1` disables Hub requests. A cold offline cache
fails rather than silently choosing a newer model. Kokoro's frontend may need
its own first-run language resources too: warm it online once before offline
use. Existing verified WAVs require neither environment nor model cache.

The requirements reuse the audition scripts. Kokoro requirements are pinned;
Qwen's existing requirements pin `mlx-audio` and `soundfile` but not every
transitive dependency. Each asset records installed engine package versions and
Python. Model commits are pinned, but bit-identical regeneration across changed
hardware/package stacks is not promised. Bump `VERSION` in the script if changing
generator behavior, sampling, conversion or frontend policy; package versions
are provenance, not automatic cache invalidators.

## Cache, provenance and failure safety

Names are flat lowercase `/audio/line-<sha256>.wav` or
`/audio/word-<sha256>.wav`. The digest covers asset kind, normalized text, the
**entire** voice preset, generator version, pronunciation-normalization policy
and authored pinyin. A pinyin edit invalidates the cache even though automatic
pronunciation overrides are currently disabled.

A cache hit requires the manifest's matching content digest and recorded identity
(generator version, kind, text, full voice preset and pronunciation), matching WAV
byte SHA-256, and a decodable mono PCM16 file passing signal checks. Missing files,
corrupt bytes, invalid format and stale metadata regenerate; an unrecorded file
is not trusted. Existing manifest fields and other engines' clips are preserved.
Malformed clip records or duplicate filenames fail before generation/planning
output instead of silently dropping or choosing provenance. Resolve those records
explicitly before retrying; the script does not guess which duplicate is valid.
Recorded `voice_ids` describe the generating run, not every current editorial
alias; use the plan for current IDs/reference counts. Package versions and review
notes are provenance, not proof of pronunciation or part of the audio identity.
When changing generator behavior (including engine settings), bump `VERSION`;
when changing the pronunciation policy, update `PRONUNCIATION`. Do not bump either
for editorial aliases or unrelated tooling fixes: that would invalidate all clips.
Each accepted asset saves manifest provenance atomically before its references
become eligible. No cache garbage collection runs: old content-addressed clips
remain so another content version can still reference them.

Both engines save native-rate mono PCM16 at 24 kHz; other sample rates are rejected. Qwen float samples are quantized directly;
there is **no** gain change, loudness normalization, trimming or resampling.
Checks reject nonfinite samples, silence/near-silence, clipping, PCM boundary
saturation, truncated WAVs, takes shorter than 120ms and abnormal long takes
(a text-length-derived bound, never over 120 seconds). Qwen also rejects a take
that reaches its token cap. Retakes change only the seed, never the text.

Failures print the asset and cause, exit nonzero and leave that asset's original
reference untouched. Successfully verified assets can still update when other
assets fail. A failed run does not repair pre-existing broken legacy references.
If content or voice configuration changes while synthesis runs, the script
refuses the content update; rerun against both latest inputs. Already accepted
audio/manifest entries remain available for that rerun. JSON writes use a
same-directory temporary plus atomic replace. WAV, manifest and content writes
are individually atomic, not one transaction: an interruption after WAV replace
but before manifest save can leave an untrusted orphan WAV. Rerun normally; it
must pass manifest/hash/signal checks before any reference is updated. The script
is single-writer local tooling, not a distributed transaction with concurrent
content editors. Input comparisons happen just before content update; do not edit
inputs concurrently or run writers to different outputs against the same content.

## Pronunciation investigation and limits

The installed audition environment's Misaki 0.9.4 `misaki/zh.py` legacy Chinese
path calls `lazy_pinyin(..., Style.TONE3, neutral_tone_with_five=True)` and then
`ZHG2P.py2ipa`; it does not apply contextual tone sandhi. Kokoro 0.9.4 exposes
`KPipeline.generate_from_tokens` for direct phoneme strings. Relevant upstream
sources: [Misaki Chinese frontend](https://github.com/hexgrad/misaki/blob/main/misaki/zh.py),
[Kokoro pipeline](https://github.com/hexgrad/kokoro/blob/main/kokoro/pipeline.py).
The behavior above was checked against installed 0.9.4 source, not assumed from
the moving `main` links.

Explicit phoneme corrections are feasible, but **not enabled**. Authored pinyin
currently mixes joined syllables (`duōxiè`), lexical tones (`yī`) and potentially
surface readings. Splitting arbitrary joined pinyin, resolving polyphones,
neutral tones and distinguishing lexical from already-sandhied forms needs an
explicit reviewed per-syllable contract. Applying a general 一/不/third-tone
rewrite now could apply sandhi twice or move word boundaries. Global pypinyin
dictionary overrides could also leak one line's reading into unrelated lines.

For now both engines receive only exact authored Hanzi, never speculative pinyin
substitutions. Qwen receives no phoneme override either. Native listening must
check exact-text fidelity, missing/repeated words, polyphones, neutral tones,
contextual 一/不 and third-tone sandhi, prosody and consistent identity. Signal
checks and bounded retries are not a pronunciation or transcription test.

## Verification

`--self-check` uses temporary files and mocked synthesis; it checks voice routing,
dictionary deduplication, preset/pinyin cache invalidation, no-write planning,
mixed-engine manifest preservation, cache hits, missing/corrupt assets, stale
digest/identity rejection, malformed/duplicate manifest refusal, output locking,
attempt limits, interrupted atomic content writes, content/voice edit guards and
signal guards. Subprocess checks drive the actual plan CLI (including
`--write-content`, engine and limit flags) and assert file bytes stay unchanged.
It requires
no third-party packages and asserts that model modules were never imported.
The real game corpus remains a separate integration/listening check.

Tooling audit on 2026-11-02: baseline `21a4faaa8887dc8091f8d34ee70ad462ea472096`
accepted contradictory voice provenance as cached, duplicate/filename-less
manifest records, and content updates after concurrent voice-preset edits in
disposable fixtures. Regression checks now reject those states. The real
read-only plan still reports all 85 current assets cached; no generation or
playback is needed for this audit. These checks do not approve native pronunciation.

Worker verification on 2026-11-01: real offline-cache inference generated five
PCM16 smoke assets for `多谢` (Serena line + dictionary word, Uncle_Fu line,
Yunxi line, Xiaobei line). All four voices passed signal validation; one
Uncle_Fu take required a retry. A subsequent stdlib-only run reused all five
assets with zero generation and zero pending. These ignored fixtures live in
`output/content-audio-smoke/` in the audio worker checkout; no production content
or audition worktree files were modified. This is a technical smoke test, not
native listening approval or whole-corpus verification.

Parent integration on 2026-11-01: all 67 game assets generated (26 full lines,
41 shared dictionary words; 136.41 seconds). The four character voices are
referenced by the live content. Byte hashes, speaker routing, PCM format and
shared-word identity pass content tests. A Python-stdlib-only rerun reused all
67 clips with zero attempts and zero pending. The production offline browser
check loads each of the four voices plus a dictionary word with networking off.
Native listening review remains pending.
