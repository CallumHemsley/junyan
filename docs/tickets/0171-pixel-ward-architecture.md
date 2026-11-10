---
id: 171
title: Draw the hospital ward's floor, walls and window
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The ward is the first thing a player sees.

## Done when

- `ward/` floor, wall slices, window, door, curtains, radiator, nurse-call panel, clock and notice board, per `docs/design/pixel-contracts.md`.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Owner: Claude Code (pixel worker). Branch `claude/0171-pixel-ward-architecture`, worktree `/Users/callumhemsley/Personal/junyan-px-0171`. No dev server or port: art is checked with `sheet.ts` and a scratch scene under `output/pixel/0171/scratch/`.
- Owns only `src/pixel/sprites/ward/arch-*.ts` and `src/pixel/sprites/ward/_arch.ts`; ticket 0172 draws `ward/furn-*.ts` in parallel.
- Done 2026-11-10. 61 sprites in `src/pixel/sprites/ward/arch-*.ts` (helpers in `_arch.ts`): floor (terrazzo `floor-a…d`, `-crack`, `-patch`, `-path-h/v/x`, `-damp-a/b`, `-edge-n/s/w/e/nw/ne/sw/se`), back-wall slices (`wall-a…d`, `-scuff`, `-peel`, `-oxygen(-b)`, `-sockets(-b)`, `-end-left/right`), caps (`cap-left/right(-b/-c)`, `cap-front(-b/-c)`, `cap-corner-tl/tr/bl/br`), `window`, `door`, `curtain-drawn/-gathered/-rail/-side-gathered/-side-drawn`, `radiator`, `nurse-call`, `clock` (60 frames at 1 fps), `noticeboard`. The wall rows match the bistro's (cap 0–5, plaster to 53, rail 54–57, dado 58–89, skirting 90–95), so the ward composes like `cafe.ts`.
- Learned: a 1px brass divider strip on every tile turns the floor into graph paper, and fixed-position glints repeat into a dot grid; the strips are now grey and the glints sit only where the wheel track crosses them. Terrazzo chips have to be sparse and low-contrast (no stone3), or they read as dirt at 2x. Gloss streaks on every dado slice read as a dash pattern; now only some slices have one. A see-through gap between radiator sections reads as a picket fence; a dark groove with lit hubs reads as cast iron. An 88px window high in the plaster was too small for the room's light source; at 96px, cutting through the dado rail, it reads. North–south curtains seen end-on stay a compromise: a straight narrow column reads, while a wavy one looked like seaweed and a zig-zag like a saw. Ceiling track runs float when nothing is under them, so compose them over beds.
