# Next integrated runtime checks — source observations only

Exact inspected head74a52137814f8ed8c4a2b7f9c9f74089e4f6a15f. No runtime failure claimed below.

- WorldViewport76–78 queues replacement click but old path continues at51–52; reply27 installs a route based on earlier from. Measure position drift, reversal, corner sliding and final arrival during redirect.
- path-worker4–8 synchronously computes every queued request. Discarding outdated replies does not cancel/coalesce work. Compare final simple click latency alone versus after20 costly clicks; measure main-thread frames separately.
- WorldViewport40 initializes animation elapsed inside effect depending on viewport64. life/sample22–27 uses elapsed for NPC positions. Compare actor position/phase after20s then orientation/resize without map/save changes.
- Camera ref56 updates each animation frame; paint57 at30fps. Picking76 can use a camera newer than visible image. Test visible landmarks while moving and odd CSS dimensions/DPR1/3.
- Keyboard movement50 increments request ID and clears path. Map/activity effect23 and reply guard27 appear to invalidate pending paths. Verify held/brief keys, doors and opening/closing actual activity before replies.
- Reply handler does not check paused. Observe journal/word overlay pending-path behavior and document actual continuation after close.

These checks supplement ordinary all-map journeys; they cannot replace activity, visual or persistence acceptance.
