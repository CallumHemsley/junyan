# Rooftop edge context follow-up

ACTIVE ticket0083, worker thread01a1ae20-85bf-7293-b853-cd8a6ebb7057. Review target is assembly `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`; the parent identified the exposed southern arrival edge in review456fce9. Source fix is `ef2e283` after first study693039b. Independent visual acceptance remains open.

The original `skyline()` only placed buildings at negative Y. At the stair arrival, the large exterior area west/south of the parapet therefore remained the shared painter's flat dark green. The new render-only roofscape adds lower neighbouring terrace/tile/sawtooth roofs, tanks, laundry, bounded street/courtyard strips and the garden building's lower south/east façades. Farther blocks use cooler, lower-contrast material bases; all primitives still use the authoritative `view.shadeColor` callback. No fullscreen wash, independent clock, renderer, lighting controller, new audio, collision, map content or saved garden change.

Every new neighbouring building footprint is beyond the playable map, with its roof and rooftop details below garden height. The façade continues below the existing parapet. It never becomes a collider or selectable activity. Entirely offscreen neighbouring blocks are culled using projected bounds. Existing roof circulation and state-derived plants remain in their original owner modules.

## Actual production App comparison

Captures come from the built assembly through the real App/WorldViewport, not the isolated art harness. `capture.mjs` uses the independent review's valid saved-game fixtures. The stair arrival is (12.5,29); the city-facing lookout is (44,12). Desktop1440×1000 and phone390×844 match the review camera inputs. `before.json` and `after.json` record matching positions, phase/served count, viewport and actual logical canvas dimensions. Browser console/page error lists are empty. These declared-camera fixtures establish the visible result, not a new traversal claim.

| View | Before | After |
|---|---|---|
| Desktop evening stair arrival | [before](before-desktop-evening-arrival.png) | [after](after-desktop-evening-arrival.png) |
| Phone evening stair arrival | [before](before-phone-evening-arrival.png) | [after](after-phone-evening-arrival.png) |
| Desktop evening city lookout | [before](before-desktop-evening-city-lookout.png) | [after](after-desktop-evening-city-lookout.png) |
| Phone evening city lookout | [before](before-phone-evening-city-lookout.png) | [after](after-phone-evening-city-lookout.png) |

Morning captures are also retained. The original before-phone-morning captures include a delayed welcome dialog and are not used as the primary unobstructed comparison. The final capture driver dismisses that dialog through its ordinary button; final after views are unobstructed. No internal gameplay dispatch or renderer replacement is used.

The first after study made the lower façade too dominant. The inspected iteration1 images retain that rejected proportion. The final source shortens the visible drop and moves neighbouring roofs closer, exposing more lower roof context while retaining the clear parapet boundary. This is an authored visual refinement, not a claimed independent review PASS.

## Checks

`checks.log`:19 existing garden/map/art tests pass, including all720 legal pot/shade arrangements and shared navigation/compositor checks. `build-before.log` and `build-after.log`: production builds pass. `git diff e02a747 -- src` contains only `src/world/art/rooftop/index.ts` and the new `roofscape.ts`; map bounds, colliders, anchors, saved plants and gameplay rules are unchanged.

Before product bytes match assemblye02a747. After captures record sourceef2e283. The later evidence commit changes no product source. Inspect desktop and phone arrival/lookout views before acceptance. The broader full rooftop/world goal remains ACTIVE.
