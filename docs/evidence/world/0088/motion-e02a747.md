# Sampled motion review — e02a747

Production head: `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Evidence publication: `613c9ae1aa46819a9cbbfb2ab5a6cf19931042e4`. Reviewed 2026-11-06 UTC. No application changes, checkout, build, server, or browser actions.

**The sampled videos establish real traversal and visible service/cat state changes beyond the arrival fixtures. They do not close the visual, acting, or full-world gates.** This is a targeted frame-sequence review, not continuous viewing or a frame-pacing assessment.

## Sources and sampling

| Video | Encoded dimensions/rate | Duration | SHA-256 |
|---|---|---:|---|
| [Desktop ordinary route](integrated-e02a747/desktop-ordinary-route.webm) | 800 × 554, 25 fps | 250.520 s | `7af996113952eb5be648ab82f40e9c1cd0c14fc82545a6ae5361132ae3807115` |
| [Phone ordinary route](integrated-e02a747/phone-ordinary-route.webm) | 390 × 664, 25 fps | 236.920 s | `66718a86f68f723806329d6ef004b8e376c3832007683e183729ff6799b9879c` |

Used [desktop events](integrated-e02a747/desktop-journey-events.jsonl), [phone events](integrated-e02a747/phone-journey-events.jsonl), and the [journey runner](integrated-e02a747/journey.spec.ts). Each event log contains 37 stages spanning all ten maps, three explicit service departures, and cat reunion. These are log findings; I did not continuously watch all ten map traversals.

The runner uses ordinary canvas clicks and UI controls, with route targets computed from published geometry. This is useful integration evidence but does not establish unassisted player discoverability. Event timestamps are wall-clock values recorded after actions; their relative times are **not** video timestamps. The videos include opening scenes before the first event. All time ranges below refer directly to **seconds from the video start**, found by inspecting decoded frames.

Decoded with ffmpeg into temporary in-memory contact sheets; no uploaded or persistent derived images. Reviewed windows:

- Desktop: 0–12 s at 1 fps; 13–17 s at 2 fps; 14.8–15.8 s at 10 fps; 43–48 s at 1 fps; 194–200 s at 1 fps.
- Phone: 33–39 s at 1 fps; 59–74 s at 1/3 fps; 110–128 s at 1/2 fps; 128–134 s at 1 fps; 185–197 s at 1 fps; 188–190 s at 4 fps; 186–188 s at 6 fps; 186.6–187.24 s at encoded cadence 25 fps (cropped to the scene).

Some low-frequency sequences establish spatial progression, not fine gait or transient defects. Even the short 25 fps sample represents the encoded recording, not a measurement of rendering latency or display smoothness. The later runner stop at the furnishing-grid control is reported as a reviewer-script issue; these samples neither diagnose an application failure there nor establish the uncompleted later gates.

## 1. Traversal is real; the scenery still needs stronger continuity and destinations

**Owners: 0078 foundation, 0084 landscape; 0081 residential for stair construction.**

Phone **33–39 s** shows the player cross the restaurant floor, leave at its front edge, appear at the town restaurant door, then walk along the street while the camera tracks. Desktop **43–48 s** shows an approach through the town gateway, roof fading during overlap, a map transition, and continued courtyard movement. These are materially stronger than ten isolated map fixtures: the sampled entrances/exits connect through actual movement. The player remains readable in these specific door samples. Hard map cuts are visible; a cut by itself is not classified as a bug.

The phone route at **110–134 s** reveals the more serious experience gap. After the town-to-riverbank transition, the avatar spends a long stretch crossing almost empty lawn beside a straight, repeating background-tree boundary. The view lacks a river, a destination silhouette, or much changing foreground detail along this sampled shortcut. The eventual park transition returns to closely related path/tree shapes. This does **not** establish that the river is absent from the full map; it shows that the actual route can bypass its identity and feel like traversal across filler space.

At phone **59–74 s**, movement through the stair map reaches landings and the apartment, but the striped flights and unsupported-looking landings continue to read as flat floor strips. These widely spaced samples cannot validate elevation or feet-on-treads.

**Carry forward:** route composition and terrain detail should reveal purposeful landmarks during real travel, not only at a chosen scenic viewpoint. Keep the successful door/camera behavior while repairing physical stairs and landscape edges. Recheck ordinary routes from both directions, not just declared arrival frames.

## 2. Receipt lifecycle works in the sample, while seated acting and departure remain visually weak

**Owners: 0085 characters, 0089 restaurant, 0078 foundation; 0087 world-life for departure behavior.**

Desktop **13–17 s**, with the denser **14.8–15.8 s** sequence, shows the player return from the kitchen, stand beside table 1, complete payment/receipt, close it, and leave the table. The customer is still visibly present while the receipt is shown and is absent after closure. The event log corroborates `receipt-seated-1` followed by `released-1`; subsequent release records increment departure count to two and three.

This is successful presence timing at the sampled first receipt. It is **not** convincing seated or exit acting: the customer's body remains mostly hidden by the table, and the patron disappears across the receipt-close frames without an observed walk from chair to exit. The 10 fps window contains no legible stand-up or departure path; this does not claim that an extremely short transition could not occur between sampled frames.

The actual service view reinforces the prior [seating/catalog source addendum](seating-catalog-e02a747.md): seat attachment, table/stool proportions and depth sorting need coordinated correction. Preserve the demonstrated rule that receipt closure releases the customer. If departure is meant to convey a living restaurant, stage a readable stand/turn/leave sequence or another explicit departure treatment instead of relying solely on removal.

**Recheck:** normal service for all four appearances, seated front/side/rear visibility, player passing in front and behind furniture, receipt closure, and a visible departure. A passing presence assertion or isolated character sheet does not close the acting gate.

## 3. Cat progress is visible, but the follow beat reads as relocation before the player's walk

**Owners: 0080 courtyard/cat story, 0087 world-life, 0085 character/animal presentation; 0078 foundation for camera/occlusion.**

Phone **185–197 s** and desktop **194–200 s** show the white cat around the bicycle/player, then near the house doorway, with the player moving after it and continuing around the building. There is visible world feedback, not only a changed dialogue panel. The event logs then record both `cat-reunite` and `cat-world-reunited` with story node `reunited`; that supports progression, not an independent continuous-animation pass.

The denser phone **186.6–187.24 s** sequence shows the specific presentation problem: the cat is beside/overlapping the player at the bicycle, then appears at the doorstep as the narrative panel advances. No intermediate path is visible in those adjacent encoded-cadence samples. The broader **188–190 s** sample shows the player catching up and the cat disappearing from the exposed doorstep region; subsequent roof fading and a large building obscure the route.

This is more accurately described as **state-driven relocation followed by the player's walk** in the inspected segment than as a clearly acted cat-led journey. It is not evidence of a persistent cat-trailing-player system, and the review does not assume that such a system was intended.

**Carry forward:** connect the staged cat positions with a readable world-space movement/turn/pause, keep enough separation from the player's silhouette to see the cat, and preserve visibility or a clear directional cue through the doorway/roof overlap. Retain correct story/reward progression. Recheck the complete cat beat at normal playback speed plus native-cadence frames on phone and desktop, including reunion and return.

## Gate impact

These samples improve the evidence for connected ordinary travel, receipt-triggered release, and cat progression. They do not upgrade the existing **2/4 partial visual checkpoint**, remove the landscape/seating weaknesses, validate raised stairs, prove sustained resident routines, or waive the independently reproduced rule-test failure. Full goal remains **ACTIVE**. Existing reports were left unchanged.

