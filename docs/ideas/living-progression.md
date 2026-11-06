---
title: Living progression implementation
created: 2026-11-06
status: draft
tags: [progression, architecture, learning]
---

# Living progression

The player can use restaurant earnings to buy a blue vase, a large basket, or a small lamp for the apartment. A first shift earns 10块. The vase and basket each cost 8块, so the first purchase is a choice. The lamp costs 24块. These are new objects. Existing daily finds, starter furniture, and earned neighbour gifts remain free and keep their ownership.

After the guided first three days, restaurant orders come from every authored level the player has reached. Each table avoids its previous order when another is available. Among those alternatives, words due for another encounter influence the selection. All orders keep their existing segmented text and offline voice recordings.

The apartment and neighbourhood show one optional invitation. Its button opens the relevant existing routine, selects the repair job, or starts the day's cat encounter. Eligibility checks the live feature state and today's completion receipts. No invitation requires a player to finish it or limits access to other locations.

## Evidence is separate from story recovery

`GameState.progression` is an optional versioned aggregate. `journal.recovered` remains permanent. The progression module never refogs a recovered word, buys knowledge, or displays a review queue.

Restaurant delivery assesses food nouns only. A correct tray does not establish comprehension of every sentence token or a quantity's written form. Lookup or a wrong delivery marks the relevant words supported for the rest of that game day. Help never changes earnings. Cats, repairs, garden care, and first apartment placement are guided routines, so their completions provide supported exposure rather than independent recall evidence.

Each word receives at most one recorded encounter per game day. Each scenario has one daily completion receipt. Repeated repairs use the actual live-job return transition. Repeat cat encounters use the active-to-complete transition, even when their kind was completed before. Visits, clicks, colour changes, gifts, purchases, and moves of an already placed object earn no practice credit or money. Storing and replacing an object on a later game day can record supported exposure. It never supplies independent recall credit or money.

An independent revisit requires both a later eligible game day and elapsed real time. The prototype interval starts at one real day and one game day. It grows by one, up to seven, when independent evidence arrives in a changed context. Early encounters preserve the existing due time. Supported encounters keep a one-day interval. Clock rollback reanchors conservatively without credit. These constants are design hypotheses, not research-validated learning intervals.

The director can prefer a word when either clock says it is due. A long absence therefore offers familiar language immediately. Interval growth uses both clocks so rapid game-day advancement cannot manufacture spaced recall. Neither clock advances the story, removes money, or creates overdue obligations.

## Semantic identity

`identities.json` fixes each current vocabulary ID to its reviewed semantic identity. Same-sense aliases share an opaque canonical key. Some existing keys contain Chinese characters for save continuity, but rules never compare them with displayed text. Adding a new spelling or sense cannot rename an existing identity. The courtyard's 椅子 means a bench and stays separate from the apartment chair. Repair 换 and apartment 换 also remain separate because replacing a battery and changing a colour are different evidence. Unregistered vocabulary uses a word:ID key until its identity is reviewed.

Adding another sense requires an explicit identity decision. Translating or renaming display text cannot change an existing identity or the ID-based fallback. Adding the same spelling to a future pack is not evidence that its meaning is interchangeable. Catalog labels, modifiers, and targets reference stable word IDs. Validation checks that those IDs exist. Rendering resolves the current display text and uses WordLine with the selected spacing policy. Progression chrome and money formatting live in the selected progressionUi copy catalog.

## Ownership and saves

Spendable money is cumulative `earnings - progression.spent`. A purchase changes the debit and durable purchase receipt in one reducer result. Duplicate and unaffordable purchases do nothing. Placement and undo never refund a purchase.

Old saves without progression remain valid and retain all story and furniture state. Malformed review entries are discarded independently. Conflicting alias records are discarded conservatively. Purchase receipts restore paid furniture if the apartment payload resets during validation. A debit lower than the receipt prices is repaired upward. A higher valid debit is preserved. Negative, nonfinite, unknown, duplicate, or unaffordable financial records reject the save rather than minting money. The existing startup recovery UI handles a rejected save.

## Extending the slice

1. Add authored scenario data to `src/progression/catalog.json` and its ID to `scenarioIds`. Reuse validated tokens and voiced lines, or produce offline audio through the existing content workflow.
2. Add actual-state eligibility and before/action/after completion evidence in `scenarios.ts`. Test repeated valid completion and an exhausted or rejected action. Decide whether the activity truly distinguishes a word or only guides the player.
3. Add any same-sense aliases deliberately. Keep polysemes separate. Run the catalog referential-integrity test.
4. For furniture, add a stable item ID, visible renderer geometry, tokenized catalog name, and immutable price. Preserve old receipts if a future catalog changes prices by versioning the purchase record first.
5. Run rules, save roundtrips, the new browser journey, and the normal opening/customer/change/journal journey at the worktree's explicit ports.

This slice has nine authored scenario kinds and three new purchases. It does not promise an unlimited curriculum. Human playtests must establish whether players enjoy the loop and whether delayed language retention improves. Automated checks establish state integrity and reachability, not those outcomes.
