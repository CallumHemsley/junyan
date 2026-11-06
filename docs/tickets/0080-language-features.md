---
id: 80
title: Remove translated words from neighbourhood rules
status: done
priority: high
type: chore
created: 2026-11-06
---

## Why

Make additional learning languages an authored content task rather than a rewrite, while preserving Mandarin gameplay.

## Done when

- Language-specific assumptions live at explicit boundaries; stable IDs drive rules.
- Current Mandarin behavior and saved progress remain intact.
- Focused behavioral checks, existing tests and build pass; integration is independently reviewed.

## Notes

- Owner: Codex GPT-6.1 Sol worker.
- Branch: codex/0080-language-features.
- Worktree: /private/tmp/junyan-0080-language-features.
- Port: 5306; strictPort required.
- Reserved centrally before parallel work. User authorizes implementation, review and merge.

- Apartment recovery now uses stable word IDs in one pure function shared by its renderer and neighbourhood reducer. Repairs word lookup also uses IDs.
- Feature loaders use the shared language schemas and the Mandarin raw-data adapter. Existing JSON, audio paths and authored Mandarin remain unchanged.
- Feature and neighbourhood copy lives in explicit Mandarin catalogs. Token rendering uses the shared language policy.
- Verified `pnpm test` with 326 passing tests and `pnpm build`. The alternative-language regression registers all feature bundles under the French policy without pronunciation, then proves identical furniture recovery, cat gifts and saved progress.
- Learned that the apartment renderer and neighbourhood reducer duplicated recovery rules. Keeping one pure recovery function prevents those paths from diverging.
- Integrated browser journeys, screenshots and independent review remain part of the parent integration gate.
