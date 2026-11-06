# Landscape 0084 — active

Owner: cloud builder 7, thread `01a1ae20-bd21-7127-bf23-09146cdb604d`, host durable. Branch `codex/0084-landscape`, checkout `/workspace/junyan`, strict port 5486. Native create_goal and cross-thread send unavailable. This record and ticket retain the active objective.

The full objective remains substantial surrounding outdoor landscapes: varied town-edge greenery, river/pond/bridge routes, woods and viewpoints with authored branching exploration. Completion requires integration and independent gameplay review, not this first data unit.

Contract: centrally published v1. Owns only `src/world/maps/landscape/*`, `src/world/art/landscape/*`, ticket 0084 and this evidence directory.

Throughput checkpoint:
- Blocking: acquire central ownership and contract (done); foundation executable schema/draw adapter pending.
- Independent: author park and riverbank JSON plus original art; foundation alone wires the registry and game.
- Shared state: no renderer, App, save, schema, dependency or other domain writes.
- Decomposition: one writer keeps shoreline geometry, crossings and composition consistent; independent Astra review follows integration.

First data unit: park 84×68, riverbank 96×80, seven park landmarks and eight riverside landmarks. Two shore-to-shore crossings make a river loop; orchard/bamboo/pond/ridge paths make park loops. Actual reachable area, routes and collision proof pending. Dimensions are not a quality claim.

Seams requested: foundation imports `mapDefinitions` from `src/world/maps/landscape/index.ts`; validates through its sole schema; publishes draw adapter. Town supplies reciprocal `from-park`, `from-riverbank`; courtyard supplies `from-park`. Landscape exports `from-town`, `from-courtyard` and `from-riverbank` in park; `from-town`, `from-park` in riverbank.

Next: verify footprint-safe connectivity and landmark approaches; render original landscape art at camera scale; adapt to foundation commands; capture actual keyboard/touch travel and phone/desktop views; resolve reviewer defects. No integration PASS yet.
