# Arrival guidance integration contract

Status ACTIVE. This is a shared-wiring request, not a new proximity widget. Foundation owns `WorldViewport`, `world.css`, compositor and current camera. Map owners own the target's ground cue geometry. The owned contextual shell does not project world coordinates or choose nearby targets.

## Evidence and current source

Foundation source e48b10e was inspected through the explicitly refreshed tracking ref. Its camera now accounts for contextual width and authored surfaces. Its arrival UI still renders `nearby.map(...)` separately from `lifeOptions.slice(0,2)`. The latter produces detached identical rows when nearby landmarks share `action-look`.

The separately labelled e02 visual/setup fixture at town position 34,30 validates through `validateSavedGame`. Existing `town.restaurant-approach` and `town.breakfast-steam` are 0.9 world units apart and both offer `看看`. At 390×664 and 320×568, the screenshots show two identical detached `看看 →` rows. Tokens and action buttons meet 44px and lookup Escape restores word focus. These captures prove the ambiguity, not ordinary travel or e48 runtime behavior. The relevant nearby-row source is unchanged in e48.

Consume the existing owned repairs 9116478 and 8a6bf38 before integrating this guidance. They repair footer contrast and narrow-short panel precedence. Do not duplicate the newer foundation camera or surface-picking changes.

## Reuse target identity

The existing life `Affordance` already supplies `id`, `targetId`, `kind`, `position`, and registered `label: Line`. No new public UI type or icon registry is needed. Foundation can derive an ephemeral unified view from authoritative available anchors and life affordances with these fields:

```ts
type NearbyTargetView = {
  key: string;
  source: 'anchor' | 'life';
  mapId: string;
  actionId: string;
  targetId: string;
  position: { x: number; y: number };
  label: Line;
};
```

This shape is a wiring sketch owned by foundation, not a contract to copy into world save state. Namespace `key` with source and map so an anchor and a life target cannot collide. Preserve exact reducer identities. For a life option, actionId is `Affordance.id`; targetId is `Affordance.targetId`. For an anchor, both reference the validated actual anchor identity. Existing reducer availability remains authoritative. Do not infer targets from rendered text, array position, last panel, or nearest prop art.

## One selected cue and one action

Derive the available list once from the same projected map, actors and player snapshot. Select the nearest stable-key target initially. Retain that selected key while it remains available. Hovering or focusing an existing target cue selects its identity. Selection does not dispatch an interaction, discovery or new exploration action.

Render one nonlexical neutral ring at the selected target's authored ground cue. The map owner supplies the point or footprint tied to the visible object; foundation projects it through the current camera and surface height. Use the same target key for the ring and the proximity control. Do not draw the ring at a generic entrance, player feet or whichever prop sorts first. Keep it visible against light/dark ground with neutral ink and cream strokes. No vermilion, canvas text or invented Chinese. Static feedback suffices under reduced motion.

Render one proximity group for the selected target. Its existing registered label stays a normal fogged/plain/dotted WordToken sequence. Its separate 44px activation button uses a matching neutral ring icon or target marker and invokes exactly the existing action. Word lookup must never activate the target. Do not add another `看看` exploration action or keep a second detached duplicate row for that same target. Existing domain controls remain in the contextual shell after activation.

When several targets are in range, scene-cue focus or pointer selection can change the selected target. On the focused activation control, Left/Right cycles available target identities without moving the player, and Enter/Space activates the selected existing action. When the viewport itself is focused, movement arrows retain their current behavior and Enter/e activates this same selected identity. This avoids different keyboard and pointer targets. Preserve standard Tab access to the registered word tokens and the action. Selection changes must not steal token focus. Freeze presentation selection while a word card owns focus; after closing the card, return focus first, then invalidate a departed target safely through existing availability checks.

The scene cue and one action group replace the current disconnected nearby and life rows. Foundation decides selection and dispatch; this document does not authorize a second state machine inside presentational UI.

## Placement and acceptance

Place the action group in an available screen region clear of the movement pad, journal/tray controls, contextual panel and selected player's body. At 320px width it must not sit beneath the stacked pocket controls. Projection and camera clearance stay foundation-owned. Map artists verify the cue belongs to the actual door, stall, bench, plant or actor.

Use the adjacent town fixture only as a visual/setup profile and compare at 390×664 and 320×568, plus the separate 320×320 layout profile. Then prove a normal walking arrival to the same neighborhood. Capture the selected cue and action together, switch to the adjacent target, and show that the cue and single action change identity together. Verify 44px targets, label fogging, word lookup Escape/focus return, keyboard target cycling, existing action dispatch, and no duplicate discovery/reaction. Inspect reduced motion and real player/target clearance. Do not claim whole-game completion from the setup profile.
