# Completed neighbourhood release

Players can leave the breakfast restaurant to furnish their apartment, befriend courtyard cats, repair a lamp and toy, and tend the shared rooftop. All four locations share the restaurant day, journal and saved progress. Gifts return home once. Visits do not advance time or reset restaurant service.

## Verified game

The application and voice assets were verified at `7b27ca44a7ed5c9a0eebb45a6a06145beb381287`. Subsequent commits contain only verification, capture tooling and documentation.

- Node 22.23.4: 308 unit tests and production build pass.
- 12 production release cases pass with real native speech, first offline visits to all four locations, words/replay, normal opening without test hooks, save migrations and deliberate failure/recovery. No successful-media interception or silent substitutes.
- 34 existing audio, ambience and word-card regression cases pass. Both suites have zero skips, unexpected failures or flaky retries.
- Independent source reviewer verified controls, four orders/change, authoritative days, three gifts, immediate/old/corrupt saves, 135 focused tests, 2,717 repair states and 30,000 deterministic feature transitions. Fresh desktop and phone scenes were inspected.
- Independent production reviewer passed 24 real line/word/replay checks online and offline, with no console/page errors or media substitution.
- Audio reviewers checked all 313 feature/shared references, all 404 runtime audio URLs, exact identity and byte hashes, 15 archived rejected takes and preservation of all 132 existing main audio/content/preset paths. Both Python self-checks pass. The original 126 asset plan and the neighbourhood 313 asset plan have zero pending assets.

Exact commands and case results are in [release-7b27ca4](release-7b27ca4/README.md). Independent verdicts and machine-readable receipts are in [reviews](reviews/).

## Watch or play

Run `pnpm dev --host 127.0.0.1 --port 5474 --strictPort` from the main checkout, then open `http://127.0.0.1:5474/`. This preserves the origin used for the supplied local preview and its IndexedDB saves. Existing unrelated servers and user worktrees are untouched.

The delivered movies are preserved outside Git in the main checkout's `output/neighbourhood-demos/`:

- `neighbourhood-combined.mp4`: 2m11s across all four activities.
- `walkthrough.mp4`: 4m56s with the real opening and four-customer restaurant day.
- `apartment.mp4`, `cats.mp4`, `repairs.mp4`, `garden.mp4`: short individual activities.

Every export has actual H264/AAC media, nonzero decoded audio and per-file SHA256 proof. Real source speech was matched in each activity and a late event. The parent independently decoded all six exports, matched the four individual speech waveforms within 19ms, checked asset/file hashes, and inspected frames decoded from the actual MP4s. See [parent-video-check.json](parent-video-check.json) and [capture evidence](../0074/README.md).

The movies play the actual application through controls. The full recording reaches day two by serving four customers and giving change; no feature progress is injected. The short garden clip joins genuine day-one and day-two visits, omitting the restaurant interval. Capture uses development hooks only to read orders and verify final state; normal production journeys separately prove the game without hooks.

## Judgment and limits

Prove It Works required actual media decoding, real offline play and source-bound video checks. Experience First required courtyard arrival speech and continuous keyboard focus. Native speech perception is unavailable in this agent runtime, confirmed by an audio-input attempt. Independent ASR, provenance, browser playback and waveform verification support the technical release; they do not certify pronunciation, tones, naturalness or physical-speaker listening. Native listening remains explicit follow-up 0076.

Pstack was used with the user-requested Sol Medium workers and independent reviews. The separately named show-me skill was not installed; PRs use concise truthful diagrams and actual screenshots without claiming missing skill execution. No AWS writes, manual deployment, Steam publication, dependency changes or accepted cast recasting were performed.
