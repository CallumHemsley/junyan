---
title: Cozy progression through a home, familiar people and new situations
created: 2026-11-06
status: draft
tags: [research, progression, economy, game-design, immersion]
---

# Cozy progression through a home, familiar people and new situations

Recommendation: make breakfast work improve the player's life visibly. A short shift earns money for a small apartment; regulars introduce places and requests; the player chooses the next small outing. Mandarin is how the player gets things done. Money buys belongings, not language proficiency.

This is a design proposal, not an accepted decision or a finding that these mechanics improve language acquisition. The sources below establish shipped precedents; no retention or learning-effect estimate follows from them.

## Constraints from this project

Accepted [[../decisions/0003-pixel-waiter]] supersedes the fixed illustrated counter and non-pixel art in decision 0002. Build on collecting orders, picking up food and delivering it in the existing isometric restaurant. Accepted [[../decisions/0004-hospital-opening]] makes recovery happen through successful action and allows English only in the bounded opening. Homes, shopping and social scenes must keep Mandarin DOM text, segmented tappable words, voiced dialogue, optional pinyin on tap and the existing palette/accessibility rules. Purchases must never mark words recovered automatically.

The first slice remains offline, deterministic, schema-validated content and IndexedDB. This note does not authorize a generated open world, backend, renderer replacement or new dependencies.

## What first-party sources establish

