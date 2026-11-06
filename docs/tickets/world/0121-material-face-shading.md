---
id: 121
title: Restore material face brightness through the shared world shader
status: doing
priority: high
type: bug
created: 2026-11-06
---

## Why

Town and residential art pass face-value factors such as0.65/0.78 to shadeColor; their fallback multiplies the material by that factor. The shared shader instead forwards it only as solar exposure, leaving ambient unchanged. Interior ambient dominates and night has no sun, so intended side planes become nearly flat. This contributes to the user-reported visual downgrade across levels.

## Done when

- Reproduce the missing face contrast in a meaningful shader regression at indoor/night light; restore the material brightness contract once while retaining atmospheric sunlight exposure behavior in its separate API.
- Default-factor colors, alpha and deterministic phase behavior stay consistent; material faces retain intentional contrast across all phases.
- Actual native before/after views across residential, town and relevant areas show gains without crushed night values. Independent source and harsh visual review plus relevant checks pass.
- Coordinate artist passes so no compensating factor is applied twice. Do not claim the change alone restores overall Stardew craft.

## Notes

- Root owns branch codex/0121-material-face-shading; worktree /private/tmp/junyan-world-material-shading; strict ports5584/5585.
- Shared lighting.ts/type/tests only initially; preserve shadeAtmosphereColor’s physical sunlight-exposure semantics.119/120 own art callers and118 explicit restaurantRGB remains defaultfactor1.
- All raw QA/diagnosis and captures stay private under /private/tmp/junyan-world-private-qa/0121. No public evidence bundle.
