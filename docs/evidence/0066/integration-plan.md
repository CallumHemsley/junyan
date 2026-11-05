# Neighbourhood integration

The player can visit four optional locations after the hospital opening and return to the same restaurant session. The restaurant day remains the only clock.

## Throughput checkpoint

- Blocking first steps. Establish contracts and pure save rules before feature imports. Wait for explicit shared-file lease handoff.
- Independent workstreams. Feature teams own their folders and audio. The foundation owns shared integration.
- Shared mutable state. Keep one restaurant snapshot with an optional versioned neighbourhood envelope. Retain the existing pending checkpoint and IndexedDB transaction.
- Smallest safe decomposition. One foundation writer owns state, save, journal, navigation, and gift bookkeeping because they must commit together.

## State decision

An optional `GameState.neighbourhood` stores location, four feature payloads, and claimed gift IDs. Existing `v1` saves initialize the envelope without replaying the opening. Each feature validates independently. A malformed feature resets only that payload.

A separate key in the same IndexedDB transaction could preserve database atomicity. The current pending checkpoint contains only `GameState`. A second key would require a broader recovery change to prevent stale route, gifts, and journal after a crash. The coordinator approved the embedded envelope.

## Current runtime

`App` keeps a `Session` union for opening and day. `reduceSession` delegates restaurant actions to `reduceGame`. `App` writes a synchronous pending checkpoint before scheduling the IndexedDB write. `loadGame` validates the restaurant shape before startup. `startSession` treats a valid game as proof the opening finished.

`contentWords` enumerates food, dialogue, and opening tokens. `recordLookup` checks this registry before adding a journal entry. Feature words must join that registry before feature lookups can work. The existing playback controller stops prior audio and reports policy or load failures. Features receive callbacks into that controller.

## Shared patches after handoff

1. Import concrete feature types and export their neighbourhood envelope type. Add the optional envelope to `GameState`.
2. Validate the restaurant first. Read the raw envelope separately so an invalid feature cannot invalidate restaurant progress. Reconcile claimed gifts through the apartment's idempotent `receive-gift` action after apartment recovery.
3. Preserve the envelope in `next-day`. Add a day-two save regression.
4. Register feature words and lines for journal validation and offline asset enumeration. Detect conflicting word IDs.
5. Render the selected feature after the opening. Stop walking and playback on location transitions. Close restaurant panels on departure. Keep the restaurant session in memory and save the full snapshot after location and feature actions.
6. Route successful feature recovery through the shared journal and dot tracking. Failed actions must not recover words. Lookup remains lookup.
7. Deliver optional gift IDs and their receipts in one immutable update. Reject unavailable gifts. Restore retained gifts from saved receipts if the apartment payload resets.
8. Verify opening, restaurant, all features, reload, old saves, offline audio, console, and inspected desktop and phone visuals.

## Verification status

Standalone state tests cover legacy initialization, independent payload recovery, valid claim preservation, navigation identity, immutable gift receipt updates, retries after reload, missing receipt recovery, and claimed gift restoration after apartment corruption.

Integrated journeys, offline audio, feature screenshots, and console checks remain incomplete until features and shared leases arrive.

## Skills and overrides

Read Pstack `poteto-mode`, `how`, `architect`, feature, shipping, opening-a-pr, `no-comments`, `unslop`, `technical-writing`, and the relevant model, boundary, idempotency, verification, and sequencing principles. Applied `deslop`. The coordinator owns delegation, independent review, and all merging. User model choices and the connector-only GitHub policy override playbook model and CLI defaults.

Executor skill discovery returned no skills. No upstream visual `show-me` skill was found in the installed Pstack tree. `show-me-your-work` is available and governs the decision trail. The PR still needs real GitHub-compatible visual evidence once the integrated UI exists.
