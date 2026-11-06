---
id: 98
title: Author a detailed riverbank route
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

The connected world is playable but its outdoor surfaces and destinations remain sparse compared with the actual Stardew Valley reference. Improve a coherent route before adding more empty acreage.

## Done when

- The existing washing terrace, lower timber crossing and old ferry have distinct materials, construction and connected worn ground.
- The actual route, three existing inspections, discovery saves and reload work on desktop and phone; water, deck and player boundaries remain accurate.
- Matched actual-App views and movement are reviewed independently against publisher reference images with source labels withheld. Record shortcomings and iterate; no automatic AAA acceptance or new gameplay-verb claims from art alone.
- Source checks, build, relevant journeys, console and phone/desktop visual inspection pass. New raw QA stays private.

## Notes

- Reserved centrally after world/0097; baseline main `37fb62c` / PR 46. Owner GPT-6.1 Sol High, branch `codex/0098-riverbank-craft`, worktree `/private/tmp/junyan-world-riverbank-craft`, strict dev/preview ports 5532/5533.
- Exclusive paths: `src/world/art/landscape/{ground,draw,index}.ts`, a focused test in that directory, and this ticket. No maps, navigation, content, audio, schemas, saves, actor or shared lighting edits without a separate coordinated seam.
- Three existing destinations: `landscape.washing-stones`, `landscape.lower-crossing`, `landscape.old-ferry`. Existing actions are inspections, not washing or ferry mechanics.
- Tree contact is currently owned by the landscape index painter; coordinate with 0099 rather than adding a duplicate shadow. Keep deliberate distant haze, explicit material shading, grouped foliage alpha and water/deck clipping correct.
- Private preparation: `/private/tmp/junyan-world-private-qa/next-landscape/proposal.md`. Keep each visual iteration tied to a source commit and comparable camera/time fixtures; separate these fixtures from real travel proof.
