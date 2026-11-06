---
title: Hidden review and neighbourhood progression — architecture investigation
created: 2026-11-06
status: draft
tags: [research, architecture, progression, learning, neighbourhood]
---

# Recommendation

Add one pure progression module that records evidence from successful play, recommends an available neighbourhood activity, and accounts for spending. Keep permanent word recovery and its visual fog separate from uncertain learning estimates. Ship one reachable loop: serve customers, receive a Mandarin recommendation, complete an existing neighbourhood interaction, buy and place a home improvement, reload, and continue tomorrow. A review schedule with no effect on available play does not complete this slice.

This is a local source investigation, not a learning-efficacy study. Proposed intervals, reward values and difficulty thresholds are design hypotheses requiring playtesting. No tests were run for this documentation-only investigation.

## Existing seams

| Concern | Verified implementation | Consequence |
|---|---|---|
| Learning | `src/contracts.ts:79` defines journal entries as lookups, lastSeen and recovered; `src/game.ts:134` only recovers previously unrecovered IDs | Recovery is a permanent narrative state, not a recall estimate. Repeated successes currently stop updating it. |
| Shared outcomes | `src/neighbourhood/transitions.ts:43` routes all feature actions, validates active location/time, then updates shared journal | Add learning/economy integration here after genuine accepted transitions. Do not accept arbitrary word-success lists from React. |
| Session boundary | `src/opening.ts:136` routes opening, game and neighbourhood actions | A natural home for routing new cross-feature purchase/recommendation actions without spreading rules through App. |
| Restaurant | `src/game.ts:67` chooses orders by table and day-capped level; `src/game.ts:281` recovers every order token on delivery | Choose authored variants with the scheduler later; attribute success only to assessed target words, not every token in a sentence. |
| Earnings | `src/game.ts:186` preserves earnings across days; `src/game.ts:315` credits successful payment | Earnings are cumulative revenue, not a daily reset or existing spendable wallet. Preserve this invariant. |
| Apartment | `src/features/apartment/rules.ts:40` starts with a bed; starter furniture, daily finds and cross-feature gifts are currently free | Add a purchase path; do not remove existing ownership or silently convert gifts into locked purchases. |
| Persistence | `src/save.ts:11` parses game state; `src/save.ts:89` validates earned revenue; IndexedDB stores the v1 key | Explicitly parse new progression fields or Zod will discard them. Do not decrement earnings for purchases. |
| Content | `src/neighbourhood/content.ts:30` registers namespaced content and rejects conflicting tokens | Reuse approved canonical IDs across scenarios; identical hanzi alone do not prove identical lexical sense. |
| Repetition | `src/features/cats/rules.ts:75` rotates encounters; repairs support restarting completed jobs at `src/features/repairs/rules.ts:43`; garden synchronizes on day advancement | Existing activities can support varied replay without another scene engine. |

Decision 0003 supersedes decision 0002's illustrated counter with the Pixel Plays isometric waiter. Keep that renderer, DOM Mandarin, offline prerecorded audio, injected time/seed, and thin React. Decision 0004 makes word recovery permanent by successful use; do not refog recovered words when review becomes due. Tokens and accents remain governed by `docs/design/tokens.json`.

## Two candidate state shapes

**A — optional review fields inside each journal entry.** Add `review?: { dueDay, intervalDays, successes, lastPracticeDay, lastScenarioId }`, plus a separate economy object. This minimizes first-time learning edits. It is awkward for scenario completion receipts, recommendation stability and activity cooldowns; a collection of word records cannot express whether an encounter is available or already rewarded. Opening and journal rendering also inherit fields unrelated to visible memories.

**B — separate optional progression aggregate, recommended.** Keep journal as the public memory collection. Add `progression?: Progression` to GameState, normalize absence on load, and centralize its pure rules. A concrete starting shape:

```ts
type Progression = {
  version: 1;
  spent: number;
  bonusEarned: number;
  purchases: string[];
  review: Record<string, {
    dueDay: number;
    intervalDays: number;
    successes: number;
    lastPracticeDay: number;
    lastScenarioId: string;
  }>;
  daily: {
    day: number;
    recommendedScenarioId: string | null;
    completedScenarioIds: string[];
    lookedUpWordIds: string[];
    rewarded: boolean;
  };
};
```

Spendable money is derived as `earnings + bonusEarned - spent`; do not persist a second mutable balance. `purchases` is a durable ownership receipt, including restoration if the apartment payload alone becomes malformed. If no side-activity cash reward is wanted, omit `bonusEarned` and `rewarded` rather than introducing inert fields. The daily recommendation is persisted so a lookup or reload does not unexpectedly replace a task already underway.

Proposed pure API, with implementation names illustrative:

```ts
availableScenarios(game, catalog): Scenario[]
chooseRecommendation(game, scenarios): string | null
recordPractice(progression, evidence, day): Progression
purchaseUpgrade(game, upgradeId, catalog): GameState
restoreProgression(raw, game, catalog): Progression
```