| Evidence | Design inference for Junyan | Limit |
|---|---|---|
| Nintendo describes adding rooms, furnishing themes, customizing exteriors and choosing which vendor shop to fund first. It also describes daily tour limits, seasonal items and perishable turnips. [Nintendo's island-life guide](https://www.nintendo.com/jp/ichikara/acbaa/03_en.html) | A home makes earnings tangible; choosing an upgrade order gives agency. Borrow personalization, while leaving calendar limits and loss-on-absence out of Junyan. | These features coexist; the guide does not isolate which causes enjoyment or retention. |
| Unpacking's official site describes eight house moves, a story conveyed through possessions kept or left behind, and play without timers or scores. [Witch Beam](https://www.unpackinggame.com/) | A familiar cup, a gift and a changed room can carry progress without a numerical proficiency display. Objects can remain meaningful after their purchase. | This supports environmental storytelling, not a renewable economy or thousand-hour content promise. |
| Spiritfarer couples building a boat, caring for passengers, varied practical activities and character relationships. [Thunder Lotus](https://thunderlotusgames.com/games/spiritfarer/) | Connect practical actions to people and a changing home, rather than presenting isolated earning tasks. | Its breadth is not a sensible initial production scope for Junyan. |
| In a developer-marked reply, ClockworkXI explains that neglected passengers become hungry and their mood drops, but feeding them restores it without lasting consequences. [Developer reply, 20 August 2020](https://steamcommunity.com/app/972660/discussions/0/2799504352983552074/) | Friction can be recoverable. An incorrect delivery can prompt clarification and another attempt without debt, lost friendships or eviction. | The claim is specifically about hunger/mood; it does not establish that every Spiritfarer system has no time pressure. |
| A Short Hike's creator describes a summit destination with marked trails or backcountry exploration, other hikers and hidden treasures. [Official site](https://ashorthike.com/) | Offer a clear next destination with a small choice of ways to reach it. An optional errand can be worthwhile without a checklist of everything in town. | This is a bounded exploration precedent, not evidence for unlimited procedural variety. |

## Proposed loop

```text
Choose a small intention: a lamp, a visit, a new dish
                     ↓
Serve a short breakfast shift with familiar people
                     ↓
Earn money + encounter one changed situation
                     ↓
Choose: buy something / visit someone / go home
                     ↓
Place or use the new object; see a relationship advance
                     ↓
Tomorrow offers a familiar task with a new purpose
```

The apartment is a place to return to, not an upgrade menu. Initially it can be one compact room and a few authored placement spots, using the current renderer. The player chooses between equally viable belongings: a warm lamp, a small plant, a tea set. A regular's later visit or gift makes the room part of the story. Do not make decoration increase wages or language XP; that would turn expression into an optimization problem.

Use concrete objects to give language a consequence. A shopkeeper offers two lamps; choosing the small one changes the room. A guest asks for a cup; serving it reuses an interaction learned at work. A shelf-placement request later introduces location language. These are candidate scenes requiring native-language review, not verified beginner Mandarin scripts.

## Economy: enough structure to make choices matter

Proposed rules, all unvalidated until playtested:

- One spendable currency. The player receives an explicit wage or share from the aunt; do not silently equate restaurant revenue with personal disposable income.
- Each completed short shift provides a predictable base payout. Optional favors may give a modest extra or a keepsake; replaying audio and looking up words never lower pay.
- Resolve mistaken orders by trying again. Successful completion still earns the normal payout. Do not reward deliberately making and repairing mistakes.
- Keep food stock and business expenses abstract initially. Avoid rent arrears, hunger meters, item durability, bankruptcy and compounding income multipliers.
- First choice of a visible room item after the first completed shift; ordinary later items around one to three shifts. These are prototype pacing targets, not research-backed numbers. Display the price and current balance clearly.
- Let the player save for something appealing while another story or outing remains available. Essential story access should not require repeatedly grinding the highest-paying order.
- Owned objects can be rearranged freely; offer preview before purchase. A larger room is an optional later milestone, not a replacement that makes early possessions worthless.

Currency alone cannot sustain interest. If the player serves only to fill a purchase bar, more furniture will postpone rather than solve the problem. The test is whether the next shift contains an enjoyable decision or human development even when the player has enough money.

## Variety: change the situation before increasing the word count

A small scenario set can reuse verbs, props and people while altering the player's intention:

| Situation | Meaningful action | Familiar material reused |
|---|---|---|
| A regular brings a friend | Deliver the right items to two people | Existing foods and delivery |
| Takeaway breakfast | Select a bag and hand over the order | Food names, quantities, handover |
| Shopping after work | Choose between two visible objects and pay | Numbers, money, object selection |
| Tea at home | Fetch and place a requested cup | Pickup/deliver, person recognition |
| A borrowed object | Return it to the right person or place | Known object plus a location |
| Planning tomorrow's special | Choose which familiar dish to feature | Existing menu vocabulary, consequential choice |

These are proposals, not six immediate new systems. Start with one after-work shopping scene and one home interaction. Introduce no more than one unfamiliar mechanic in a scene, and avoid simultaneously adding vocabulary, timing, navigation and order complexity.

Later scenario packs should specify prerequisites, participants, setting, objects, explicit valid actions, repair responses and consequences. Schedule from validated eligible scenes with injected RNG. Recombination is constrained: character motives and object affordances must still make sense. Varying sentence wording alone is not a new scenario. If generated content is investigated later, generate and validate offline; do not make runtime model calls necessary to finish a scene.

## No streak pressure

Treat a day as a player-controlled episode. Leaving the app advances neither bills nor relationships; returning after a month resumes the same situation. No login streak, missed-day messages, expiring furniture, daily purchase rotation or mandatory review quota. Keep available invitations until played or explicitly declined; allow a declined optional invitation to return in a sensible later context.

Relationship progress should be remembered events, such as helping a regular prepare for a family visit, rather than gifts per day or an affection meter that decays. Friends can have preferences and small disagreements without the player having to optimize every line. Replaying, tapping or taking time must not make a character disappointed in the player's language ability.

These are chosen design safeguards, inferred from the project's cozy premise and the recoverable/untimed precedents above. The reviewed sources do not prove that removing streaks improves retention or learning.

## Smallest useful validation

Prototype one existing shift → one purchase choice → one visible home change → one short guest interaction using familiar objects. Include a second visit to establish that the change persists. Reuse the same room and regular instead of adding a town map.

Observe whether players can explain what they want to do next, remember why an object matters, enjoy the shift before receiving its payout, and understand the purchase without translation. Ask whether they would still play with all furniture unlocked; this distinguishes interest in the activity from reward chasing. Compare two equally priced objects to check whether players express a preference rather than hunting a hidden stat benefit.

Record lookup/replay usage without treating it as failure. Check that using help never changes earnings; pauses never advance penalties; two purchase orders remain viable; incorrect actions always have a recovery path; saves preserve money, owned objects and event history. Test Mandarin readability and tapping at phone and desktop widths.

Open questions for playtests: how long a shift feels satisfying; whether serving remains fun after several sessions; whether home visits feel like lived experience or disguised exercises; whether players want decoration at all. No evidence gathered here justifies promises of hundreds of hours, a broad town simulation or a claim that an economy by itself solves repetition.
