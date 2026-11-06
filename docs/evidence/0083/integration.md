# Rooftop integration request

Owner 0083. Contract v1 at fb167fd. Goal remains ACTIVE until real integration and independent review.

Import `mapDefinitions` from `src/world/maps/rooftop/index.ts` for base registry loading. Runtime must use `rooftopForGarden(neighbourhood.garden)` for both map collision and scenery. This pure projection consumes the original State directly; it never advances day, care, gifts or persistence. Pot `variant = growth * 6 + drooping * 3 + careIndex` with dry/ready/extra indices 0/1/2. Shade has two solid feet and a walk-under canopy. All three pots exist before restoration; existing tidying activity remains accessible.

Stairs contract is `rooftop:to-residential-stairs` targeting `residential-stairs:from-rooftop`. Rooftop arrival `from-residential-stairs` is (12.5,29), facing east, outside the exit rectangle at x9–10.5,y28–30. Stairhead core is west of the opening. Register the existing garden view through the garden and water anchors. Exploration hooks `rooftop.sit` and `rooftop.lookout` are proposals for 0087, not claimed implemented actions. Existing resident ID is lin-jie. No local wildlife/speech or weather clock is introduced.

Need from 0078: exact art draw adapter, state projection registration call and generic roof material support. Need from 0086: rooftop sky/light sampling. Need from 0087: nonverbal seating/lookout behavior and resident placement. No shared core edits by this owner.

Layout is 48x36 with a 44x32 roof surface, a services spine, trellis walk, care plots, orchard, lookout and shaded terrace. Bounds alone are not quality proof. `layout.py` compares two circulation sketches with all six sites blocked. Production collision tests and shared-runtime keyboard/touch evidence are outstanding.

First checks. Original suite 308/308 passed on this cloud checkout after restoring frozen dependencies with the existing Node22/pnpm10 toolchain. TypeScript passes. Rooftop tests 4/4 passed, including 720 legal pot/shade configurations and footprint-aware circulation. One failed run found the basin approach at x11 touched its collider; corrected approach to x11.5 and reran. Tests are layout proof, not shared-runtime input/camera proof. Foundation draw adapter at 2532c61 is now available; artwork will implement its three passes.
