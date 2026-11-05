---
title: More things to do at 早安小馆
created: 2026-11-05
status: draft
tags: [idea, research, gameplay, restaurant, playtest]
---

# More things to do at 早安小馆

For Callum to select: five possibilities, grounded in the current restaurant. **Recommend testing one optional small customer favour first**, subject to Callum's choice. Nothing below is an accepted mechanic, implementation ticket or prototype. Enjoyment claims are hypotheses.

## What was actually observed

Played the real browser surface at base `66ac123fa377f0cdbfb30f5c8bad07edf28790e4`, seed 42, on 2026-11-05. The existing muted Playwright journey completed the hospital opening, all four restaurant tables, food pickup/delivery, change, a word lookup, journal and day-two progression on desktop (1440×1000) and phone (390×664 CSS viewport, iPhone 13 profile). An additional muted desktop exploration used scene table controls to serve 林姐, 小李 and 张老师, then revisited 林姐. Hooks read state/content to choose orders; actions used rendered controls, not dispatch shortcuts. This was agent-operated browser play, not a human enjoyment study. No subjective listening comparison was performed; these observations concern visible interaction only.

| Observed moment | Evidence | Opportunity inferred, still untested |
|---|---|---|
| Three customers changed the requested item (包子, 豆浆, 粥), but each followed table → kitchen tile → table → serve → change → thanks. | `exploration.json`; inspected `desktop-order.png`, `desktop-kitchen.png`, `desktop-receipt.png` | A different kind of action could break the repeated pattern without adding harder recall. Repetition may also be comforting; do not assume boredom. |
| Kitchen tiles put complete food straight on the tray; no preparation choice appeared in these orders. | Inspected `desktop-kitchen.png` | A short tactile preparation action might make food feel handled. It could equally become an extra mandatory click. |
| Clicking successive scene tables involved approximately 0.88, 1.86 and 2.40 seconds until the order dialog appeared in the exploratory run. | `exploration.json`, click-to-dialog wall times, including automation/render overhead | Walking creates brief watchful pauses. This is not evidence of long idle stretches or a reason to insert a task during every walk. |
| Revisiting served 林姐 reopened her receipt and thanks; it did not expose a new request, clearing action or conversation choice. | `exploration.json`; `desktop-revisit.png` | A voluntary post-service interaction has a natural home here. |
| The scene visibly contains bowls/cups, stools and plants; meaningful food/payment interaction takes place in a foreground panel. Phone scene labels are smaller than the foreground controls. | Inspected desktop/phone restaurant and journal screenshots | New interactions need a reachable DOM control as well as any scene hotspot; tiny props alone would be a poor phone interface. |
| Four-table completion advances to the daily summary and then a more complex day. | Both full journey runs | A closing arrangement choice could give tomorrow a visible personal touch. It must not delay the summary by requiring chores. |

No observed evidence establishes impatience, demand for a preparation minigame, or a preference among these ideas. Customer performance and atmosphere belong to [[../tickets/0062-natural-customer-performances]] and [[../tickets/0063-restaurant-background-sounds]]; neither new sound nor animation alone counts as a new player interaction here.

## Five candidates

Effort estimates are rough person-days for one experienced developer, including a tiny authored slice, offline audio/content, phone/keyboard work and focused checks. They assume existing assets can be adapted and include no external-service setup. Production breadth, native Mandarin review and asset revisions may extend them; these are comparison estimates, not commitments.

### 1. Pour a warm cup

- **Action and example:** After choosing 豆浆, tap a cup, then a pot to pour; tap again to stop at either of two generous serving marks. The customer receives the cup the player prepared. No narrow timing window, spill penalty or speed score.
- **Possible fun:** Visible transformation and a small ritual of care replace an abstract pickup. The risk is making every drink slower without adding a satisfying decision.
- **Mandarin through context:** A customer says 来一杯豆浆; cup, pot and resulting drink give the line a visible referent. Optional replay and word lookup remain. No translation quiz or pronunciation grading. New quantity language would need contextual demonstration and reviewed segmented lines.
- **Phone/access/pace:** Two large DOM tap targets with keyboard equivalents, plus an explicit fill-to-mark option requiring no timing or sustained press. Static fill states under reduced motion; sound never carries the only cue. Allow ordinary pickup instead.
- **Effort:** 3–5 days for one drink and two fill states. Needs preparation state and item identity boundaries; avoid a physics/liquid simulation, temperature system and recipe tree. Coordinate any optional pour sound with 0063.

### 2. A small favour after breakfast — recommended experiment

