---
id: 29
title: Refine four hairstyles and enlarge their eyes
status: todo
priority: high
type: feature
created: 2026-11-01
---

## Why

After judging the five production-model close-ups, Callum accepted the diagnosis that four hairstyles look like small lumpy caps perched on exposed heads, with high hairlines, abrupt temple gaps and insufficient distinction. Callum also requested larger eyes for those four characters. 张老师 is explicitly excluded from both changes.

## Done when

- Waiter, 林姐, 小李 and 小周 have fuller, connected hair coverage, deliberate hairlines and distinct silhouettes: soft short fringe; swept-back hair into a bun; tidy side part; fringe/side locks flowing into a ponytail respectively.
- Those four characters have visibly larger, readable eyes at actual game resolution, with convincing placement/depth at oblique angles. 张老师 retains his current hair and eyes exactly.
- Eight-direction standing/seated/served and walking views hold together without detached hair blobs, exposed unintended bald patches, eyes showing through the rear head, clipping or unnatural overlap. Existing tray orientation/occlusion and authored clothing/identity remain intact.
- The actual Pixel Plays renderer, Mandarin DOM UI, voice/audio assets, game rules and save behavior remain unchanged.
- Independent cross-review, appropriate unit/build and muted phone/desktop journey checks pass. Before/after native/enlarged close-ups and a silent all-five turntable are delivered for parent inspection.

## Notes

- Reserved centrally by parent. Astra orchestrator coordinates Sol 6.1 medium implementation and independent verification workers; one production writer for renderer geometry, declarations, related tests/helpers and this ticket.
- User confirmed the four hairstyle directions in chat and explicitly added larger eyes for everyone except 张老师. Preserve his isolated portrait/geometry across angles, rather than comparing entire scene pixels that include changed neighbours.
- Ticket 0028 UI revamp is active in a separate worktree and owns App/styles/disclosure. Do not edit those files, schemas/content, playback, assets, rules, saves, dependencies or vendored engine code.
- Strict isolated ports 5193 (dev) / 5194 (preview). Every browser launch must be explicitly silent; no system-volume changes or audible playback. Offscreen Pixel Plays rendering preferred for angle/contact sheets.
- Existing comparison: `output/playwright/character-integrated-root/cast-contact-sheet.png`. Parent baseline is `ed13443` plus this reservation; source geometry is `src/scene/renderer.js` with reusable characterFigure/customerPose helpers.
- No push, PR, merge or deployment by delegates; parent integrates after review and publication follows combined UI/art verification.
