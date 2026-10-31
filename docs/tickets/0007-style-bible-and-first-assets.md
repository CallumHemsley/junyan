---
id: 7
title: Style bible and the first asset set for the stall
status: todo
priority: high
type: feature
created: 2026-10-31
---

## Why

The slice needs a background, four faces with expressions, twelve items and a UI kit that look like one game. AI art only coheres with a process: a written style bible, one character sheet per cast member, edit-in-place for variants, a rubric gate, and one unifying post-filter. This ticket builds that process and uses it once.

Blocked on [[decisions/0002-platform-stack-and-art]] being accepted.

## Done when

- `docs/ideas/style-bible.md`: palette (hex list sampled from reference photos), line weight, lighting, materials, a "never" list (no text in images, no clean anime gloss), the setting brief (which breakfast-shop aesthetic), and five anchor images.
- A model bake-off: the four regulars generated as character sheets in two image models, scored with the consistency rubric, one model chosen and recorded in the ticket.
- Assets in `assets/` with a manifest JSON: one background plate at noon plus dawn and evening grades and separate steam, rain, light and passer-by layers; four regulars × five expressions on transparent, layered as body / eyes / mouth / arm; twelve item cards and icons; a cat; the UI kit (dialogue box, name plate, price board frame, receipt, buttons) as nine-slices.
- A repeatable script that calls the image API with the style bible, writes candidates, applies the rubric gate, removes backgrounds, quantises to the palette, applies the filter and packs the manifest.
- Two ambient beds and about eight sound effects, licence-clean, sources recorded.
- A one-line disclosure text ready for store pages.

## Notes

- Working spec (bake-off procedure, rubric, style-bible template, prompt templates, pipeline and manifest schema): [[ideas/research-image-pipeline]].
- Toolchain and reasons in [[ideas/research-ai-assets]]; the visual formula and the liveness checklist in [[ideas/research-visual-formula]] §2.
- Chinese text never goes in an image; the engine renders it (ticket 6).
- Keep every prompt, seed and rejected candidate; closed tools randomise seeds.
