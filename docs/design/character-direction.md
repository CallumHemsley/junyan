---
title: Breakfast regulars — compact Pixel Plays character direction
created: 2026-11-01
status: accepted-for-integration
ticket: 24
---

# Breakfast regulars

V3 is the design handoff for ticket 0024, not a replacement renderer. Parent inspected and accepted its eight-direction empty/full tray sheet, seated cast, 390px scene and chef sequence on 2026-11-01. Production integration and game/browser QA remain with ticket 0022's implementation writer and the visual orchestrator.

## Reference and originality

Inspected [3d.internet.dev](https://3d.internet.dev/) in the requested browser, particularly its ThreeJS idle/walk examples and separate body, front, head and face layers. Useful principles: a large readable head; small, deliberate gestures; hands visibly attached to an action; broad clothing masses; recognisable hair even in rear views. Borrow the principles, not the fantasy costume, purple palette, texture atlas or engine.

Checked the official [README](https://github.com/internet-development/skill-create-tactics-threejs-sprite/blob/main/README.md) and [LICENSE.md](https://github.com/internet-development/skill-create-tactics-threejs-sprite/blob/main/LICENSE.md). They explicitly put their custom `a1.png`, code, skill, documentation and inferred tables under MIT. They exclude the original game binaries/Square Enix material, vendor GPL code, item models and fonts from that MIT grant; those have separate terms. No reference asset, source code, font, model or game data is imported by this candidate. All new geometry is original Junyan work. The already-vendored Pixel Plays MIT attribution remains unchanged.

The reference tab was closed immediately when the user requested silence. All subsequent rendering uses offscreen Node, with no browser, audio, autoplay or system-volume adjustment.

## The concrete change

The old figure reads as a long stick-limbed mannequin with almost no face. V3 trades anatomical height for a compact, deliberate sprite: short grounded legs, broad shirt and cuffs, rounded cheek plane, two restrained eyes, a small nose, a subtle warm mouth and hair with a distinct outer shape. The waiter holds the tray with two bent arms instead of one disconnected extended arm. Back-facing geometry actually covers the tray through the existing depth buffer.

Use Morning Steam's existing cream, jade, tea wood and ink. Vermilion remains exclusively the new-word marker and 多谢 text treatment; it is not used on clothes, cheeks, props or confirmation graphics. Chinese labels and dialogue remain DOM text. The candidate contains no labels or game-rule changes.

### Coordinates and proportions

All figures use the existing world convention:

```text
F = (cos(yaw), sin(yaw))       forward
B = (-sin(yaw), cos(yaw))     side
P(a,b,z) = (px,py,base) + scale * (F*a + B*b, z)
```

Positive local `a` is the face/apron/tray side, not world `+x` or screen right. Positive local `b` is the arm called right in the candidate; retain this convention consistently rather than mixing anatomical and screen labels. World scene coordinates are already logical positions minus `(6,5)`. A yaw of `π/4` faces the isometric camera; `5π/4` faces directly away.

| Part | Standing local coordinates / radius |
| --- | --- |
| Hips / knees / feet | hip `z=.92`; knee `.48`; foot `.13`, lateral `±.19`; shoes extend `.20` forward |
| Torso | hip radius `.32` to shoulder `.35`, shoulder `z=1.59`; 林姐 uses `.36→.38` for a softer cardigan silhouette |
| Neck / head | head centre `a=.025,z=2.09`; head sphere radius `.37` versus old `.24`; short neck radius `.13→.14` |
| Face plane | second skin sphere at `headForward+.12,0,headHeight-.035`, radius `.30`; warm highlight `[239,191,152]` |
| Eyes | `a=headForward+.402,b=±.13,z=headHeight+.04`, radius `.038`; intentionally about one native pixel, not oversized black dots |
| Cheeks / nose | cheeks `a=+.367,b=±.19,z=-.07`, radius `.06`, muted `[208,149,117]`; nose `a=+.44,z=-.025`, radius `.055` |
| Mouth | two short warm `[176,119,88]` segments, `b=-.055→0→+.055,z=-.14→-.155→-.14`; no dark moustache band |
| Hair | rear cap `a=-.145,z=+.17,r=.30`; swept asymmetric fringe at `z=+.27→+.26`, leaving the eyes clear |
| Arms / hands | shoulders `b=±.34`; upper arm `.16→.125`; forearm `.105→.09`; hand `.12`; contrasting cream rolled cuff `.132` |
| Seated adjustment | hip `.76`, shoulder `1.47`, head `1.97`, forward feet `.39`; keep current scene scale `.88` so heads clear tables |

Radiuses are world units before `pose.scale`. Each world unit is 18 projected horizontal pixels. The complete standing silhouette including hair is approximately 2.56 world units high; the `.74`-unit skin head provides roughly 13 native pixels across before projection/occlusion. Do not inflate the entire character to solve face readability.

### Authored cast: preserve identity

V1 tested new clothing assignments and a bald elder; these were rejected. V3 restores the existing content appearances exactly. Do not change the voice/personality mapping or schema to integrate the art.

| Character | Preserve content colours | Distinct shape and gesture |
| --- | --- | --- |
| 林姐 / Serena | sage shirt `[142,157,119]`, tea hair `[67,48,36]`, `bun` | Softer/wider cardigan, cream insert, rounded side hair and high rear bun at `a=-.28,b=.18,z=head+.34,r=.19`; tiny jade pin; relaxed welcome |
| 张老师 / Uncle Fu | ochre shirt `[193,158,85]`, silver hair `[190,188,177]`, `glasses` | Full silver side-part and temples, not a bald substitution; two round tea-wood spectacle rims, pale lens centres, small pupils and bridge; cream collar and gentle forward inclination |
| 小李 / Yunxi | office blue `[81,108,132]`, neat dark hair `[43,37,34]`, `tie` | Clean swept fringe, sharper brow, cream V collar and thin tea-coloured tie; contained, tidy pose |
| 小周 / Xiaobei | plum shirt `[135,116,150]`, dark hair `[46,39,35]`, `backpack` | Long side ponytail ending near `a=-.40,b=-.43,z=head-.19`, ochre tie; ochre backpack/straps and a lifted greeting hand; distinctive from 林姐's high bun in front and rear views |

The waiter is cream `[245,232,202]`, dark trousers `[63,78,74]` and tea hair `[54,43,34]`, with a jade apron. This keeps the player lighter than the seated cast without inventing an accent colour.

## Tray and apron attachment

V3 apron is a short front capsule from `(a=.28,z=.85)` to `(a=.32,z=shoulder-.14)`, radius `.245→.22`. Shoulder straps travel down the front, pocket seam is subdued jade, rear waist tie is cream. It must rotate with the body.

The carrying pose uses elbows `(.26,±.43,1.12)` and hands `(.57,±.34,1.22)`. Tray bounds are `a=.43→1.01,b=-.43→+.43`, deck `z=1.28`, raised rim `z=1.32`. Six sample bowls occupy two forward rows `.58,.85` and three lateral columns `-.26,0,.26`.

The prototype's tray uses close-packed existing capsule primitives; it is a shape/attachment reference, not a requirement to replace the production worker's rotated box implementation. Keep whichever implementation preserves a flat top and genuine local-facing depth. Never conditionally hide a tray based on yaw. Food, hands, apron and tray must share the transform and depth buffer. In the directly rear-facing native render, the torso hides nearly all of a full tray; neighbouring directions show the correct small side edge.

## Ambient chef

Include the chef behind the counter at world `(.55,-4.83)` with `yaw=π/2,base=.25,scale=1`. The counter naturally hides the lower body. Cream work clothes and a small three-lobe cream cap are legible against the warm wall; the jade apron ties the kitchen crew together.

Use only the supplied `time` argument. The 9-second cycle stirs for seconds `0≤phase<6`, then chops dough for `6≤phase<9`. A fixed timestamp produces a fixed pose. The existing reduced-motion caller passes `time=0`, freezing chef and steam without another timer, subscription, random number or game-state change.

- Pot: centre `(.20,-4.12,1.59)`, radius `.30`; cream contents at `z=1.72`, radius `.25`. The stir tip follows a small circle inside this surface, rather than stirring empty air.
- Board: box from `(.62,-4.20,1.44)` to `(1.07,-3.75,1.49)`. Two small cream dough pieces sit at `x=.78,y=-4.08,-3.93,z=1.56`. The cleaver moves vertically over the board/dough in the chop phase.
- Exactly two hands: `pose.elbowR`/`pose.handR` feed the **same common arm loop**. Do not draw a complete default chef and overlay a third animated arm. The candidate asserts two hand primitives at five stir/chop timestamps. The other arm can be naturally occluded by the worktop.
- Keep the existing room steam; no new particle engine is needed. Dynamic chef prop geometry can be baked when integrating if it remains visually/depth-equivalent. Avoid unnecessarily duplicating the existing nearby bowl when placing the new pot.

## Candidate API and integration boundary

Shared local handoff directory:

```text
/Users/callumhemsley/Personal/junyan/output/playwright/character-design/
```

It is intentionally ignored by Git. The same files remain under this design worktree's `output/playwright/character-design/`. No production renderer file is changed or committed by the designer.

`candidate-geometry.mjs` exports:

```js
characterFigure(px, py, yaw, pose, palette, addBone)
// addBone(worldStart, worldEnd, radiusStart, radiusEnd, colorOfWorldZ)
// Returns {local(a,b,z), bone(localStart,localEnd,r0,r1,rgb), dot(localPoint,r,rgb), headHeight}.

characterTray(rig, foods)
ambientChef(addBone, time, sphere, box)
// sphere(x,y,z,radius,rgb,'solid')
// box(x0,y0,z0,x1,y1,z1,rgb)
```

`addBone` is directly compatible with existing `dynamicAdd`; it therefore uses the actual sphere/capsule renderer and dynamic shadow collection. No ThreeJS, imported mesh, replacement rasterizer, dependencies, DOM globals or new content schema are involved. `pose.carry` selects the two-arm carrying pose. `pose.elbowR`/`handR` allow the chef's explicit local targets. Appearance accessory strings remain `bun`, `glasses`, `tie`, `backpack`; `chef` is an internal art palette only, not a new customer type.

`renderer-candidate.mjs` is a **generated experimental scene** from the baseline renderer at parent `536f9d9`; do not copy it over the production file. `render-candidate.mjs` replaces only experimental figure/tray construction and adds a gallery callback while leaving the actual rasterization, lighting, dither, depth and shading implementation intact.

**Production writer must preserve semantic poses:** the prototype demonstrates the accepted appearance and greeting/carry poses, not every eating/served transition. Retain the production caller's `armR`, `armL`, crouch and lean intent when adapting it; the candidate's simplified customer arm defaults are not a mandate to discard those state-driven art poses. Likewise, the candidate food bowls demonstrate placement/occlusion, not new food artwork.

## Evidence and acceptance

Run the silent, dependency-free prototype from the worktree:

```sh
node output/playwright/character-design/render-candidate.mjs
```

The PNG writer uses Node's standard-library zlib. Canvas is an in-memory `createImageData`/`putImageData` shim; rasterization is still Pixel Plays. Assertions check repeat-render byte equality and exactly two chef hands at `t=0,2,6,6.2,7`.

| Evidence file | What was inspected |
| --- | --- |
| `contact-sheet-v3.png` | Six columns: waiter, 林姐, 张老师, 小李, 小周, chef. Front `yaw=π/4` above, rear `5π/4` below; native rasters enlarged nearest-neighbour 3× |
| `seated-v3.png` | Four customers at current `.88` seated scale, side/three-quarter angle; visible hair/face and shirt/accessory differences |
| `waiter-eight-directions-native.png` | Eight actual scene crops, empty tray above, six bowls below; starts `yaw=π/4`, increments `π/4` left to right |
| `waiter-eight-directions-3x.png` | Identical pixels enlarged 3×; front grip, side tray rotation and rear occlusion inspected |
| `restaurant-native.png` / `restaurant-3x.png` | Complete original restaurant at 360×280 / 1080×840, four regulars, waiter and chef |
| `restaurant-phone-390.png` / `restaurant-desktop-720.png` | Scene-only nearest-neighbour scaling to 390px and 720px wide; these are not full-app browser screenshots |
| `chef-prop-contact-sequence.png` | Eight actual-render crops: `t=0,.65,1.3,1.95,6,6.18,6.36,6.54`; stir/board-contact motion and arm count |
| `contact-sheet-v1.png`, `seated-v1.png`, `contact-sheet-v2.png`, `seated-v2.png` | Retained iteration evidence, **not** the accepted palette/elder design |

Three inspected passes removed the first version's muddy brow, strengthened hair silhouettes, restored authored appearances, replaced the bald elder with silver hair, eliminated the duplicate chef arm, and tied cooking motion to actual props. Parent explicitly accepted V3 direction after its final native/3× inspection.

### Honest limits and remaining gate

This is a design-only commit. No production implementation, rules test suite, full-app Playwright journey, console check, persistence test or pronunciation check is claimed. At native 360×280, a face is about a dozen pixels wide: identity must primarily survive through hair, clothing and gesture, not detailed portrait expression. Phone/desktop outputs validate scene scaling, not final DOM overlay composition. The production worker/orchestrator must inspect the integrated scene, loaded/empty eight-direction sheets, walking/served poses and reduced motion, then run the appropriate game and browser checks silently before publication.
