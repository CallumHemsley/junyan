# Independent namespace audit — 9bc78ab

Exact migration `9bc78ab03d01f9dbf30fd2ccd7a37924ab4f9772`, base `1cf3532e9b40cbdd99d51ee860562e8f292a1d4e`, protected main `266e9bcd922151160d2edff48fb8078c874be135`. Read the five requested plan/proof files. No migration generator or apply operation was run.

**Published-tree omission: one manifest-listed rooftop video is missing.** `materialized-result.json` records `docs/evidence/world/0083/runtime/page@a6db71ee66c27f7ce8d1a6d3872e3817.webm`, source owner0083/head2d22909, 2,883,584bytes, SHA256 `2f55f5cba5ca5092df2c1d62b070c0b45c37a5c6d58e4a12279307d43f48ceb7`. The committed9bc tree has no such path. The other1,698 destination files match their expected SHA256;589,914,850bytes were streamed independently with git cat-file. The verifier intentionally exits nonzero for the omission. This is not a claim that the source owner's original video is lost; the source head was not locally acquired for that additional check.

All494 protected main docs/tickets and docs/evidence entries retain their Git blob and mode exactly. All699 production entries under src/public/package/lock match the base, and the full diff contains no non-doc changes. The1699 destination names are unique;123 result files are marked text-rewritten and the rewrite ledger also contains123 entries. The namespace manifest retains its original prepared/NOT-applied state; materialized-result/apply-proof separately state application. Do not mistake that historical plan state for current production merge status.

Coordinator follow-up: restore the exact missing blob or reconcile the manifest with an explicit provenance explanation. Preserve newer qualified evidence and the494 exact main files during application. No broad regeneration or production edit is requested. Semantic current-main reconciliation remains a separate gate; this audit does not approve App/save/progression merges.

Run `python docs/evidence/world/0088/namespace-9bc78ab/verify.py` from this repository with the three Git objects fetched. It checks committed objects, not only a helper working directory. Raw result is results.json.

## Exact correction verified

Coordinator correction `f7c244e9bac194e885d74c7d8c4e64d5d8782ce6` changes exactly the single missing WebM. Its blob is2,883,584bytes with the expected SHA256. Independent `verify-correction.py` rehashes every destination against the existing materialized manifest, selecting that one blob from f7 and all other files from9bc: **1699/1699 match**,592,798,434bytes checked.494 main documents and699 production entries remain exact; no non-doc migration change. `correction-results.json` retains raw results.

The missing-blob objection is resolved for the published correction. This is a read-only composition check, not a claim that foundation has cherry-picked it or completed its semantic merge. The correction branch does not itself contain the materialized manifest; the immutable9bc manifest is the reference. No generator, checkout, cherry-pick or merge was performed by reviewer. Historical failed results remain intact.
