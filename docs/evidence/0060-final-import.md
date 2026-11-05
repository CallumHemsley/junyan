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
