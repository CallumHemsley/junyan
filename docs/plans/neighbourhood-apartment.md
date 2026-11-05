# Apartment: a home made together

Approved scope: a small freely decorated home within the recurring building ensemble. Preserve the pixel/isometric restaurant and hospital. Coffee shop is future social context only.

## First ten minutes

0–2 minutes: after the hospital, the player may visit home from the restaurant without losing a customer or tray. The apartment has a bed, window and empty floor. 林姐 offers a small table and chair in a visible delivery bundle. Accepting puts both in the room inventory; declining merely leaves the bundle available.

2–4: select the table, then tap a floor cell to preview and place it. Rotate a rectangular footprint with a 44px control. A resident says 放在窗户旁边。 Window and table give the line a concrete referent, but every legal placement is accepted. The player can instead put the chair to the left or right and hear 左边 / 右边. Moving things is the game, not a quiz.

4–6: experiment with a chair beside the table. Occupied/outside cells show a gentle outline and leave the last valid placement unchanged. Cancel restores the prior placement. A move can be undone; putting an object away returns it to inventory. Nothing is consumed or lost. The bed/door remain usable and one obvious route stays clear.

6–8: 林姐 offers a choice of a blue or cream cushion. Both are useful decoration with visibly distinct colours. The choice can later be swapped. A small/large rug choice changes the occupied area; turning a long table visibly changes its footprint. Residents notice the chosen arrangement rather than grade it.

8–10: leave for the building's cats, workshop or roof through shared navigation, then return to the same layout. Optional restored stool, planter and cat cushion arrive as idempotent gifts when their features award them. Before those integrations exist, the apartment remains independently playable with its starter furniture. Reload preserves the room and the restaurant session.

## Repeatable play and progression

Each visit offers arranging, storing, rotating, changing a reversible colour choice and seeing the room become personal. A day-based resident visit offers one small find/gift, claimed at most once that day, with a bounded authored catalogue. No daily chores, hunger, rent, timers or currency. Progress is a visibly furnished home and repeated social encounters, not a vocabulary score. The free editor never locks. Replay/tap help always works, recovery follows meaningful placement, and the shared journal remains accessible.

## Bounded implementation

One 6×5 floor grid; bed/window/door anchors; table (2×1), chair (1×1), rug (2×2), cushion and optional gift furniture. Pure state holds owned IDs, placements with x/y/rotation, colour choice, last gift day and one undo snapshot. Reducer validates bounds, collisions and protected door cells; rendering cannot silently correct state. Explicit actions select/place/rotate/store/undo/choose-colour/claim-gift. State validator rejects malformed items and geometry. Gifts must not duplicate owned objects.

Thin React view plus a feature-local pixel/isometric scene consistent with existing renderer/palette. Use DOM overlay controls for selected items and floor cells; keyboard access is equivalent to tapping. Keep accessible labels and speech segmented, no Chinese painted into scene. Reuse existing WordToken and callback-based audio/journal behavior; do not edit App or shared renderer.

## Mandarin and audio

Content families: 桌子、椅子、窗户、旁边、左边、右边、小、大、蓝色、放、转、收起来、可以、这里. Authored lines include 桌子放在窗户旁边。椅子放在左边。放在右边也可以。这个太大了。转一下。这样可以。 Each must be pre-segmented with accurate pinyin/gloss metadata and actual matching offline audio. No English UI or automatic pinyin. Visual cues carry the meaning; an optional resident suggestion never gates placement. Existing words reuse canonical data where possible. New voice clips require a working cloud synthesis pipeline; if unavailable, report audio incomplete and do not counterfeit assets or use browser speech.

## Verification and effort

0067: 1–2 engineering days including content, scene, tests and review; cloud synthesis access is an external risk. 0066 integration follows existing shared-file handoffs. Rules tests cover rotated collision/bounds, undo, store, daily/idempotent gifts and invalid saves. Browser journey acquires furniture, places/rotates it, tries an invalid move, undoes, looks up/replays, leaves/returns and reloads. Inspect 390px phone and desktop screenshots, keyboard/44px targets, reduced motion and console. Run original hospital→customers→change→journal flow, offline fetch/audio checks and save migration. Isolated harness evidence is useful but not integrated completion.

Success is observable: several legal layouts, immediate visible movement, no lost furniture on mistakes, repeatable visits, saved layout and useful resident speech. Record subjective enjoyment as untested until a person plays; automation cannot prove fun.
