# Production worker observations — 23be251

Exact build23be251185d989f7b97d36391a8f6478344b1a3b. Desktop+phone observation runners completed with zero page errors. Native Worker subclass transparently logs request/reply timings; no artificial delays, event mutation, browser save writes or teleport. Normal opening and walking to town first. Phone means Chromium viewport emulation with ordinary mouse pointers, not physical-phone or native-touch evidence.

Initial20click burst: desktop replies64–170ms, final simple target145.5ms. Phone26–80ms, final simple target68.7ms. Observed final destination reached in both. These are request-to-reply times including queued work; not main-thread stalls or a physical-device benchmark. No blanket performance PASS. Keyboard movement cancelled pending intent in tested timing and position stayed fixed800ms after release. Actual worker request target agrees with independently calculated clicked ground within approximately1e-6 at odd desktop widths1439/1001 and phone portrait393/landscape851.

Integrity correction: original listener retained event.data.path by reference; production consumes that same array by shifting waypoints, so retained original path lengths/content can become empty. Timings and separately serialized position observations are unaffected. Original observations retained as *-preclone.json. Script now structuredClones path at message arrival; final immutable-log rerun below supplies valid path-content observations.

Open gates: replace path while already moving around a corner; map/activity changes before pending reply; direct baseline versus expensive queue burst; frame/longtask measurement; actor/reaction phase continuity across resize; clicking against last-painted camera while moving; physical-phone performance. Resize screenshots retained for visual follow-up but alone do not establish unchanged actor world coordinates. Observation-runner PASS is not acceptance of these open gates.

## Final immutable-log/native-key recheck

Final desktop+phone runners2/2 pass. Exact numbers in final-summary.json. Capture-phase native keydown timestamps establish the keyboard event precedes the worker reply in these runs; position remains unchanged800ms after key release. Initial earlier runs had already received their replies before keydown and established only route cancellation, not pending cancellation. Final reply paths are cloned on arrival. Raw prior observations are retained for transparency. This does not close map/activity-before-reply or moving-route replacement cases. Final video files match final runs.
