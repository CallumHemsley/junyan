# 0060 — final selected-audio import preparation

2026-11-05: Root reports both two-line 1.7B Uncle_Fu auditions generated without failures. User is hearing neutral A then conversational B; preference pending. Local unprompted ASR reportedly recovered neutral request/thanks completely and conversational request completely, but repeated conversational thanks only once; ASR may collapse repetition. No human pronunciation or quality claim follows. Do not import either direction before root returns the selection/full six clips and releases the serialized audio lease after 0058/0062.

Owned staging tool: `scripts/0060-stage-grandpa-import.py`. Branch rebased onto current main `97c61bd` for preparation. **Refresh/rebase onto then-current main again after doctor's atomic integration**, so the import retains its content, presets, manifest and WAVs. Do not replace production files from the earlier audition baseline.

## Return-bundle contract

Root's selected full-generation directory must contain `content.json`, `voices.json`, and `audio/manifest.json` plus the six matching WAVs. Content must include all six unchanged Grandpa line IDs, exact text and complete token/pinyin objects. Only full-line audio references change. Elder must route to the selected hospital-only preset. The source preset must use pinned 1.7B CustomVoice revision `f35faf19b0cc2160865af64ecf0f22f83d335135`, Uncle_Fu / Chinese / speed 1, existing -20 dBFS active RMS and -1 dBFS ceiling. Neutral uses null instructions; conversational uses the selected audition instructions. Root should retain actual inference provenance and the selected two accepted WAVs rather than blindly regenerate those takes.

## Stage without production writes

With the returned real source bundle under ignored output, choose the actual source preset ID/direction:

```sh
python3 scripts/0060-stage-grandpa-import.py \
  --source output/RETURNED-SIX-LINE-BUNDLE \
  --voice-id hospital-elder-1b7-neutral-audition \
  --direction neutral
```

For B, use `hospital-elder-1b7-conversational-audition` / `--direction conversational`. Default output is a **new** ignored `output/0060-staged-import/`; existing destinations are refused. No apply switch exists, so staging itself never edits production.

Checks before output creation: exactly six matching Grandpa line IDs; no script/token/pinyin drift; pinned hospital preset/loudness; exactly six exclusive line jobs affected; all six selected WAVs have matching content identity, manifest provenance, byte hashes and valid mono PCM16 24kHz signal; all unrelated current-checkout clips remain cached; conflicting manifest records refused. The staged production preset is `hospital-elder-1b7` (editorial alias only, preserving audio identities). Only elder's zh route, its six full-line paths, one unique hospital preset and six manifest entries are changed. The staged manifest starts with current-checkout records, preserving other tickets' completed work and historical clips. Production inputs must remain byte-identical throughout staging.

Review the staged diff and current-main state before the authorized integration. Once selected and lease released, import those six WAVs plus the staged content/voices/manifest together in the ticket commit; no new approval is needed just to perform the already authorized import. Do not import the full audio directory or synthetic tooling fixture. Then run the relevant schema/content/audio checks and full actual opening/four-customer journey, desktop/phone and reduced motion, clean console, persistence/offline and sound scene audition. Keep any subjective acceptance evidence distinct from signal/ASR results. Root owns independent final-patch/product review and merge.

## Verification actually performed

- Incomplete existing `output/0060-1b7-neutral` audition refused before output creation: `Need exactly all six Grandpa lines; two-line auditions cannot be imported`.
- Synthetic-only six-line PCM fixture under `output/0060-import-mock-source` exercised the staging success path: **6 Grandpa clips, 125 all-cached jobs**, production modified false. Asserted all non-opening current-main content retained. This uses clearly marked generated sine-tone fixtures for tooling validation, **not speech, an audition, or real inference**. `output/0060-import-mock-staged` must never be imported.
- No extra gameplay baseline suites repeated for this handoff-only work. Earlier visual game checks remain recorded separately; they must be refreshed after real audio import/current-main changes.

