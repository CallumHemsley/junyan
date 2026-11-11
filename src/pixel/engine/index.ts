/** Public API of the pixel engine. Pure TypeScript; `PixelView.tsx` is the only DOM piece. */
export * from "./types.ts";
export { rgbOf } from "./color.ts";
export { createAtlas, frameAt, placeholderSprite, type Atlas, type AtlasOptions, type AtlasSprite, type Image, type Placeholder } from "./atlas.ts";
export { createFrame, blit, fill, copyRegion, hashFrame, type Frame } from "./frame.ts";
export { defineScene, compileScene, placeProp, propCollider, type CompiledScene, type Placed } from "./scene.ts";
export { resolveActorSprite, actorFrame, createActorResolver, FALLBACK_CHARACTER, WALK_TILES_PER_FRAME, type ResolvedActor } from "./actors.ts";
export { GRADES, LUT_BITS, applyGradeLut, buildGradeLut, gradeLut, type ContactShadow, type Grade } from "./grade.ts";
export { DEFAULT_AMBIENT, compileLight, flickerAt, motesAt, createLighting, type CompiledLight, type Mote } from "./light.ts";
export { chooseZoom, viewSize, followPoint, createCamera, toScreen, toWorld, type Camera, type CameraInput, type ZoomTargets } from "./camera.ts";
export { move, isFree, overlaps, PERSON_RADIUS, type Radius } from "./collision.ts";
export { createSceneRenderer, renderToFrame, type SceneRenderer, type RendererOptions, type ViewOrigin } from "./renderer.ts";
