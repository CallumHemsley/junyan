# Foliage craft v1 — isolated study seam

Reserved world/0091 after checking main266e9bc,38local refs/current coordinator: highest90; no remote0091 branch. ACTIVE focused quality study, not whole-world acceptance. Branch codex/0091-foliage-craft, worktree /workspace/junyan-0091, port5499. Helper owns ONLY src/world/art/landscape/foliage.ts, docs/evidence/world/0091/** and docs/tickets/world/0091-foliage-craft.md.0084 remains sole draw.ts/index.ts/map author; no shared renderer/schema/dependency writes.

Chosen narrow future adapter (publish this seam before consumption):

```ts
export type FoliageSpecies = 'camphor' | 'willow' | 'fruit';
export type FoliageInput = {
  species: FoliageSpecies; seed: number; elapsedMs: number; reducedMotion: boolean;
  shadeColor: (base: string) => string;
};
export type FoliageBounds = { minX:number; minY:number; maxX:number; maxY:number };
export function foliageBounds(input: Pick<FoliageInput,'species'|'seed'>): FoliageBounds;
export function drawFoliage(ctx: CanvasRenderingContext2D,input:FoliageInput): void;
```

Native pixel coordinates, trunk foot(0,0), negativeY above ground. Caller supplies current drawLandscapeProp translated/scaled context (unit/18), NOT world coordinates. Bounds describe all visible native pixels including sway; caller retains depth, camera, culling/occlusion and maps them through its existing adapter. No ctx transform leak; preserve inherited alpha and save/restore. shadeColor called once per base material; no shadows/lighting layer duplication. Pure deterministic seed and injected time, reduced motion stable. No DOM text/audio/dependency/new renderer. Ground contacts and atmosphere casts remain existing owners. Helper may propose bounds/scale choices, no map collider edits.

Study3distinct hand-authored mature silhouettes: broad branching camphor with negative-space windows, leaning willow with asymmetric curtain/boughs, fruit tree with open crown and harvest-scale clusters. Consistent directional light; economical deliberate pixel clusters and varied understory/ground-edge specimens in evidence harness, not uniform stipple, thick icon outlines or repeated3lobe crowns. Terrain/shore integration stays0084; harness shoreline must clearly mark legal boundary and not imply walkability beyond collider. No shadow redesign.

Compare old52a4046 specimen and all3new species at native pixels and actual production-scale desktop/phone alongside real current player, path, shoreline. Use existing production camera/actor APIs in isolated evidence harness; do not claim harness proves integrated play. Include morning/evening explicit shade callback, silhouette/alpha/bounds/determinism checks and measured draw cost. Evidence must distinguish code-native study from actual App capture. Root/coordinator review chosen study before0084 adapter consumption, then foundation current-head integrated capture. Ready shadow/roof and main semantic reconciliation proceed independently.
