---
title: Research — image generation APIs and the asset pipeline spec
status: draft
created: 2026-10-31
tags: [research, art, pipeline, codex, ticket-7]
---

> Produced by OpenAI Codex (gpt-6-astra, xhigh) via `codex exec` with live web search on 2026-10-31, from a prompt by Claude Code; filed unedited apart from this header. It checks current Gemini and OpenAI image API docs, proposes the model bake-off and rubric for ticket 7, gives a style-bible template, prompt templates, and a full pipeline and manifest design. Prices are the vendors' published figures on that date; the Nano Banana 4K price conflict and Gemini alpha support are flagged as unresolved inside.

**Bake off `gpt-image-2.5-sunburst` against `gemini-nano-banana-2.1`.** Treat native transparency as a production advantage, and choose the winner by consistency and cleanup time.

Verified **31 October 2026** against current official documentation. This spec incorporates ticket 0007 and research sections 1, 2 and 8. No files were modified; no image-generation calls were made.

**1. API comparison**

Prices below are **USD, Standard processing, image output only**. Prompts, reference images, thinking, retries and background removal can add cost.

| Capability | Gemini | OpenAI |
|---|---|---|
| Primary model IDs | `gemini-nano-banana-2.1`; premium alternative `gemini-3-pro-image`. [Model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1) | `gpt-image-2.5-sunburst` for editing precision; `gpt-image-2.5-flare` for speed. Both have `-2026-09-08` snapshots. [Sunburst](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst), [Flare](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare) |
| Other documented models | `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`; legacy `gemini-2.5-flash-image`, scheduled to shut down **15 March 2027**. [Lifecycle](https://ai.google.dev/gemini-api/docs/deprecations) | `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1-mini`, plus rolling `chatgpt-image-latest`. `gpt-image-1` shut down **23 October 2026**. Avoid rolling aliases for production. [API reference](https://developers.openai.com/api/reference/resources/images/methods/edit) |
| Multiple references | Up to **14** total. NB 2.1/Flash: up to four character references and ten object references. Pro: five character, six object and three style references. These are documented fidelity categories, not guaranteed identity preservation. [Generation guide](https://ai.google.dev/gemini-api/docs/image-generation) | Up to **16** input images. Assign identity, style and layout roles explicitly in the prompt; no dedicated character-reference quota or style-strength parameter is documented. [Edit reference](https://developers.openai.com/api/reference/go/resources/images/methods/edit) |
| Local editing | Conversational “change this region” instructions; documented semantic masking. No equivalent binary edit-mask parameter confirmed. [Generation guide](https://ai.google.dev/gemini-api/docs/image-generation) | Multi-image edits with a mask applied to **image 1**. Transparent mask pixels identify the editable area. Masks guide the model; they do **not** guarantee exact pixel preservation. [Mask format](https://developers.openai.com/api/reference/go/resources/images/methods/edit), [mask limitations](https://developers.openai.com/api/docs/guides/image-generation) |
| Multi-turn editing | Interactions API: `previous_interaction_id`. Repeat generation settings on each turn. [Interactions](https://ai.google.dev/gemini-api/docs/interactions-overview) | Responses API: `previous_response_id` or previous image context. Direct Images API edits can instead receive the saved canonical image on every request. [Responses image tool](https://developers.openai.com/api/docs/guides/tools-image-generation) |
| Native transparency | **Unconfirmed in current official docs.** No transparent-background field is documented. PNG examples do not establish alpha support. Plan for matting. [API schema](https://ai.google.dev/api/interactions-api) | **Supported:** `background: "transparent"` with PNG/WebP. GPT Image 2 transparency remains preview; 2.5 support is documented without that qualification. [Generation reference](https://developers.openai.com/api/reference/resources/images/methods/generate) |
| Output dimensions | NB 2.1/Pro: 1K, 2K, 4K classes. Flash also supports 512; Lite only 1K. Dimensions depend on aspect ratio: NB 2.1 2K is **2048×2048**, **1696×2528** at 2:3, or **2752×1536** at 16:9. [Size tables](https://ai.google.dev/gemini-api/docs/image-generation) | Custom dimensions: multiples of 16; aspect ratio ≤3:1; each edge ≤3840; total 655,360–8,294,400 pixels. Above 2560×1440 is experimental. Recommended presets include 1024² and 1024×1536. [Output controls](https://developers.openai.com/api/docs/guides/image-generation) |
| Quality controls | Resolution and model-specific thinking controls; no directly equivalent OpenAI quality ladder. [NB 2.1](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1) | 2.5: `low`, `medium`, `high`, `xhigh`, `max`, `auto`. Pin an explicit value. [Generation reference](https://developers.openai.com/api/reference/resources/images/methods/generate) |
| Exact 1K output arithmetic | NB 2.1 **$0.03360**; Flash **$0.06720**; Lite **$0.03360**; Pro **$0.13440**. Calculated from published token counts and rates; displayed prices sometimes round. [Pricing](https://ai.google.dev/gemini-api/docs/pricing) | At 1024², 2.5 calculator estimates: low **$0.00588**, medium **$0.01317**, high **$0.05268**, xhigh **$0.09366**, max **$0.21072**. [Calculator](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency) |
| Exact 2K output arithmetic | NB 2.1 **$0.05040**; Flash **$0.10080**; Pro **$0.13440**. [Pricing](https://ai.google.dev/gemini-api/docs/pricing) | At 2048²: low **$0.01191**, medium **$0.02676**, high **$0.10704**, xhigh **$0.19029**, max **$0.42816**. Experimental size; calculator estimates. [Calculator implementation](https://developers.openai.com/_astro/GptImageTokenCalculator.react.CxseQDUo.js) |
| 4K output arithmetic | Flash **$0.15120**; Pro **$0.24000**. **NB 2.1 unresolved:** pricing implies **$0.11340**, while the generation guide’s token table implies **$0.07560**. Budget the higher figure pending confirmation. [Pricing](https://ai.google.dev/gemini-api/docs/pricing), [conflicting token table](https://ai.google.dev/gemini-api/docs/image-generation#nano-banana-21) | Price depends on dimensions and quality; no universal “4K image price.” Use the calculator and recorded usage. [Calculator](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency) |
| Additional token charges | NB 2.1: input **$1.50/M**, text/thinking output **$7.50/M**. Flash: **$0.50/M**, **$3/M**. Lite: **$0.25/M**, **$1.50/M**. Pro: **$2/M**, **$12/M**. [Pricing](https://ai.google.dev/gemini-api/docs/pricing) | Both 2.5 models: text input **$5/M**, image input **$8/M**, image output **$30/M**. Responses orchestration adds its own model charges. [Pricing](https://developers.openai.com/api/docs/pricing) |
| Batch pricing | Documented Batch rates are half Standard for these models. [Pricing](https://ai.google.dev/gemini-api/docs/pricing) | 2.5 Batch: text input **$2.50/M**, image input **$4/M**, image output **$15/M**. [Pricing](https://developers.openai.com/api/docs/pricing) |
| Rate limits | Project/model/tier dependent; inspect AI Studio. Limits can include RPM, TPM, RPD and IPM. No universal account quota can be confirmed. [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) | Both 2.5 pages list **Build: 250,000 TPM / 20 IPM; Launch: 3,000,000 / 150; Grow: 8,000,000 / 250**. Free unsupported. Actual account limits remain authoritative. [Sunburst limits](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst), [Flare limits](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare) |

Useful OpenAI estimates for this asset set:

| Output size | Low | Medium | High | Xhigh | Max |
|---|---:|---:|---:|---:|---:|
| 1024×1536 portrait | $0.00474 | $0.01029 | $0.04116 | $0.07377 | $0.16464 |
| 2560×1440 background | $0.00615 | $0.01434 | $0.05529 | $0.09828 | $0.22110 |

These reproduce the current official calculator’s arithmetic. They are **output estimates, not guaranteed request totals**. The model pages warn against applying GPT Image 2 token consumption to GPT Image 2.5. [Calculator source](https://developers.openai.com/_astro/GptImageTokenCalculator.react.CxseQDUo.js), [model pricing notes](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)

For direct OpenAI Images requests:

```text
estimated USD =
  textInputTokens  × 0.000005
+ imageInputTokens × 0.000008
+ imageOutputTokens × 0.000030
```

Cached-input discounts do not apply to direct Images API requests. [Caching rules](https://developers.openai.com/api/docs/guides/image-generation#cached-input-pricing)

**Unconfirmed details to keep out of implementation assumptions**

- A standalone `gpt-image-2.5` ID is not established by the current model listings; use the named variants.
- An edit-reference field mentions GPT Image 2.6, but the reviewed model listings do not establish a usable ID or price. Exclude it.
- Gemini’s guide shows PNG output examples while its Interactions reference currently lists only JPEG in that output enum. Omit the MIME override initially and inspect the returned MIME type.
- A seed is exposed in Gemini’s generic configuration, but deterministic image replay is not established. OpenAI Images exposes no seed. Archive actual outputs; use `null` when no seed exists. [Gemini configuration](https://ai.google.dev/api/interactions-api), [OpenAI parameters](https://developers.openai.com/api/reference/resources/images/methods/generate)

**2. Bake-off procedure and acceptance rubric**

This is a proposed production protocol, not a claim that either model has already won.

1. **Freeze the test inputs.** Approve one style bible, five shared anchors, four character briefs, five expressions, one stall layout and one food example per category. Keep references and prompt wording identical where APIs permit.
2. **Generate two candidates per job.** Test Sunburst’s dated snapshot at `high` against NB 2.1 at 2K for sheets/portraits/backgrounds and 1K for items/UI. Normalize review images to the same display sizes.
3. **Review blind, before and after post-processing.** Record every attempt, including refusals, failures and rejected images. Compare raw identity preservation separately from final alpha and palette quality.
4. **Measure production effort.** Time selection, matting, registration, layer cleanup and nine-slice repair. Cost means total spend divided by accepted assets.
5. **Choose and freeze.** Select the passing model with the highest character consistency; use cleanup minutes as the first tie-breaker, accepted-asset cost second. If neither passes, test Gemini Pro on the failed cases before expanding production.

Recommended test inventory, **68 outputs per model**:

| Test | Outputs |
|---|---:|
| Four character sheets × two candidates | 8 |
| Four canonical neutral portraits × two | 8 |
| Four additional expressions × four characters × two | 32 |
| One example from each food category × two | 8 |
| Noon, dawn and evening plate × two | 6 |
| One dialogue-frame concept × two | 2 |
| Closed-eye and open-mouth edits on the hardest character × two | 4 |

Allow equal retake budgets. Do not compare a heavily curated winner from one provider with the first result from another.

For each portrait, score every dimension **0–5**, then calculate `Σ(weight × score / 5)`:

| Dimension | Weight | Evidence |
|---|---:|---|
| Face identity and expression | 40 | Same person; requested emotion readable at runtime size |
| Hair and defining features | 20 | Same hairline, silhouette, glasses, marks and accessories |
| Proportions and registration | 15 | Head size, shoulder width, eye line and framing remain stable |
| Outfit | 10 | Same collar, seams, colours and accessory placement |
| Style | 10 | Matching line weight, shading, lighting and palette roles |
| Artifacts and cutout quality | 5 | Sound anatomy; clean edges; no background remnants |

**Pass:** ≥85/100, face identity ≥4/5, and all hard gates pass. Score 3 means obvious repair is needed; 5 means production-ready.

Hard gates:

- No lettering, numerals, labels, logos, signatures or pseudo-writing.
- No missing anatomy, merged features, clipped silhouette or identity change.
- Real alpha for cutouts; inspect over white, black and the stall background.
- Expression layers align within **one runtime pixel** after normalization.
- Final protected pixels are identical outside the approved edit region.

For backgrounds, items and UI, use the same 0–5 scale with **style 30%, geometry/layout 25%, readability 20%, palette/lighting 15%, artifacts 10%**. Require ≥85 and the relevant hard gates.

Record first-pass acceptance, worst character score, median cleanup minutes, latency and spend. Do not conceal a weak recurring character inside an overall average.

**3. Style-bible template**

All proposed numbers below are starting defaults. Palette colours and cultural details require approval from the project’s references.

```yaml
version: "1.0"
status: draft
setting:
  location_and_region: "<specific city/region>"
  period: "<year or period>"
  stall_type: "<street cart / pavement stall / small shop frontage>"
  reference_details: "<architecture, utensils, clothing, breakfast customs>"
  mood: "cozy, ordinary, lived-in"
  exclude: "<inappropriate regional or period details>"

visual_language:
  medium: "clean-line illustrated 2D"
  shapes: "<rounded/angular balance; silhouette rules>"
  outline_hex: "<palette colour>"
  outer_line_px_at_portrait_512x768: 3
  inner_line_px_at_portrait_512x768: 2
  line_variation: "subtle; no scratchy sketch residue"
  shading: "flat base plus one shadow tone"
  highlights: "small, matte, restrained"
  texture: "optional fixed paper treatment; never independently randomized"
  gradients: "off in painted surfaces; alpha gradients allowed for effects"

palette:
  colour_space: "sRGB"
  max_colours: 32
  colours:
    - id: ink
      hex: "<#RRGGBB>"
      role: "outlines"
      source_reference: "<path and sampled region>"
    # Include skin ramps, warm neutrals, food golds, muted greens,
    # ceramic/enamel colours, cool shadows and light colours.
  material_ramps: {}
  dawn_index_map: []
  noon_index_map: []
  evening_index_map: []
  dither: false
  constrain: "source RGB; preserve continuous alpha"

lighting:
  character_key: "soft upper-left; constant across expressions"
  noon: "<direction, shadow colours, contrast>"
  dawn: "<warm/cool balance>"
  evening: "<ambient colours and practical lights>"
  material_rules:
    bamboo: "<>"
    steel: "<>"
    enamel: "<>"
    cloth: "<>"
    food: "<>"

composition:
  scene_canvas: [1920, 1080]
  camera_and_horizon: "<fixed>"
  dialogue_safe_region: "<rectangle>"
  customer_region: "<rectangle>"
  text_surface_regions: "<blank sign and price-board rectangles>"
  portrait_canvas: [512, 768]
  portrait_pose: "<fixed three-quarter angle>"
  portrait_pivot_px: [256, 768]
  portrait_eye_line_y: "<approved>"
  portrait_safe_margin_px: 24
  item_card_canvas: [256, 256]
  item_icon_canvas: [64, 64]
  item_view: "<fixed three-quarter elevation>"
  item_occupancy: "70–80%"

characters:
  - id: "<stable ID>"
    biography_and_age_band: "<>"
    face_geometry: "<>"
    skin_palette_roles: []
    hair_geometry_and_colour: "<>"
    distinguishing_features: []
    outfit_and_accessories: "<>"
    immutable_features: []
    expressions: [neutral, warm_smile, worried, surprised, tired]
    expression_definitions: {}
    canonical_reference: "<approved image hash>"
    masks: {eyes: "<path>", mouth: "<path>", arm: "<path>"}

anchors:
  # Exactly five approved images, with purpose and rights/source recorded.
  - {id: setting, path: "<>", purpose: "setting", source: "<>", rights: "<>"}
  - {id: portrait, path: "<>", purpose: "line and face treatment", source: "<>", rights: "<>"}
  - {id: food, path: "<>", purpose: "food and materials", source: "<>", rights: "<>"}
  - {id: palette, path: "<>", purpose: "colour relationships", source: "<>", rights: "<>"}
  - {id: ui, path: "<>", purpose: "frame construction", source: "<>", rights: "<>"}

never:
  - "Any text, numbers, lettering, logos, signatures or pseudo-writing"
  - "Glossy anime rendering, photorealism, 3D rendering or painterly blur"
  - "Unapproved outfit, face, camera or framing changes"
  - "Baked steam, rain, light bloom or passers-by in the background plate"
  - "Palette expansion, independent frame noise or checkerboard backgrounds"
```

**4. Character consistency and layered animation protocol**

Reusable character anchors and narrowly scoped edits are supported by OpenAI’s prompting cookbook; Ludo’s first-party workflow also makes expressions by editing the same portrait. Neither establishes guaranteed identity preservation or a universal winning model. [OpenAI character workflow](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide), [Ludo portrait workflow](https://ludo.ai/tools/character-portrait-generator)

Use this production sequence:

1. **Approve a design sheet, then one neutral master.** The sheet documents identity. Generate the runtime portrait separately at useful resolution; do not ship small faces cropped from a crowded sheet.
2. **Branch every expression from that master.** Attach the canonical portrait first, followed by its sheet and the relevant style anchor. Do not chain smile → worried → surprised → tired.
3. **Restrict and enforce changes.** Mask eyes/brows and mouth/cheeks as necessary. Normalize the returned image, then copy only approved regions onto the canonical image. Reject changes to head geometry instead of hiding them with non-rigid warping.
4. **Build a clean underlying face and arm area once.** Remove baked eyes/mouth from the base beneath replacement patches. Reconstruct any torso hidden by a movable arm. Otherwise blinks and gestures reveal old features or holes.
5. **Export registered layers and test them together.** All layers share the same source canvas and pivot before trimming. Review every expression at native runtime size.

Recommended layer contract:

```text
character container — shared position, scale and breathing movement
├── body             torso, head, hair; cleaned beneath moving features
├── eyes             brows + eyes; open / half / closed per expression
├── mouth            rest / small-open / wide-open per expression
└── arm              idle / reach / offer; optional shared gesture sequence
```

Skin around a feature may be included in its patch to cover the underlying face cleanly. Keep seams inside flat colour areas and inspect them after palette mapping. If glasses or hair cross the animated region, explicitly assign their occlusion to the patch or add a documented foreground layer.

Suggested timing, **project defaults rather than researched physiological rules**:

| Animation | Behaviour |
|---|---|
| Blink | Open → half 40 ms → closed 80 ms → half 40 ms → open; wait 2.5–5.5 seconds |
| Talk | Switch small/wide/rest every 80–140 ms while dialogue audio is active; rest during silence |
| Idle | Move the entire container vertically by 1–2 pixels over roughly four seconds |
| Gesture | Play arm frames independently; return to idle after the handover |

This is stylized talking, not Mandarin phoneme lip-sync. Do not generate every eye × mouth × arm combination as a full portrait.

Aseprite supports exporting layers into sprite sheets with JSON metadata. Packed frames still need their original canvas offsets preserved. [Aseprite CLI](https://www.aseprite.org/docs/cli/)

**5. Prompt templates**

The pipeline expands placeholders. Text in prompts is instruction only and must never become image lettering.

Prepend this shared block:

```text
Create an asset for Junyan, a cozy illustrated 2D Chinese breakfast-stall game.

STYLE:
{approved_style_bible_visual_rules}
PALETTE:
{approved_hex_list_and_material_roles}
SETTING:
{approved_setting_brief}

Reference roles:
{ordered_reference_roles}

Use clean ink outlines, flat colour shapes and the approved restrained shadows.
Match the approved references without importing unrelated objects or clothing.

Every surface is unlettered. Include no text, Chinese characters, Latin letters,
numbers, labels, captions, logos, signatures, panel labels or pseudo-writing.
Keep signs, cups, packaging, receipts and clothing completely blank.
```

**Character sheet**

```text
Create a reference sheet of ONE recurring character:
{character_description}
Immutable identity details:
{immutable_features}

Arrange eight separated views in two rows of four, without borders or labels.
Top row: neutral front, neutral left three-quarter, neutral right three-quarter,
neutral profile.
Bottom row: warm smile, worried, surprised, tired, all in {runtime_pose}.

Use waist-up views with identical clothing, age, facial structure and proportions.
Keep lighting and apparent scale consistent. Leave clear space between figures.
Show the entire hair silhouette and waist crop; do not clip shoulders or hands.
The expressions alter facial muscles only.

Background: {cutout_background_instruction}.
This is a design reference sheet, not a finished animation atlas.
```

**Expression edit**

```text
Edit image 1, the approved canonical portrait.
Image 2 documents identity. Image 3 supplies style only.

Change the expression to {expression_id}:
{precise_brow_eyelid_cheek_mouth_description}

Keep the head angle, gaze direction, facial bone structure, ears, hair, neck,
shoulders, outfit, accessories, lighting, framing and scale unchanged.
Alter only {allowed_regions}. Preserve the silhouette and all other pixels.

Return one complete portrait on the same canvas, with no panels or labels.
{preserve_background_instruction}
```

For blink/talk variants, replace the expression delta with “close only the eyelids” or the approved mouth shape. Continue from the approved expression, while retaining the canonical identity references.

**Item card**

```text
Create one isolated inventory illustration of {item_name}.
Physical specification: {ingredients_shape_container_and_quantity}.
Use {fixed_item_view}, with the object occupying {occupancy}% of the square.

Match the approved {food_category} reference, line weight and material palette.
Make its silhouette readable at 64 pixels.
Show exactly {quantity}; no extra garnish, utensils, packaging or decorations.
Do not include steam or a cast shadow; these are separate layers.
All cups, wrappers and bowls are unbranded and unlettered.

Background: {cutout_background_instruction}.
Return the item illustration only. The engine supplies the card frame and text.
```

Create twelve explicit item definitions; do not assume their recipes from category names. Derive card art and icons from the same approved master.

**Background plate**

```text
Create the fixed noon background plate for {setting_brief}.
Follow the supplied layout reference exactly:
{camera_horizon_counter_positions_and_regions}.

Composition: {composition_description}.
Materials and palette: {material_rules}.
Lighting: {noon_lighting}.

Keep {dialogue_region} visually quiet and {customer_region} unobstructed.
Include only permanent architecture, furniture and fixed equipment.
All signs and price-board surfaces are blank.

Exclude people, animals, rain, airborne steam, floating particles, light bloom
and movable service items. These will be composited separately.
Return one opaque {aspect_ratio} scene, without a border.
```

**Time-of-day edit**

```text
Edit image 1, the approved noon plate, into {dawn_or_evening}.
Change illumination and colour treatment only:
{approved_time_of_day_lighting}.

Preserve the camera, perspective, crop, object positions, architecture,
counter silhouette and every blank sign surface.
Do not add, remove, move or redesign anything.
Keep steam, rain, people and light bloom absent.

Use the approved palette roles for this time of day.
Return one image with the same composition and dimensions.
```

Use these edits to discover the desired lighting. For shipped variants, prefer deterministic palette mappings from the noon plate wherever they achieve the approved look. That guarantees geometry stays fixed.

Provider-specific cutout instructions:

| Provider | Prompt clause | API setting |
|---|---|---|
| OpenAI | “Isolated on actual transparent alpha; no backdrop, checkerboard or shadow.” | `background: "transparent"`, `output_format: "png"` |
| Gemini | “Isolated on a uniform {matte_colour} backdrop, with no gradient or shadow.” | Matte colour selected to contrast with the subject; remove it afterward |

**6. Background removal, palette and nine-slices**

| Stage | Recommended implementation |
|---|---|
| Native alpha | Preserve valid OpenAI alpha. Do not automatically segment an already good cutout. |
| Local matting | Pin `rembg` and an explicit model. Trial `birefnet-portrait` for people and `birefnet-general` for items. Start with decontamination when halos appear; reserve alpha matting for damaged coverage. [rembg](https://github.com/danielgatis/rembg) |
| Model licensing | Record the actual checkpoint and licence. Current rembg defaults to BRIA RMBG-2.0, whose commercial terms differ from rembg’s MIT licence. BiRefNet’s repository is MIT; retain the selected checkpoint’s provenance too. [rembg models](https://github.com/danielgatis/rembg#models), [BiRefNet licence](https://github.com/ZhengPeng7/BiRefNet/blob/main/LICENSE) |
| Hosted fallback | Photoroom Remove Background: `POST https://sdk.photoroom.com/v1/segment`, multipart image; published **$0.02/call**. Maximum file 50 MB, widest edge 6000 px. [Quickstart](https://docs.photoroom.com/remove-background-api-basic-plan/quickstart-guide), [pricing](https://docs.photoroom.com/remove-background-api-basic-plan/pricing), [limits](https://docs.photoroom.com/remove-background-api-basic-plan/file-size-resolution-and-format) |
| Mask-only fallback | Photoroom `channels=alpha` returns a mask, but its docs say this omits the cutout’s matting refinement. Prefer full cutouts when edge quality matters. [Mask behaviour](https://docs.photoroom.com/remove-background-api-basic-plan/download-the-segmentation-mask) |
| Alternative API | remove.bg supports transparent PNG/WebP, but currently announces migration to Leonardo on **1 December 2026**. Avoid making it the default new dependency without checking that transition. [API documentation](https://www.remove.bg/api) |

Matting quality on this illustrated style is **unconfirmed until tested**. Check bun edges, youtiao gaps, cup handles, glasses and hair. Do not use foreground segmentation to manufacture semi-transparent steam.

For ambient effects:

- Generate or draw steam as a grayscale opacity texture; tint it using a palette colour.
- Use deterministic rain strokes and light masks with alpha.
- Generate passers-by as separate cutouts.
- Store scene position, depth and blend mode independently from the image.

Palette processing order:

```text
decode → orient → sRGB → matte/decontaminate → register/composite
       → resize → fixed texture treatment → fixed-palette RGB mapping
       → restore unchanged alpha → trim → atlas
```

Implement fixed-palette mapping over raw RGBA pixels using nearest colour in a chosen perceptual space such as OKLab. Pin the conversion and tie-breaking rule. Preserve alpha exactly; do not dither.

`sharp.png({ palette: true, colours: 32 })` limits colour count but does not select the project’s exact palette. ImageMagick’s `+dither -remap palette.png` is an alternative for an explicit colour map; extract and restore alpha separately. [Sharp PNG options](https://sharp.pixelplumbing.com/api-output/#png), [ImageMagick remapping](https://usage.imagemagick.org/quantize/#remap)

The palette governs **stored source RGB**. Alpha blending, lighting and display scaling naturally create intermediate displayed colours. A strict final-screen palette would require a separate final rendering pass.

For UI, use AI to approve the appearance, then construct exact reusable geometry locally. Nine-slice corners must remain fixed while edges and centres stretch. [PixiJS nine-slice behaviour](https://pixijs.download/release/docs/scene.NineSliceSprite.html)

| Asset | Suggested source size | Insets: top/right/bottom/left |
|---|---:|---:|
| Dialogue box | 512×256 | 32/32/32/32 |
| Name plate | 256×96 | 20/20/20/20 |
| Price-board frame | 256×320 | 24/24/24/24 |
| Receipt | 256×384 | 20/20/20/20 |
| Button | 256×96 | 20/20/20/20 |

Produce normal, hover, pressed and disabled button states from identical geometry. Test minimum, normal and wide sizes. Keep ornament out of stretch regions. Render all Chinese text in the engine.

**7. TypeScript pipeline design**

Proposed entry point:

```text
scripts/assets.ts
```

Commands:

```bash
tsx scripts/assets.ts plan --config art/pipeline.json
tsx scripts/assets.ts generate --plan build/art/plan.json --budget-usd 25
tsx scripts/assets.ts review --run <run-id>
tsx scripts/assets.ts build --run <run-id> --approvals art/approvals.json
tsx scripts/assets.ts verify --manifest assets/manifest.json
```

`plan` performs no paid calls. `build` uses approved cached inputs and performs no generation. The budget is a configurable proposed ceiling, not an exact cost prediction.

**Inputs**

| Input | Required contents |
|---|---|
| Style bible | Versioned rules, palette, five anchors, reference hashes |
| Asset inventory | Four character IDs; five expressions each; twelve items; scene/effects/UI jobs |
| Geometry | Canvases, pivots, layout guides, masks, safe areas, nine-slice insets |
| Provider configuration | Exact model, quality/resolution, endpoint, concurrency, retry and spend limits |
| Approvals | Candidate IDs, rubric scores, reviewer, approved masks and cleanup operations |

Use `openai`, `@google/genai`, `sharp` and a JSON Schema validator, with exact dependency versions locked during implementation. Use a persistent Python rembg worker with a reused model session if local matting wins. No need to force the inference runtime into TypeScript.

Provider interface:

```ts
type ImageJob = {
  id: string;
  provider: "openai" | "gemini";
  model: string;
  prompt: string;
  references: {
    path: string;
    sha256: string;
    role: "base" | "identity" | "style" | "layout" | "object";
  }[];
  maskPath?: string;
  previousId?: string;
  output:
    | {
        provider: "openai";
        size: string;
        quality: "low" | "medium" | "high" | "xhigh" | "max";
        background: "transparent" | "opaque";
      }
    | {
        provider: "gemini";
        aspectRatio: string;
        imageSize: "1K" | "2K" | "4K";
      };
  requestedSeed: number | null;
};

type GenerationResult = {
  requestId: string | null;
  conversationId: string | null;
  returnedModel: string | null;
  images: { bytes: Uint8Array; mimeType: string }[];
  usage: unknown;
  providerMetadata: unknown;
};

interface ImageProvider {
  generate(job: ImageJob): Promise<GenerationResult>;
}
```

Adapter rules:

| Adapter | Behaviour |
|---|---|
| OpenAI | Use `images.edit` whenever references exist; canonical target first. Use `images.generate` only for text-only jobs. Set `n: 1`, explicit size/quality, PNG and background. |
| OpenAI masks | PNG matching the first image; alpha 0 means editable. Keep masks below 4 MB to satisfy the stricter documented requirement; inputs below 50 MB. Omit undocumented fidelity options for 2.5. [Edit reference](https://developers.openai.com/api/reference/go/resources/images/methods/edit) |
| Gemini | Use `interactions.create` with ordered text/image parts and `response_format: { type: "image", aspect_ratio, image_size }`. Decode the returned MIME type. Do not assume an alpha channel. |
| Conversation state | Prefer explicit canonical inputs for production jobs. Use previous IDs for controlled iteration, with each expression branching from the same approved state. Retain files so the build does not depend on server-side conversation retention. [Gemini state semantics](https://ai.google.dev/gemini-api/docs/interactions-overview) |

**Execution stages**

1. **Plan and hash.** Validate inputs and provider capabilities. Compute a job hash from prompt, ordered reference hashes, mask, model, settings and pipeline version. Reject unsupported combinations before submission.
2. **Generate and archive.** Save request metadata before the call, then original output bytes, usage and response metadata. Retain all candidates. Missing images, safety blocks and malformed responses are explicit failures.
3. **Review and select.** Produce a local HTML contact sheet with labels outside images. Human review supplies rubric scores. Automated OCR and geometry checks assist review but cannot prove that an image is text-free.
4. **Process approved candidates.** Normalize geometry, matte, composite permitted patches, extract layers, downscale, apply the shared filter and map RGB to the fixed palette.
5. **Pack and verify.** Write atlases, manifest and preview composites to a staging directory; publish the completed local asset directory only after every required asset passes.

Production constraints:

- Preserve the original returned files. Reprocessing should not incur generation charges.
- Disable nested SDK retries if the pipeline owns retries.
- Retry temporary rate limits/overload with `Retry-After` or exponential backoff and jitter; cap attempts and elapsed time. Do not retry billing or validation failures. [OpenAI retry guidance](https://developers.openai.com/api/docs/guides/rate-limits)
- Treat ambiguous network timeouts as potentially billed. Record them and require an explicit replay decision rather than silently generating duplicates.
- Record measured usage separately from estimated price. Reserve budget for in-flight calls and unknown-cost attempts.

**Geometry and packing**

| Asset | Build rule |
|---|---|
| Portraits | Normalize to a common 1024×1536 working canvas; export 512×768. Preserve aspect ratio, registration transform and pivot. Reject significant pose/scale drift. |
| Items | Normalize once; derive 256×256 card art and 64×64 icons from the same master. |
| Backgrounds | Export 1920×1080; preserve the same coordinate system for all variants and full-scene effects. |
| Atlases | Deterministic packing, no rotation, maximum 2048×2048 per page, two-pixel edge extrusion plus two-pixel separation. Store trim offsets. |
| UI | No trimming or rotation. Insets are source-pixel measurements. |

After extracting a facial patch, force its final pixels outside the allowed region back to the canonical pixels. This is the **pixel-preservation guarantee**; prompting alone cannot provide it.

**Outputs**

```text
build/art/<run-id>/
  plan.json
  requests/<job-id>.json
  responses/<job-id>.json
  raw/<job-id>/<candidate-id>.<actual-extension>
  processed/
  provenance.jsonl
  review.html
  scores.json
  costs.json

assets/
  textures/*.png
  previews/*.png
  manifest.json
```

Each provenance record contains: job/candidate IDs; parent candidate; provider/model; requested and returned settings; prompt and reference hashes; request/response IDs; nullable seed; original output hash; usage; estimated and reconciled cost; processing versions; mask and transform; reviewer scores; acceptance/rejection reason.

Prompts and rejected candidates stay in the build archive; the game only needs runtime assets and manifest data.

**8. Runtime manifest JSON Schema**

This schema describes shipped assets. Referential integrity and pixel-level conditions are enforced by `verify`, as JSON Schema cannot inspect images or resolve frame IDs.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Junyan asset manifest",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "version", "buildId", "styleBibleSha256", "palette",
    "provenance", "textures", "frames", "characters",
    "items", "backgrounds", "effects", "ui"
  ],
  "properties": {
    "version": { "const": 1 },
    "buildId": { "type": "string", "minLength": 1 },
    "styleBibleSha256": { "$ref": "#/$defs/hash" },
    "palette": {
      "type": "array",
      "minItems": 24,
      "maxItems": 32,
      "uniqueItems": true,
      "items": {
        "type": "string",
        "pattern": "^#[0-9A-Fa-f]{6}$"
      }
    },
    "provenance": {
      "type": "object",
      "additionalProperties": false,
      "required": ["archivePath", "sha256"],
      "properties": {
        "archivePath": { "type": "string" },
        "sha256": { "$ref": "#/$defs/hash" }
      }
    },
    "textures": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": { "$ref": "#/$defs/texture" }
    },
    "frames": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": { "$ref": "#/$defs/frame" }
    },
    "characters": {
      "type": "array",
      "minItems": 4,
      "maxItems": 4,
      "items": { "$ref": "#/$defs/character" }
    },
    "items": {
      "type": "array",
      "minItems": 12,
      "maxItems": 12,
      "items": { "$ref": "#/$defs/item" }
    },
    "backgrounds": {
      "type": "object",
      "additionalProperties": false,
      "required": ["noon", "dawn", "evening"],
      "properties": {
        "noon": { "$ref": "#/$defs/id" },
        "dawn": { "$ref": "#/$defs/id" },
        "evening": { "$ref": "#/$defs/id" }
      }
    },
    "effects": {
      "type": "object",
      "additionalProperties": false,
      "required": ["steam", "rain", "light", "passerby"],
      "properties": {
        "steam": { "$ref": "#/$defs/effectList" },
        "rain": { "$ref": "#/$defs/effectList" },
        "light": { "$ref": "#/$defs/effectList" },
        "passerby": { "$ref": "#/$defs/effectList" }
      }
    },
    "ui": {
      "type": "object",
      "required": [
        "dialogue", "nameplate", "priceboard", "receipt",
        "button.normal", "button.hover",
        "button.pressed", "button.disabled"
      ],
      "additionalProperties": { "$ref": "#/$defs/nineSlice" }
    }
  },
  "$defs": {
    "id": { "type": "string", "minLength": 1 },
    "hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "size": {
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": { "type": "integer", "minimum": 1 }
    },
    "point": {
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": { "type": "number" }
    },
    "rect": {
      "type": "array",
      "prefixItems": [
        { "type": "integer", "minimum": 0 },
        { "type": "integer", "minimum": 0 },
        { "type": "integer", "minimum": 1 },
        { "type": "integer", "minimum": 1 }
      ],
      "minItems": 4,
      "maxItems": 4
    },
    "insets": {
      "type": "array",
      "minItems": 4,
      "maxItems": 4,
      "items": { "type": "integer", "minimum": 0 }
    },
    "texture": {
      "type": "object",
      "additionalProperties": false,
      "required": ["path", "sha256", "size", "alphaMode"],
      "properties": {
        "path": { "type": "string", "pattern": "\\.png$" },
        "sha256": { "$ref": "#/$defs/hash" },
        "size": { "$ref": "#/$defs/size" },
        "alphaMode": { "enum": ["opaque", "straight"] }
      }
    },
    "frame": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "textureId", "rect", "sourceSize", "trimOffset",
        "pivotPx", "provenanceId"
      ],
      "properties": {
        "textureId": { "$ref": "#/$defs/id" },
        "rect": { "$ref": "#/$defs/rect" },
        "sourceSize": { "$ref": "#/$defs/size" },
        "trimOffset": { "$ref": "#/$defs/point" },
        "pivotPx": { "$ref": "#/$defs/point" },
        "provenanceId": { "$ref": "#/$defs/id" }
      }
    },
    "expression": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "eyesOpen", "eyesHalf", "eyesClosed",
        "mouthRest", "mouthSmall", "mouthWide", "preview"
      ],
      "properties": {
        "eyesOpen": { "$ref": "#/$defs/id" },
        "eyesHalf": { "$ref": "#/$defs/id" },
        "eyesClosed": { "$ref": "#/$defs/id" },
        "mouthRest": { "$ref": "#/$defs/id" },
        "mouthSmall": { "$ref": "#/$defs/id" },
        "mouthWide": { "$ref": "#/$defs/id" },
        "preview": { "$ref": "#/$defs/id" }
      }
    },
    "character": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id", "canvas", "pivotPx", "body",
        "armIdle", "expressions"
      ],
      "properties": {
        "id": { "$ref": "#/$defs/id" },
        "canvas": { "const": [512, 768] },
        "pivotPx": { "$ref": "#/$defs/point" },
        "body": { "$ref": "#/$defs/id" },
        "armIdle": { "$ref": "#/$defs/id" },
        "armGesture": { "$ref": "#/$defs/clip" },
        "expressions": {
          "type": "object",
          "minProperties": 5,
          "maxProperties": 5,
          "required": [
            "neutral", "warm_smile", "worried",
            "surprised", "tired"
          ],
          "additionalProperties": {
            "$ref": "#/$defs/expression"
          }
        }
      }
    },
    "item": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "category", "cardArt", "icon"],
      "properties": {
        "id": { "$ref": "#/$defs/id" },
        "category": {
          "enum": ["bun", "soy_milk", "youtiao", "congee"]
        },
        "cardArt": { "$ref": "#/$defs/id" },
        "icon": { "$ref": "#/$defs/id" }
      }
    },
    "clip": {
      "type": "object",
      "additionalProperties": false,
      "required": ["loop", "frames"],
      "properties": {
        "loop": { "type": "boolean" },
        "frames": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["frameId", "durationMs"],
            "properties": {
              "frameId": { "$ref": "#/$defs/id" },
              "durationMs": {
                "type": "integer",
                "minimum": 1
              }
            }
          }
        }
      }
    },
    "effectList": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id", "clip", "positionPx", "z",
          "blend", "opacity", "timeOfDay"
        ],
        "properties": {
          "id": { "$ref": "#/$defs/id" },
          "clip": { "$ref": "#/$defs/clip" },
          "positionPx": { "$ref": "#/$defs/point" },
          "z": { "type": "integer" },
          "blend": { "enum": ["normal", "add", "screen"] },
          "opacity": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "timeOfDay": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": { "enum": ["noon", "dawn", "evening"] }
          }
        }
      }
    },
    "nineSlice": {
      "type": "object",
      "additionalProperties": false,
      "required": ["frameId", "insets", "contentPadding", "minSize"],
      "properties": {
        "frameId": { "$ref": "#/$defs/id" },
        "insets": { "$ref": "#/$defs/insets" },
        "contentPadding": { "$ref": "#/$defs/insets" },
        "minSize": { "$ref": "#/$defs/size" }
      }
    }
  }
}
```

Coordinate conventions: rectangles are `[x,y,width,height]`; sizes `[width,height]`; points `[x,y]`; insets `[top,right,bottom,left]`. Pivots are measured in the **untrimmed source canvas**. `rect` excludes atlas extrusion. Render trimmed frames at `trimOffset − pivotPx`.

`verify` must additionally enforce:

| Check | Required result |
|---|---|
| Inventory and references | Unique IDs; all frame/texture/provenance references resolve; four characters, twenty expressions, twelve items |
| Registration | Character layers share source size/pivot; reconstructed previews match approved composites |
| Image integrity | File hashes/dimensions match; real cutout alpha; no baked matte; protected regions unchanged |
| Palette and text | Nontransparent source RGB belongs to the palette; OCR flags resolved by human review |
| Runtime geometry | Atlas rectangles fit; no overlap; nine-slice borders fit; background variants align; effect depth and placement approved |

The ticket’s cat, audio and store disclosure remain separate deliverables. This spec covers the requested image asset pipeline.
## Related

- [[tickets/0007-style-bible-and-first-assets]]
- [[research-ai-assets]]
- [[build-recommendation]]
