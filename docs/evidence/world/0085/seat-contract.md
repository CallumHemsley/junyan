# Actor seat contact contract

Owner0085, pure module contract. Foundation/restaurant owners retain projection, furniture and shared compositor writes. No saved schema is added.

`sampleActor` accepts optional `seatHeight` and `handRestHeight` in world units when `posture: 'sit'`. `seatHeight` is the absolute pelvis contact height above the ground at the supplied actor position. Legs bend and feet retain ground contact; upper body is attached to this seat, with additional bitmap headroom. `handRestHeight` is the absolute tabletop/hand target height; absent it, attached seated hands use a bent forward rest pose. Default/unbound sit remains backward compatible.

Use one attachment method. With these inputs, call `drawActor(ctx, view, sample, seatGroundPosition)` at ground z0. Do NOT also add `seatHeight - oldHipHeight` as a whole-sprite z offset; that would double-lift the body and float the shoes. Ground position still controls sort depth. The sampler supplies no actor-last override.

```ts
const sample = sampleActor({
  characterId: customer.characterId, facing: customer.facing,
  action: 'idle', posture: 'sit', elapsedMs: view.elapsedMs,
  reducedMotion: view.reducedMotion,
  seatHeight: customer.seatHeight, handRestHeight: customer.tableSurfaceHeight,
});
drawActor(ctx, view, sample, customer.seatGroundPosition);
const contacts = actorContactMetrics(sample);
```

`actorContactMetrics(sample)` and `ACTOR_PIXELS_PER_WORLD_UNIT` are exported from characters/index.ts. Metrics contain pixelsPerWorldUnit18, groundPixel, pelvis.pixel/height, hand.pixel/height, each foot.pixel/height/planted, and requestedSeatHeight. `sample.frame.pelvis`, `sample.frame.feet`, and optional `seatContact` provide the raw bitmap anchors. Heights derive from `(groundPixel.y - contactPixel.y) / 18`; rounding is bounded by one native pixel. These are pure values, not a day clock or renderer state.

For the requested calibrated restaurant prototype, seatHeight.55 and handRestHeight1.0 yield pelvis10/18=.5556, hand1.0, feet0 or1/18 (the far foot's isometric stagger). Old unbound sit pelvis is7/18=.3889; standing pelvis9/18=.5. Restaurant owner publishes actual chosen surface heights, seat ground centre and furniture geometry. Current old stool centre is x=table.x+width/2,y=table.y-.52; old projection uses y-.6. The actor must align to actual support, not an arbitrary lift.

The current old restaurant table() includes both stools in the same object, so rear stools cannot interleave beneath seated people. Split stools into individual objects at their support centres and sort stool -> seated patron -> table with actual ground depth. Table and meals still occlude normally. Root/0089 are already coordinating this. No table, food, stool or shared painter is edited by0085.

Nineteen scoped actor checks and build pass; all preexisting player/four-regular bitmap/attachment fields remain exact in1440cases. Contact values are tested at calibrated heights. Production caller adoption, front/side/rear chair/feet contact, ordinary service and independent integrated visual recheck remain OPEN.
