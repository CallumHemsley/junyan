# Independent foundation review

Reviewer `/root/foundation_review` reported no concrete defects in the standalone state and gift rules at `8939b42`. The reviewer independently passed all ten focused state tests. The same code patch rebased as `c50bfcd`.

Reviewer `/root/registry_review` identified a real integration defect in the first registry. Exported apartment and repairs lines retain authored Phrase `text`, so parsing them with an exact Line schema failed. The first correction stripped extra text. The coordinator subsequently required preserving speech metadata for audio provenance. The writer replaced stripping with an explicit optional text field and token-equality validation.

Fresh reviewer `/root/foundation_bridge_review` reported PASS+NOTES on final code `e094dfbf668cb847e96395d4a9933bc1757c9061`. The reviewer independently ran the focused state, registry, and existing content tests, with 32 of 32 passing. The actual apartment bundle registered 112 words and 11 lines through `attachFeatureContent` and `contentSchema`. Every authored Phrase text remained present and the hospital opening remained unchanged. No concrete source defects were found, and the reviewer made no edits.

The verdict covers the standalone bridge. It does not approve integrated location gameplay, offline feature audio, or landing the feature.

The writer then synchronized released main `5c90ba4b7421755fee3dd5d12e777f70dd34f226` into the branch at `16f5ba1`. Main is now an ancestor. The reviewed foundation files remain identical to `e094dfb`. App, WordToken, styles, and audio files remain identical to released main. The following independent comparisons returned exit 0.

```sh
git merge-base --is-ancestor 5c90ba4b7421755fee3dd5d12e777f70dd34f226 HEAD
git diff --quiet e094dfb -- src/neighbourhood src/contracts.ts src/content
git diff --quiet origin/main -- src/App.tsx src/WordToken.tsx src/style.css src/audio
```

Final main-synchronized checks are recorded in the Node 22 evidence files. New location journeys, saved envelope integration, normal-mode feature reload, offline voices, and feature visuals remain incomplete.


## Integrated review, 2026-11-05

`/root/apartment_review` independently reviewed pure concrete integration `fe681da`, passing 72 focused tests without a blocking source finding. The writer resolved the useful coverage notes: integrated gift receipt/journal survival now includes real apartment undo after reload, and next-day preservation asserts nonempty apartment, repairs, cats, garden and gift receipts.

`/root/integrated_quality_review` independently reviewed exact source `b89dead`; documentation-only `61326dd` has identical source. No blocking code defect was found and no edits were made. The reviewer independently ran the production normal-opening four-route journey on desktop (42.7 seconds) and phone (40.9 seconds). It includes lookup and garden confirmation/Escape, journal, gifts, reload, restaurant return and day two. See integrated independent logs. The reviewer inspected final screenshots and disclosed long phone scrolling, finite repeat content and absent genuine voices. This is a functional PASS, not permission to merge, listening acceptance, sustained-fun evidence or hardware performance measurement. The approximately 621 kB bundle warning has no agreed performance budget.

All 278 absent feature voice clips, actual offline speech/listening review, audible feature demos and combined tour remain release blockers. The coordinator alone controls any future merge.


The original regression batch subsequently exposed stale pre-0061 keyboard expectations. The reviewer approved aligning the whole focus ring with the accepted direct-switch contract: active word sources, inert main, last source → close → replay → first source, then Escape back to the original trigger. The reviewer also approved awaiting foreground readyState/currentTime in the existing delayed native replay fixture instead of ending while its fetch was pending. Assertions/timeouts were not weakened.

Those corrected assertions exposed a genuine preexisting checkout-to-thanks focus loss, also present on accepted main. The reviewer approved the one-line `autoFocus` prop on the newly mounted continuation button: it stays mounted during receipt-word lookup and does not change word triggers, parent return focus or the trap. The six affected desktop/phone native replay, normal pointer and full keyboard journeys pass after the fix. A final stronger keyboard check additionally asserts continuation focus and receipt-word Escape restoration.


Final reviewer verdict binds `64c2031`: the sole product delta from reviewed `b89dead` is receipt continuation autofocus, with the stronger checkout/receipt lookup regression. Six targeted desktop/phone replay, normal pointer and full keyboard cases pass; a fresh final-file keyboard run passes both sizes (31.9/34.0 seconds), and the final production build passes. The original 72 unique cases are covered by the initial 69 passes and the resolved affected reruns; repeated cases are not counted as new unique coverage. No blocking functional finding remains. Genuine voice/listening/demo gates still fail and no main merge occurred.
