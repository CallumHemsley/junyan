# Lighting boundary reproduction

Exact foundation head 74a52137814f8ed8c4a2b7f9c9f74089e4f6a15f. Run `node docs/world-program/lighting-74a5213/probe.mjs` from the repository. It intentionally exits 1 on this defective head. The probe transpiles the actual published atmosphere and lighting source; it does not replace production code.

The recorded output confirms identical material input changes after a different material was shaded. The global context proxy also changes an already-lit emissive RGB assignment. This is pure-source/synthetic-canvas-property evidence, not a measured rendered screenshot failure. Foundation must remove output-color provenance guessing, use explicit material shading once, and leave atmosphere/emissive effects unshaded. Runtime phase comparison remains required after the fix.
