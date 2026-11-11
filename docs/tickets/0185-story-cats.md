---
id: 185
title: Draw the courtyard's white and black story cats
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The courtyard story has two cats whose colour is a clue (the white cat and the black cat), but both draw as the grey street tabby (`critter/cat-tabby`).

## Done when

- `critter/cat-white` and `critter/cat-black` exist with the tabby's actions (`idle`, `walk`, `sleep`) in down/left/right, same scale and conventions.
- The pixel game maps the story cats (`white-cat`, `black-cat`) to them; any other cat stays the tabby. Pure mapping, unit-tested.
- `tsc -b` and `vitest run src/pixel src/world` pass.

## Notes

- Owner: Claude Code (pixel worker). Branch `claude/0185-story-cats`, worktree `/Users/callumhemsley/Personal/junyan-px-0185`, base `claude/0176-outdoor-map-pipeline`. No dev server (offline renders only).
- Done 2026-11-11. `src/pixel/sprites/critter/_cat.ts` now holds the one cat body (poses, timing, anchors) wearing a `Coat`. `cat-tabby.ts` is a coat on it and is unchanged pixel for pixel, checked by baking the old and new sets and comparing every frame. `cat-white.ts`: fluffy, odd-eyed (blue right eye, amber left), pink nose and ears, the tail tip sooty from the coal shed, cool grey shading and a steel1 outline so she reads on pale paving. `cat-black.ts`: purple-black fur with blue-black highlights, amber eyes, a small white chest blaze.
- Mapping: `catSprite` / `STORY_CATS` in `src/world/pixel/outdoor.ts` map `white-cat`/`cats.white` → `critter/cat-white` and `black-cat`/`cats.black` → `critter/cat-black`; any other cat stays the tabby. `lifeActor` also sends cats to `idle` instead of `sit`: a cat's idle is already sitting, and the old `sit` fell back with a warning. Tests are in `courtyard-map.test.ts`.
- Learned: with a full-blue top tone, the black cat read as navy. Keeping blue only for the topmost highlight and the tail rings gives "black with a sheen". A white blaze just under the chin reads as a fang; two pixels lower it reads as a chest blaze.
- Open: at the white cat's `bicycle` habitat spot (13.4, 17.7) the bicycle sorts in front of her and nearly hides her. That may be what the clue wants ("under the bicycle"), but someone should look at it in play.
