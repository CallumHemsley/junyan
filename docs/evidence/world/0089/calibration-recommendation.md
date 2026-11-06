# Recommended shared human calibration trial

Recommend a bounded integration trial at **15 native pixels per world unit**, equivalent to the evidence-only 1.2 multiplier against the current 18. This is a recommendation, not an approved production multiplier. Restaurant d196bed remains usable at current scale through its explicit seatHeight contract.

Inspected the published scale18 and scale24 1x, 1.2 and 1.35 grids. Each shows player plus all four regulars, front/side/rear seating, and actual e02 door, bed and workbench. The stool and table provide the other two physical references. At 1x the humans are small beside the workbench and door. At 1.2 they read more coherently across all five furnishings. At 1.35 the cast is larger again but has tighter door clearance; there is no corresponding elder-specific 1.35 proof. Prefer the smaller, more completely evidenced change first.

The elder phone comparison improves at 1.2, but its ochre shoulders still blend with the tabletop. The hip-relative body band retains 113/248 front pixels and 60/166 side pixels versus 54/168 and 23/109 at attached 1x. These diagnose occlusion only. They do not certify expression or identity readability. Sources and count method are in seat-study.md and seat-metrics.json.

## One conversion contract

0085 and 0078 should own one immutable human calibration value, nativePixelsPerWorldUnit = 15. Apply it to every world human, including player, patrons, aunt and background residents. Preserve native frames and cast palettes. Keep wildlife and legacy hospital/feature renderers under their existing owners.

- Canvas drawing uses cameraScale / 15 for all sprite pixels and held-object pixels. Foot and hand metadata use the same conversion.
- ActorInput.seatHeight remains a physical world height. Restaurant supplies .77 unchanged. Inside the sampler, use round(seatHeight * 15) for the pelvis offset. The existing evidence wrapper supplies .77/1.2 to the old 18-unit sampler solely to emulate this contract. Do not expose that divided value to restaurant callers or apply it twice.
- Feet and foot shadows remain on the ground anchor. Do not add a second position.z translation. At .77 the trial's rounded hip is .8, a .03-unit error, or .72 screen pixel at cameraScale24. The inherent tolerance is half a native world pixel, 1/30 world unit.
- worldCommands, canvas rendering and any held-object world attachment must use the same 15-unit conversion. The existing software ActorSurface adapter also has a projector-specific sin60 elevation factor; verify that projector separately instead of replacing constants blindly.
- Actor object depth remains ground x + y with the shared stable-ID tie break. A bigger head does not move ground position, route, seat center or save coordinates. Furniture and meals retain their world surfaces.
- Derive visual occlusion and hit bounds from the calibrated sample, anchor and held-object extent. The e02 occlusion helper samples fixed body heights; those are not sufficient proof for a resized cast. Ground pointer inversion and activity anchors keep their existing coordinates. Recheck body-target selection and nearest reachable interaction against the enlarged actual sprite. Preserve 44px DOM targets.
- Do not multiply the movement collider automatically. The e02 PLAYER_RADIUS is .22. Foundation must verify narrow-door and scenery crossings, then reconcile the foot footprint if evidence requires it. Visual hit bounds, collision and ground navigation serve different purposes.

## Integrated acceptance still required

Foundation must wire d196bed seatHeight and a calibration-aware character sampler/adapter together. Then capture actual desktop and phone at the production backing resolution and DPR1/2. Inspect every regular, especially the elder, standing and seated from front/side/rear, with tray/food and work props. Verify shoe/hip/hand contact, meal surface height, front/behind scenery, NPC crossings, pointer selection, all doors/stairs and narrow routes. Confirm payment keeps the patron through thanks, explicit acknowledgment removes it globally without erasing meals, reload preserves presence, and reduced motion remains stable. Run the original opening/service/change/journal and save journeys. Independent visual/gameplay review decides acceptance. Objective ACTIVE.
