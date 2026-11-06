# Shared actor seat contact study

Objective ACTIVE. Restore readable, grounded restaurant patrons inside the connected world. This is an owner-level sampler and geometry study. Production integration and independent gameplay review remain required.

## Sources and reproduction

Baseline is read-only `/workspace/junyan-audit-e02` at e02a747c3b4d4fc6a476ea744ecb6bdc1a738132. The observed failure is `/tmp/e02-visual/desktop-restaurant.png`. This study imports its actual sampleActor/drawActor and actual residential door, apartment bed and workshop workbench art. It does not use the older legacy character crop.

The attached-seat sampler is the character owner's published b1fcbca6dc28d8d7327e014b34a518b74001d1a2. `prepare-seat.mjs` extracts its exact character modules into the ignored actor-b1fcbca directory and links this checkout's unchanged content. There are no edits to the extracted sampler or adapter. Preparation requires that commit object, obtainable by fetching the character branch. The baseline audit must exist at the path above.

Run `node docs/evidence/world/0089/prepare-seat.mjs`, start the existing Vite command with `--port 5493 --strictPort`, then run `node docs/evidence/world/0089/capture-seat.mjs`. The browser is installed `/usr/bin/chromium`. No install, new dependency, audio or shared source change occurs.

Each case has production camera scale 24 and 18. The top row shows the player with tray and all four regulars standing. The middle row shows front, side and rear seated patrons, always drawn BEFORE the table. The bottom row shows actual e02 residential door, bed and lamp workbench with standing humans. Elder cases repeat the seated row with the shortest shoulder height. Geometry has no special camera zoom to enlarge patrons.

## Physical findings

Original table top is 1.44 and stool top .77. The unbound e02 seated hip is only 7/18 world units above the foot anchor. Its shoulder is about 15/18, so the table covers almost the entire body. Simply translating this sprite upward aligns hips but also lifts shoes and foot shadows. That is not the selected correction.

The character owner's optional ActorInput.seatHeight anchors the pelvis to the supplied physical seat height and extends bent legs to grounded feet. PixelFrame.seatContact reports the pelvis. At .77, the sampled hip is .7778 world units because of native pixel rounding. The .0078 difference is below one display pixel at both zooms. No actor z translation is needed. The exact rear stool center is prop.x + width/2, prop.y - .52. The previous prop.y - .6 position was slightly behind that center.

The selected bounded restaurant change retains original heights and exports RESTAURANT_FURNITURE_PROFILE. Table underside, slab, legs, stool geometry, waiting bowl and meal bases now consume that one profile. Customer descriptors expose seatHeight .77 and exact ground x/y. Service footprint, colliders, cast, day, audio, meals and ground depth ordering remain intact.

## Whole-cast calibration comparison

Before reducing furniture, the study compares current adapter plus seatHeight, uniformly calibrated adapters at 1.2 and 1.35 plus seatHeight, and a local .7 furniture-height candidate. The multiplier is an evidence-only wrapper around the exact canvas adapter. It applies to all humans, held tray pixels, frame pixels and foot shadows. It supplies seatHeight/multiplier to the sampler so the scaled pelvis remains attached to the same world stool. None of these shared calibration factors is approved or added to production.

The 1.2 comparison makes humans more proportionate to the e02 door, bed and workbench. The 1.35 comparison has tighter door clearance. A local furniture reduction improves restaurant visibility but leaves the other rooms' proportions unchanged. Retaining physical furniture while wiring the owner-provided seat contract is the smallest verified production unit. A shared calibration decision remains with foundation and the character owner. If adopted, nativePixelsPerWorldUnit must agree across sampling, canvas and worldCommands, held attachments, foot contacts, body occlusion bounds and pointer targets. This isolated canvas study does not verify those integrations.

## Raster measurements and limits

seat-metrics.json records one deterministic raster per direction/case/zoom, actual sampler frame ID, actor position, hip and stool screen points, hip contact error and visible pixels from the hip-relative body band. The band spans native hip row minus 10 through hip row. It is measured before and after furniture drawing, without changing actor depth. Pixel rounding changes the total mask slightly across cases. These counts diagnose occlusion; they are not an experience score or an independent PASS.

At scale 24 the e02 front/side/rear band retains 2/301, 0/178 and 2/301 pixels. The attached .77/current-adapter case retains 150/373, 65/225 and 150/373. The 1.2 calibration retains 290/554, 136/324 and 290/554. Source, position, scale and rounding are recorded with each count. Inspected phone and desktop images confirm that attached bodies are visible while the table still covers their lower body. The elder's shoulder remains marginal at current 1x scale and original table height, so final cast readability remains an open integrated review item.

## Foundation integration receipt

Use the published character owner b1fcbca or a descendant with the same contract:

```ts
const sample = sampleActor({
  characterId: customer.characterId,
  facing: customer.facing,
  action: 'idle',
  posture: 'sit',
  seatHeight: customer.seatHeight,
  elapsedMs: view.elapsedMs,
  reducedMotion: view.reducedMotion,
});
drawActor(ctx, view, sample, customer.position);
```

Retain sort depth customer.position.x + customer.position.y. Do not draw all patrons above tables and do not add a second z lift. The restaurant projection signature and explicit-departure behavior remain unchanged. Foundation alone owns this integration, the shared scale policy and authoritative presence. Recheck real restaurant desktop/phone movement, front/behind crossings, all cast, payment, departure and meals after wiring. Ticket stays doing.