Verdict: final import prepared; **ticket still incomplete/BLOCKED pending selection, real six-line bundle, serialized audio lease and complete verification**. Visual change remains draft, not a standalone completion claim.

## 2026-11-05 — published neutral support plan (supersedes provisional bundle details above)

Support branch `codex/0060-synthesis-support`, exact commit `cfaa2fd`, publishes `docs/evidence/0060/neutral-candidate/`: six final WAVs, `inventory.json`, `preset.json`, `manifest-entries.json`, SHA-bound `asr-final.json`, retake wrappers and rejected-take evidence. This is a **subset evidence bundle**, not the complete `content.json`/`voices.json` source shape expected by the earlier provisional staging helper. Do not run that helper directly against this subset or import a truncated content fixture.

Read-only verification performed against the Git objects, without extracting/staging/importing production assets:

- All six inventory SHA-256 values equal actual published WAV byte hashes, manifest hashes and final ASR proof hashes.
- All six pipeline identities match recomputed jobs using current exact script/pinyin and published preset (generator version, kind, text, preset, pronunciation policy, digest/name).
- All six are nonempty mono PCM16 24 kHz WAVs.
- Published milk request and repeated thanks WAVs equal their neutral audition blobs byte-for-byte.
- Current `uncle-fu-levelled` is exclusive to elder in the opening; restaurant characters use other presets. Thus **preserve this existing hospital-only preset ID** and update its definition rather than introducing the provisional `hospital-elder-1b7` alias. Recheck exclusivity against then-current main before editing. This supersedes the helper's provisional alias choice; adapt the import to actual returned support shape at integration time.

Integration sequence once (and only once) root reports **A selected AND 0062 lease closed**:

1. Fetch/rebase onto current main after doctor/customers atomic integrations. Retain the merged depth fix and existing tested pose. Read current content/voices/manifest; snapshot their hashes and compare exclusive hospital consumers again.
2. Use **only** the six selected top-level candidate WAVs and six `manifest-entries.json` records from exact support commit `cfaa2fd`. Keep rejected-first/second takes outside production. Preserve the original accepted two WAVs. Bring relevant ASR/inventory/preset/retake evidence into the reviewable ticket evidence without treating it as human acceptance.
3. In the full current game, change exactly six elder full-line `audio` references by matching inventory `lineId` and exact `text`. Preserve tokens/pinyin/recovery/steps/tray and all non-elder content. Update only existing exclusive `uncle-fu-levelled` to the published pinned 1.7B Uncle_Fu neutral preset. Preserve dictionary/restaurant/doctor/customer presets and files.
4. Add the six selected WAVs and merge their six records into the **current complete manifest**. Refuse a conflicting same-filename record. Preserve historical audio/manifest entries by default; no cleanup is needed to fix performance. Do not replace the manifest with the six-entry subset. Existing pipeline does not include editorial preset IDs in asset identity; preserve actual generating `voice_ids` provenance instead of rewriting it to match the live alias.
5. Recompute full plan and require zero pending; verify clip hashes/provenance, schema/content/audio checks and build. Play full opening with both wrong reactions and thanks, complete four-customer day/change/journal, phone/desktop normal/reduced motion, clean console, persistence/offline audio. Capture reviewer-accessible images and scene video with sound for actual listening acceptance. This worker must not claim listening it cannot perform. Record selection evidence separately from any remaining full-scene listening limitation.
6. Push atomic production files and evidence, request root's exact-patch/product review, and leave merge to root. The previously requested selection is sufficient direction once root communicates it; do not introduce another approval request to perform this authorized integration.

If user selects **B**, tell root: the published bundle contains only B's two audition clips; the unpublished full B candidate still has two reported ASR flags. Do not substitute A, use unverified local B clips, or infer acceptance from ASR. Root must return the verified selected full B bundle before import.

Final word-sequence ASR alignment of A is a technical check only. Whisper does not establish tones, low-energy performance, believable frailty, enjoyment or human approval. User A/B preference remains **pending**. No production files staged/imported in this planning update; 0062 lease still blocks integration.