Evidence is produced from before/action/after state inside reducers, never trusted from UI: `{scenarioId, targetWordIds, outcome: 'independent' | 'supported' | 'retry'}`. Clock time can still log lookup timestamps; use injected in-game day for this first hidden schedule. Absence from the game creates no debt, rent penalty or failure state.

## Make the director change play

1. Define a small authored scenario catalog with a stable ID, location, actual target word IDs, and an availability predicate over real feature state. A recommendation routes to the existing location. It never automatically completes the interaction. Repairs can recommend an unfinished or restartable lamp/toy job; cats must distinguish unfinished reunion from a repeat encounter already completed today; garden must only propose care that can still be performed today.
2. Rank available scenarios by due-word coverage, then variety, then a stable seed tie-break. If no due words match, recommend an available unseen or least-recent scenario; if nothing is actionable, show no recommendation. Completing today's task should not force more work. Leave every existing location freely accessible.
3. Record outcome evidence on actual feature transitions. Cats' `recoveryForTransition` at `src/features/cats/rules.ts:197` returns a set difference, so reusing it alone loses repeated practice. Repairs' durable `completed` set likewise cannot detect a second completed repair: inspect a successful `return` changing its live job to null. Garden outcome evidence must distinguish an action from simply visiting or synchronizing a day.
4. Give one optional fixed completion reward per in-game day, if selected for the product. Persist the receipt atomically with the outcome. Tapping hints remains allowed and never reduces pay; supported success simply grows the hidden review interval more cautiously. Prevent repeated placement, reset/repair loops, double clicks and reloads from multiplying payouts or review successes.
5. Add a small catalog of genuinely purchasable improvements with Mandarin tokenized names and voiced lines. Debit and grant ownership in one pure transition. Apartment placement undo must not undo purchases or refund money. At least one affordable upgrade should be reachable through the tested loop; later prices can establish longer goals.

For the initial review policy, count at most one qualifying practice per word per game day, reuse it across scenes via canonical IDs, and prioritize another context before increasing difficulty. Treat mistakes as ambiguous task evidence rather than proof every sentence word is unknown. A lookup should affect evidence for the relevant activity, not mark all later uses in the day as failures: the proposed daily lookup set is deliberately conservative and should be replaced by a scoped encounter record if that distinction matters in this slice. Interval constants remain tunable; do not claim an empirically optimized scheduler.

A daily board gives meaningful choice across existing activities but cannot alone teach all vocabulary: its scenario catalog has finite coverage. Restaurant selection can later rank playable authored orders with due targets while retaining the existing per-table/level constraints. Save validation currently requires each order's level to match the day-derived level; relaxing that is a separate explicit schema/invariant change.

## Migration and verification constraints

- Old saves initialize empty progression and preserve cumulative earnings, journal, hospital completion and every feature state. Do not infer reliable recall from `recovered: true`; old recovered words can start eligible for gentle practice. Validate malformed progression independently, preserving valid sibling game data. Specify conservative handling of malformed spending so resetting progression cannot mint refunded cash.
- Keep canonical words stable. Feature registration permits base canonical words but requires new words to use the feature namespace. Cross-feature reuse needs an explicit canonical vocabulary/alias decision; merging by rendered spelling risks conflating senses and conflicting audio metadata.
- Test repeated action/reload idempotence, exact affordability, negative/unknown prices, ownership restoration, day rollover, unsupported scenarios, availability changing after completion, stable seeded choices, no practice credit from visiting, and old-save migration. Preserve apartment's bed/collision/undo invariants and all gift receipts.
- Run `pnpm test`, `pnpm build`, and the existing Playwright suite on explicitly allocated distinct dev/preview ports (`JUNYAN_DEV_PORT`, `JUNYAN_PREVIEW_PORT`). Add a browser journey through recommendation, real completion, purchase, visible placed change and reload. Inspect phone and desktop screenshots and clean console output; retain the hospital/customer/change/journal journey.
- New language is Zod-validated, presegmented and voiced offline. Verify produced audio assets and production offline caching, with no English beyond the accepted opening and no default pinyin. Do not make an unverified claim of completion based solely on metadata tests.

## Pstack installation and applicable workflow

The installed plugin is `/Users/callumhemsley/.claude/plugins/cache/cursor-plugins/pstack/0.15.32`; `pstack` is not on this shell's PATH. Its `skills/poteto-mode/SKILL.md` and `skills/how/SKILL.md` exist, as do investigation, feature and autopilot playbooks. `show-me-your-work` exists; no standalone `show-me/SKILL.md` was found in this installed version. The historical `docs/plans/hospital-opening.md` contains gh commands, but the current user AGENTS instructions require the GitHub connector instead.

This investigation supplies the code evidence and two candidate shapes for the parent's architecture decision. It does not invoke an autonomous shipping workflow, change an accepted decision, publish a PR, or claim live verification. Shared contracts/save/content edits need one writer; feature-local evidence adapters can be split only after that contract is settled.
