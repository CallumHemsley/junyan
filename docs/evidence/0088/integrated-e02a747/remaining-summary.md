# Targeted ordinary feature follow-up — e02a747

Exact production head `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Independent desktop and phone runs: **2/2 passed**, 223.5 seconds combined. Normal opening and physical travel; no saved-state fixtures or debug teleport.

Covers apartment furniture placement, undo, cushion colour restyle, undo/reload; rooftop initial tidy and garden care/reload; workshop lamp repair/return/reload. The runner checks visible canvas hits before ordinary ground clicks to avoid HUD interception. It uses exact-source geometry for route planning and saved-state assertions, so this is collision/activity/persistence evidence, not unassisted discoverability.

Raw results: `remaining-results.json`; input runner: `remaining.spec.ts`; per-project event logs, final snapshots, screenshots and videos use `desktop-remaining` / `phone-remaining` prefixes. This fills the feature portion excluded by the earlier long journey runner grid-toggle error; it does not retroactively turn that earlier run green.

Full visual goal remains ACTIVE/2 of 4 partial; independent full rules remain 435 passed / 1 failed at this head.
