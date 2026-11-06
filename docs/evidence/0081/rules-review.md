# Independent rules review

Verdict **ISSUES**.

Reviewed commit `3c0389431fbca3cf6b4c094b6158b2569ce5ff75` against `8cd5bc209b7dc2d91cc0f765991de313f813f4eb` in `/private/tmp/junyan-0077-rules-review`. Source was read-only. No source edits or commits were made.

## Finding

**[P2] Preserve canonical identities when adding another sense of an existing spelling.**

`src/progression/model.ts:53` derives an existing word's canonical identity from the current number of same-spelling peers. Adding a new, unapproved namespaced sense therefore changes an existing singleton's identity. `src/progression/model.ts:95` also bypasses that identity mapping and emits raw hanzi for restaurant evidence.

A catalog-valid extension adding `apartment.slick-person` with hanzi `油条` demonstrates both failures. The existing food `youtiao` changes from canonical `油条` to `油条#youtiao`. Loading its previously valid saved evidence drops the `油条` review record in `src/progression/save.ts:25`. Looking up the food then marks `油条#youtiao` supported, but a real successful `reduceGame` delivery records `油条` with `successes: 1`. Thus ordinary future content can discard existing learning history and classify an assisted delivery as independent recall. Current shipped content does not trigger this defect.

The extension guidance and existing future-duplicate test promise isolation of new meanings. The current test checks only the new word's identity. It misses the existing identity, old-save restoration, and the lookup-to-delivery path.

Keep established identities stable. Make restaurant targets use the same canonical resolver as lookups and save restoration. Add a regression that extends content with a new homograph, restores an old review entry, looks up the original food, completes a real delivery, and checks that supported evidence survives another save roundtrip.

Executable reproduction is `/private/tmp/junyan-0077-alias-probe.mjs`. Captured output is `/private/tmp/junyan-0077-alias-probe.log`. The log includes a harmless Vite HMR socket permission error from the module-loading harness. Module evaluation and the reproduction completed successfully with exit code 0.

Observed output includes:

```text
before: [ '油条' ]
after: [ '油条#youtiao', '油条#apartment.slick-person' ]
saved review before [ '油条' ] after load []
looked-up food support [ '油条#youtiao' ]
delivery evidence '油条'.successes = 1
```

## Verification

- `pnpm test` passed all 324 tests in 27 files at the reviewed commit.
- `git diff --check` passed against the specified base.
- Inspected progression model, aliases, catalog, scenario adapters, purchase rules, save restoration, connected game reducers, neighbourhood restoration, and underlying apartment, repair, garden, and cat behavior. Compared against ticket 0077, its plan, architecture research, learning research, and accepted decisions.
- `/private/tmp/junyan-0077-rules-probe.mjs` exercised 7,500 deterministic feature transitions and full save roundtrips across 50 played restaurant days. It mixed apartment placement, storage, undo, recolouring, purchases, repeat repairs, and garden care. Every roundtrip remained equal. Side activities preserved restaurant revenue. All three purchases remained owned with cumulative spending 40 and final spendable balance 1263.
- Checked current alias and distinct-sense handling, both scheduling clocks, conservative guided exposure, duplicate completion suppression, actual order selection, purchase affordability and idempotence, legacy save preservation, and corruption handling. No other material defect was established.
- A suspected rainy-day garden invitation issue was falsified through actual reducers. The offered activity retained dry pots and could be completed.
- Static control labels follow existing repository chrome conventions. No rules finding is raised for them. UI/browser verification belongs to the separate review partition.

The Prove It Works principle shaped the review by requiring actual reducer execution, exact saved-state roundtrips, and a reproducible content-extension failure rather than trusting the implementation's tests alone. The no-comments review found no material comment or unnecessary-code defect in this partition.
