# One shadow boundary

Landscape owns small contact marks only, drawn by `drawContactShadows` at the end of the ground pass. Tree/rock root contacts are small ellipses; bench contacts sit under the legs. The helper multiplies inherited alpha and restores it. `drawLandscapeProp` has no shadow calls; `renderObjects` emits no contact/cast geometry. Forest-floor color is now broken moss/leaf texture, not a dark filled card.

Atmosphere owns phase-driven cast shadows. In the currently consumed source, `sampleAtmosphere` emits a cast quadrilateral and a second contact rectangle per shadow hook. `atmosphereHooksForMap` does not yet recognize `mature-tree`. Requested owner 0086 correction: retain one phase-driven organic canopy cast, remove the duplicate contact rectangle, and include mature-tree with canopy scale/height appropriate to its authored dimensions. This is not a request for a second renderer or extra day clock.

`shadows/isolated-layers.png` compares contact-only, atmosphere-cast-only and combined using actual production map/art/atmosphere functions at the same camera. The blue geometric patch visible only in the cast columns identifies the remaining atmosphere-owned source. No claim that the combined shadow quality is accepted. Once 0086 publishes its correction, acquire it unchanged and repeat isolation plus actual App capture.
