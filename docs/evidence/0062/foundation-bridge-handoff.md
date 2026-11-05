# 0062 → 0066: isolated punctuation bridge

User accepted all four paired **thanks** probes: “All four revised samples work.” Preserve the existing cast/presets and use authored punctuation. Acceptance covers these four samples, not the remaining 20 lines or final playable context. Root is generating those separately, reusing the four accepted WAVs byte-for-byte.

0066 exclusively owns contracts/schema/word traversal. This is a requested isolated bridge, independent of any unvoiced feature release. 0062 must not edit shared schema files.

## Exact minimal contract

In `src/contracts.ts`, extend the existing type without requiring migrations:

```ts
export type Line = { id: string; tokens: Word[]; audio: string; text?: string };
export type Phrase = Line & { text: string };
```

Existing lines omit `text` and retain concatenated-token speech. Opening phrases still require text. No change to Word, save state, IDs, cast, voices or token arrays.

## Exact validation behavior

In `src/content/index.ts`, retain strict objects and add optional `text` to `lineSchema`. Its allowed characters must match existing `phraseSchema`: `/^[\p{Script=Han}，。！？·]+$/u`.

For every line where `text !== undefined`, require:

```ts
line.text.replace(/[，。！？·]/gu, '') ===
  line.tokens.map(word => word.hanzi).join('')
```

Report failure at that line's `text` path. An empty string must fail the character rule, not be treated as omitted. Preserve the opening phrase's mandatory text and equivalent validation, including nested error paths. A small shared text validator may avoid duplication; no generic new content traversal is needed. Optional text validation belongs at the line boundary so greetings, thanks, retries, orders and help all obey the same invariant.

`src/content/words.ts` needs no change: contentLines/contentWords already collect every relevant token, and Phrase still extends Line. UI continues rendering tokens; text is synthesis metadata, not visible replacement dialogue.

## Provenance expectations and regression cases

Coordinate ownership of `src/content/content.test.ts` with root. In the restaurant and shared-narrator expected-record mappings (baseline lines 204 and 206), change spoken text selection to:

```ts
line.text ?? line.tokens.map(word => word.hanzi).join('')
```

Keep exact manifest text, voice and WAV SHA checks. Opening expectations remain `phrase.text`. Do not ignore punctuation in manifest comparison or relax checks to accept stale baseline audio.

Required focused cases:

- Existing shipped content without restaurant `text` still parses unchanged.
- Punctuation-only optional text parses and survives parsing verbatim, including `麻烦你了，谢谢。` on 林姐 thanks and representative order/retry/help lines.
- Missing, extra, duplicated or reordered Hanzi fails with the affected `text` path.
- Empty text, Latin, whitespace, unsupported punctuation and unknown properties fail.
- Opening Phrase text remains mandatory and token-equivalent.
- Token arrays and contentWords identities stay unchanged; optional synthesis text does not create journal words.

The bridge alone changes no production content/audio. Thus current content provenance checks remain valid before 0062 promotion.

## Pipeline and later import

`scripts/content-audio.py` already prefers `text` when present and includes it in the content identity. No pipeline change, preset change, VERSION bump, dictionary regeneration or dependency change is needed.

After 0058's doctor import and root's explicit lease, 0062 will patch only the 24 matching restaurant line IDs in **current main**, preserving opening/new doctor/neighbourhood content and all tokens/presets. Merge accepted candidate records into the complete current manifest; never replace it with the small fixture or copy stale voices. Reuse the four accepted WAV bytes. Full reference analysis precedes any retirement: 林姐's old greeting is also used by Help. Keeping old clips/records is safer than premature removal and is permitted by the content-addressed pipeline.

Root supplies remaining 20 generated artifacts and ASR checks. ASR supports content fidelity, not subjective naturalness approval. Then 0062 verifies final assets, game journeys and independent exact-patch review; no self-merge.
