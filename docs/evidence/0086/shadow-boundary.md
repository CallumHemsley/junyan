# Shadow boundary correction

Status ACTIVE. Root inspected geometric cards in landscape c5243d5. Latest inspected landscape 6732017 still calls its .4-alpha diamond shadow() from depth-sorted drawLandscapeProp for mature-tree, tree, willow, bamboo and other props. Atmosphere also emitted a cast quad and contact rectangle for standard vegetation. These are overlapping ownership, not deliberate deeper grove shade.

Boundary for coordinator/landscape owner: landscape draws small trunk/base contact shadows in its ground pass only, preserving inherited alpha. Remove shadow cards from its depth-sorted object callbacks. Atmosphere owns phase-driven cast silhouettes for trees, mature trees, willow and bamboo. Automatic park/riverbank vegetation hooks set contact:false. No art files are edited by atmosphere.

Atmosphere now emits one low-opacity, 20-point lobed cast silhouette per canopy in ground pass, with type-specific proportions and a seeded stable outline. Its center follows explicit phase direction/height. Mature tree radius is calibrated to the authored canopy width. Optional contacts are small 12-point ovals, at most .5 tile wide, rather than canopy-sized rectangles. Cast silhouettes share an explicit cast-shadow role and are union-filled once, so overlapping trees do not multiply darkness. This preserves shade coverage and removes stacked cards. Current phase alpha is multiplied by .65; the adapter also multiplies inherited host alpha.

Authored bridge/boardwalk/deck rectangles are explicit shadow exclusions. The cast union is clipped against each exclusion, below actors and crossing surfaces. No blur, global filter, hidden clock, collision edit or new animation loop is added. Phase and injected seed determine the silhouette; reduced motion does not change it.

Verification plan: isolated no-shadow/contact/cast/composite captures on pond deck, moon bridge and evening grove, plus pixel checks for overlap union, inherited alpha and deck exclusions. Landscape contact export/removal is required before the composed boundary can be accepted. Old object cards must not be hidden by reducing all shade to zero.