- **Action and example:** After 张老师's porridge, he gestures toward a small drip and asks for paper, 纸巾，谢谢. The player may tap the tabletop napkin holder, then his table, or carry on serving. A napkin appears beside the bowl and he gives a brief thanks. This is a proposed line, requiring Mandarin/content review, not current game dialogue.
- **Possible fun:** Notice a person and help them; the consequence is a changed little scene and acknowledgment. The risk is that it feels like another fetch order, especially if it requires a kitchen trip.
- **Mandarin through context:** A visible napkin holder and gesture establish what the new noun refers to. The request and thanks are replayable, tappable DOM words with offline voice. No multiple-choice word test; a mistaken tap is harmless and reversible.
- **Phone/access/pace:** Use two ≥44px buttons in a table panel, also reachable by keyboard; mirror scene affordances without requiring precision on the tiny holder. No timeout, blocking modal, queue penalty or reward lost by ignoring it. The next customer stays available.
- **Effort:** 1–2 days for one optional request in a disposable prototype; 3–4 days for a release-quality slice with content/audio, an explicit request lifecycle, save compatibility, tests and scene/DOM parity. No random request generator or new tray rules in the experiment.

### 3. Reset a table your way

- **Action and example:** Once a diner leaves, tap the used bowl to collect it, then choose whether to leave the cup beside the window or beside the napkin holder. The next visit uses that arrangement. Both placements are valid.
- **Possible fun:** A small before/after transformation and personal authorship of the room. Risk: clearing becomes compulsory unpaid work repeated four times a day.
- **Mandarin through context:** A brief line such as 放这里吧 accompanies an obvious placement; nouns attach to the visible bowl/cup. Keep comprehension incidental, without left/right vocabulary tests or a correct layout.
- **Phone/access/pace:** Tap-select/tap-place with two labelled DOM destination controls; no drag requirement. Undo, reduced-motion still states, keyboard selection. Clearing is voluntary and never blocks seating, income or next day.
- **Effort:** 3–5 days. Current served-table revisits do not represent a departed diner, so departure/occupancy and prop state must be explicit before implementation. Exclude washing, dirt meters and pathfinding changes.

### 4. Answer a regular's everyday remark

- **Action and example:** 小周 notices the rain; the player chooses to offer a seat by the window or reply with a friendly acknowledgment. Both are accepted; a small gesture or seating preference gives the choice a visible consequence on a later visit.
- **Possible fun:** Express how to host someone, and recognize a returning person. Risk: two response buttons that produce interchangeable text feel like a dialogue exercise.
- **Mandarin through context:** Weather visible through the window grounds a short voiced remark. Replies are real segmented Mandarin, replayable and tappable; no translation labels, comprehension score or required recall of biography.
- **Phone/access/pace:** Two large response buttons plus close/continue; keyboard and screen-reader names. Let the player leave without answering. No response timer or relationship penalty, and no unskippable extra exchange.
- **Effort:** 2–4 days for one remark, two responses and one visible callback. Authored conversation/choice state and reviewed voice assets needed; exclude branching story trees, relationship meters and live generation. Coordinate new cast clips with 0062 rather than changing its performance work.

### 5. Choose tomorrow's welcoming detail

- **Action and example:** After the day tally, choose a small plant by the window or a thermos on the counter; preview it, undo, then return tomorrow to see the chosen detail. Both are free and purely personal.
- **Possible fun:** Own a changing place and anticipate tomorrow. Risk: a cosmetic menu detached from customers adds little to minute-to-minute restaurant play.
- **Mandarin through context:** Short voiced remarks name the visible object and where it goes. No text-heavy upgrade tree, English tooltips or stat arithmetic.
- **Phone/access/pace:** Large preview cards and an explicit confirm/undo; keyboard parity and static previews under reduced motion. Optional choice after the existing tally, never a gate before continuing.
- **Effort:** 2–4 days for two fixed props, preview and one persisted preference. Save migration and sprite placement need review. Exclude purchasing, currencies, buffs, furniture grids and new business progression; costly progression choices need Callum's accepted decision.

## Smallest useful playtest, only after Callum selects

Test **candidate 2: one optional napkin favour**, once during a four-customer day. It probes whether caring for a diner adds enjoyment at the exact served-table boundary we observed, with no travel chore. Pouring has more motor/animation work; clearing needs a departure model; conversation depends more on new writing and performance; decoration mainly tests between-day attachment. These are scope comparisons, not evidence that candidate 2 will win.

Minimum proposed prototype: one regular, one visible request cue and line, one napkin holder, two tap/keyboard actions and a visible tabletop result plus thanks. It must leave normal serving and next-day progression intact when ignored. Use reviewed, pre-segmented offline Mandarin/audio and ordinary token help; human playtest audio stays audible at a comfortable player-chosen level. The automated verification browser remains muted.

