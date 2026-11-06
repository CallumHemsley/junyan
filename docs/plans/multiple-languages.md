# Language foundation workflow

## Definition of done

Mandarin behavior, authored assets and old saves remain intact. A second-language fixture validates, renders word boundaries and completes the same pure game loop. Runtime words and rules do not depend on Chinese field names or translated labels. UI copy and locale formatting have an explicit replacement boundary. Independent review and browser journeys pass before merge.

## Phases

1. Ground and compare designs. Compare a neutral runtime with a raw Mandarin adapter against a full authored-data migration and a React locale provider.
2. Frame and fan out. Content, UI and neighbourhood workers each own a worktree. The parent owns persistence, integration and verification. Contracts and schemas have one writer.
3. Aggregate. Review each branch diff, integrate on ticket 0077 and migrate integration fixtures.
4. Verify. Run unit tests, build and browser journeys on ports 5300/5301. Inspect phone and desktop screenshots and console output. Exercise a non-Mandarin content fixture.
5. Report and merge. Independent workers report defects without editing. Fixes return to writers. Merge only after findings are resolved and checks pass.

## Design choice

Keep authored Mandarin JSON intact for the existing offline audio generators. Adapt it once into `Word { id, text, pronunciation?, gloss, audio }`. A language policy owns validation, token spacing and document language. Typed catalogs own interface wording. Stable IDs own game actions and recovered vocabulary. Keep static pack selection because no second production pack or selector is requested. Preserve the bounded English opening premise.

## Throughput checkpoint

The critical path is the shared content contract, followed by integration and browser verification. Three GPT-6.1 Sol workers write nonoverlapping slices concurrently. The coordinator reserves tickets before fan-out and serializes shared schemas and final integration. No dependencies or lockfiles need changing.

## Known boundaries

The shipped game remains Mandarin. New production languages need authored dialogue, matching audio, UI catalog and feature content. This work supplies those seams and a second-language proof, not translations or a new setting.
