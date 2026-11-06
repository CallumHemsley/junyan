# Bounded contact/catalogue recheck

**Exact current app:** `e1e6d78c548b8c9bcd7a2a727e0e71a2b5041200`. Reviewed 2026-11-06 UTC. **Improved, with contact evidence still incomplete; no full visual PASS.**

Inspected all six desktop/phone PNGs individually and compared restaurant/customer and town-resident pixels with the corresponding e02 captures. The [desktop](desktop-manifest.json) and [phone](phone-manifest.json) manifests declare three visual fixtures each: two first-entrance morning saves and the unmodified recorded e02 `receipt-seated-1` save. They report no page errors. These are current-app renders of fixtures, **not new travel/service proof**.

This is the checkpoint consuming the b1fcbca character and d196bed restaurant work. Exact-head `characters/adapter.ts:57` still uses **18 pixels per world unit**; the future 15-pixel 4aad008 trial is not evaluated here.

## Improved

- **Seated visibility:** [desktop morning restaurant](desktop-morning-restaurant.png) and [phone morning restaurant](phone-morning-restaurant.png) now show complete customer faces, shoulders and some upper chest above the table. Compared with e02, the older patron's glasses and face are clearly legible instead of nearly disappearing behind the tabletop. Lin-jie's head and green upper body also separate much better from the furniture. The previous severe head-burial symptom is materially reduced.
- **Visible receipt state:** [desktop receipt](desktop-receipt-seated-1.png) and [phone receipt](phone-receipt-seated-1.png) preserve the seated patron while displaying the receipt. The standing player reads in front of the table with feet on the floor; there is no obvious floating-foot or foreground-table overlap defect in this one captured position. This is a saved-state rendering check, not a new successful receipt interaction.
- **Aunt identity:** [desktop morning town](desktop-morning-town.png) now shows a distinct resident to the right of the restaurant: bobbed hair, grey-green clothing and a diagonal bag strap, compared with e02's duplicate player apron/hair. Exact-head `characters/catalog.ts:15–17` supplies separate player and aunt entries, consistent with these pixels. The old aunt-as-player visual fallback is resolved in this desktop view.

## Still weak or not established

The diners remain largely hidden below the upper torso by the far-side table/stool assembly. **These views do not reveal enough pelvis, seat surface, knees or feet to verify full seat and ground contact.** Normal furniture occlusion is expected; hidden legs alone are not proof of a new rendering defect. I am not carrying forward the old combined-stool diagnosis as a newly demonstrated failure.

Table/stool proportions still feel large against the standing player at this 18-pixel checkpoint. Source confirms tabletop 1.44 and stool top .77 remain unchanged in `restaurant/furniture.ts`. The body alignment improvement therefore does not settle the broader common-scale judgment. The future 15-pixel trial needs its own integrated comparison.

The phone town frame does not include the aunt, so it supplies **no phone identity comparison**. Its SHA-256 is identical to the corresponding e02 phone town frame. Desktop identity success should not be presented as both-viewport NPC proof.

## Pending evidence

**0085 characters + 0089 restaurant, integrated by 0078:** current-head ordinary service and movement around tables from front, side and behind; a seated angle that exposes pelvis-to-stool and feet-to-floor contact; all four customer appearances; receipt closure/departure. Preserve legitimate foreground occlusion. A sprite sheet or source contract alone cannot establish those contacts.

**0085 + 0087 world-life:** player and aunt together in an actual phone frame and a short ordinary walk showing their distinct silhouettes. Future scale/scenery changes require fresh exact-head captures.

No production edits, build/server actions, or changes to earlier reports were made. The full goal remains **ACTIVE**.

## Capture identity

| Capture | SHA-256 |
|---|---|
| desktop-morning-restaurant.png | `07471ce16609d21e0260192d7737ccdb7548d9592df75e8515094008db07fe82` |
| desktop-morning-town.png | `4359c8e4c5fcf8366d1de466e45ae681291b428111fa72641aa8d06f22f685ed` |
| desktop-receipt-seated-1.png | `594b7b1740bd1935f0679c6f5b56047e313d790b79e31a4515d6603c3236dad9` |
| phone-morning-restaurant.png | `e376eb9c5e47052977458fd93ba1336e3c326f61876536c3cad081967acc7e43` |
| phone-morning-town.png | `98b37e33793c5f152103b322b6f4dcc750534eb6b1ff86fed10c58af5f474124` |
| phone-receipt-seated-1.png | `7bc04a419819499f64a28dd018aea550eb88ce6ca059a77d93d1339b233f2943` |

