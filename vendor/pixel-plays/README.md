# Pixel Plays renderer

Source: https://github.com/amirmushichge/pixel-plays
Copyright (c) 2026 Amir Mushich. MIT licensed; see [LICENSE](LICENSE).

`engine.js` is the upstream software renderer and `reference-balote.html` is its
reference usage, supplied with the project scaffold. No upstream music is used.

`src/scene/renderer.js` adapts the actual engine's orthographic projection, depth
buffer, hue-shifted lighting ramps, Bayer dithering, sphere/capsule/box rasterizers,
shadows, edge shading and articulated figure renderer. Its MIT notice is retained
in the module. The restaurant geometry and composition are original to Junyan.
The adaptation uses a canvas-local factory, a closer camera and explicit scene
inputs. Global DOM lookup, viewport fitting, wind vegetation, game input and
upstream game rules are omitted. React owns requestAnimationFrame cleanup and
pointer input; all Chinese labels are real DOM controls.
