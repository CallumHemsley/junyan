import { courtyardMap } from '../../../../src/world/maps/courtyard';
import { worldMapSchema } from '../../../../src/world/schema';
import { drawMap, renderObjects, drawCat } from '../../../../src/world/art/courtyard';
import { cameraForMap, project } from '../../../../src/world/camera';
import { sampleAtmosphere, shadeAtmosphereColor, type DayPhase, type RGB } from '../../../../src/world/atmosphere';
import { drawPlayer } from '../../../../src/world/painter';
import type { WorldRenderView } from '../../../../src/world/render-contract';

const map = worldMapSchema.parse(courtyardMap), canvas = document.querySelector('canvas')!, ctx = canvas.getContext('2d')!;
canvas.width = Math.ceil(innerWidth / 2); canvas.height = Math.ceil(innerHeight / 2);
const position = { x: 16, y: 21 }, camera = cameraForMap(map.bounds, position, canvas.width, canvas.height, innerWidth < 600 ? 11 : 15);
function render(phase: DayPhase) {
  const frame = sampleAtmosphere({ mapId: 'courtyard', day: 1, seed: 42, timeOfDay: phase, elapsedMs: 0, reducedMotion: true });
  const bases = new Set<string>();
  const shadeColor: NonNullable<WorldRenderView['shadeColor']> = (base, exposure = 1) => {
    const rgb: RGB = typeof base === 'string' ? [parseInt(base.slice(1, 3), 16), parseInt(base.slice(3, 5), 16), parseInt(base.slice(5, 7), 16)] : base;
    if (typeof base === 'string') bases.add(base);
    return '#' + shadeAtmosphereColor(rgb, frame.light, exposure).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  };
  const view: WorldRenderView = { project: (p, z) => project(p, camera, z), shadeColor, elapsedMs: 0, reducedMotion: true, playerPosition: position, width: canvas.width, height: canvas.height, pass: 'ground' };
  ctx.globalAlpha = 1; ctx.fillStyle = shadeColor('#4c6556'); ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMap(ctx, map, view);
  const objects = renderObjects(map, view);
  objects.push({ id: 'proof-player', position, draw: () => drawPlayer(ctx, view, position, 'east', false, camera.scale) });
  const white = { x: 13.4, y: 17.7 }, black = { x: 35, y: 19.7 };
  objects.push({ id: 'proof-white', position: white, draw: () => drawCat(ctx, view, white, false, false) });
  objects.push({ id: 'proof-black', position: black, draw: () => drawCat(ctx, view, black, true, true) });
  objects.sort((a, b) => (a.depth ?? a.position.x + a.position.y) - (b.depth ?? b.position.x + b.position.y)).forEach(object => object.draw(ctx, view));
  const alphaFailures: string[] = [];
  for (const object of renderObjects(map, view)) {
    ctx.save(); ctx.globalAlpha = .45; object.draw(ctx, view);
    if (Math.abs(ctx.globalAlpha - .45) > .00001) alphaFailures.push(object.id);
    ctx.restore();
  }
  // Repaint after the alpha-consumption check; the capture is the normal material frame.
  ctx.globalAlpha = 1; ctx.fillStyle = shadeColor('#4c6556'); ctx.fillRect(0, 0, canvas.width, canvas.height); drawMap(ctx, map, view); objects.forEach(object => object.draw(ctx, view));
  return { phase, particles: false, proxy: false, materialBaseCount: bases.size, materialExamples: { wood: shadeColor('#8b6b4b'), masonry: shadeColor('#b19476'), foliage: shadeColor('#55765d'), cat: shadeColor('#e8e5d6') }, alphaFailures, objects: objects.length, camera, limits: 'Owner adapter with production camera/player and actual atmosphere function. This does not certify foundation proxy removal or production phase wiring.' };
}
Object.assign(window, { courtyardMaterials: { render } }); render('morning');