Name state before coding: a separate favour state `{table, kind: napkin, phase: available | carrying | resolved | dismissed}`. Pure actions select/offer/dismiss; explicit day reset prevents it carrying to tomorrow. Keep existing food `tray`, customer checkout phase and earnings unchanged. This is a sketch for evaluating scope, not a committed schema. An eventual release must decide save handling and own focused transition tests; no schema is changed by this document.

```text
Current:  meal -> change -> thanks -> next diner
Proposed: meal -> change -> thanks -> next diner (always available)
                               \-> optional paper -> tabletop changes -> thanks
```

Run a roughly 10-minute comparison with Callum and, if available, three other players. Each plays the same four-customer day with and without the favour; alternate order across players to reduce novelty/order effects. Keep customer performances and ambience identical across both versions, ideally using the reviewed baseline after 0062/0063, so those tickets do not confound the comparison. Do not add English to the game; a moderator can ask questions outside it.

Record whether each player notices it without prompting, chooses to help, completes without coaching, understands that ignoring it is safe, and later takes an optional second opportunity. Record extra active time and interruptions to serving. Afterwards ask: “Which version would you play again, and why?”, “Did that feel like caring for someone or doing another chore?”, and have them rate enjoyment and obligation from 1–5. Log the reasons, not just button counts.

Provisional success criteria for four participants (directional evidence, not statistical proof):

- At least 3/4 discover and complete it without coaching, and all can continue normal serving without completing it.
- At least 3/4 prefer the version with the favour and describe a concrete enjoyable moment; median enjoyment improves by ≥1 point while median obligation is ≤2/5.
- At least 2/4 voluntarily choose the repeat opportunity after understanding it, reducing the novelty-only explanation.
- Median added active interaction time is ≤10 seconds and nobody loses progress, misses a customer, or needs precise dragging/timing. Verify keyboard-only and reduced-motion paths separately; automation cannot establish screen-reader usability.

Stop or simplify if people perform it only because they think it is mandatory, ask to bypass it repeatedly, or describe it as another order with more clicks. If only Callum participates, report their preference and observations as a one-person result; do not claim the four-person thresholds were met. No experiment has run yet.

Intentionally left out: new food, recipes, inventories, economy, penalties, timers, multiple simultaneous requests, random scheduling, persistent relationships and audio-production changes to existing lines. Callum can choose any candidate, request a different direction, or retain the current loop. No implementation ticket should be created until that selection.

## Inspection and provenance

Primary sources: [[../decisions/0001-first-language]], [[../decisions/0002-platform-stack-and-art]], [[../decisions/0003-pixel-waiter]] (supersedes the earlier counter art/layout), [[../decisions/0004-hospital-opening]], [[../design/design-system]], [[build-recommendation]], [[../tickets/0064-brainstorm-restaurant-interactions]], current `src/contracts.ts`, `src/App.tsx` and `e2e/waiter.spec.ts`. No external research or comparative game claims are used.

Supporting evidence is committed in [docs/evidence/0064](../evidence/0064/README.md), exported from the original run. The [observation JSON](../evidence/0064/exploration.json) retains reported timings and dialog text; the [portable driver](../evidence/0064/explore.mjs) repeats the same desktop controls. Timings are one-run wall-clock samples including automation overhead, not a performance benchmark.

- Inspected [order](../evidence/0064/desktop-order.png), [kitchen](../evidence/0064/desktop-kitchen.png), [receipt](../evidence/0064/desktop-receipt.png) and [served-table revisit](../evidence/0064/desktop-revisit.png).
- Inspected [desktop restaurant](../evidence/0064/desktop-restaurant.png), [phone restaurant](../evidence/0064/phone-restaurant.png), [desktop journal](../evidence/0064/desktop-journal.png) and [phone journal](../evidence/0064/phone-journal.png). These support visible layout observations, not human touch or screen-reader usability claims.
- Bulk recordings remain local: `/workspace/evidence-0064/test-results/waiter-wake-in-the-ward-th-bc2de-change-journal-and-progress-{desktop,phone}/video.webm`. Recordings exist; screenshots and browser actions underpin these findings, not an audio audition or a claim of full video review.
- Check logs remain local: `/workspace/evidence-0064/unit.log`, `/workspace/evidence-0064/unit-node22.log`, `/workspace/evidence-0064/journey.log`, `/workspace/evidence-0064/build.log`. See ticket evidence for exact commands and reported outcomes; these are historical execution reports, not retained reviewer-accessible logs.
