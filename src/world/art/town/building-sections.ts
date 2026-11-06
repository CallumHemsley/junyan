import type { WorldMapDefinition, Point } from '../../schema';
import type { WorldRenderObject, WorldRenderView } from '../../render-contract';

type Prop = WorldMapDefinition['props'][number];
type Occlusion = WorldRenderObject['occlusion'];
type Painter = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, prop: Prop, view: WorldRenderView) => void;
type Plate = { canvas: OffscreenCanvas; scale: number; shader: WorldRenderView['shadeColor']; left: number; top: number; elapsedMs: number; reducedMotion: boolean };
const plates = new WeakMap<Prop, Plate>();

function plateFor(prop: Prop, view: WorldRenderView, paint: Painter): Plate {
  const at = view.project(prop.position), scale = Math.round(Math.abs(view.project({ x: prop.position.x + 1, y: prop.position.y }).x - at.x) * 1e6) / 1e6;
  const prior = plates.get(prop);
  const reusable = prior && prior.scale === scale && prior.shader === view.shadeColor && prior.reducedMotion === view.reducedMotion;
  if (reusable && (prop.kind !== 'laundry' || view.reducedMotion || prior.elapsedMs === view.elapsedMs)) return prior;
  const left = -Math.ceil((prop.height + 2) * scale), top = -Math.ceil(12 * scale);
  const canvas = reusable ? prior.canvas : new OffscreenCanvas(Math.ceil((prop.width + prop.height + 4) * scale), Math.ceil(((prop.width + prop.height) * .5 + 14) * scale));
  const context = canvas.getContext('2d')!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const localView: WorldRenderView = {
    ...view, width: canvas.width, height: canvas.height,
    project(point, z) { const p = view.project(point, z); return { x: p.x - at.x - left, y: p.y - at.y - top }; },
  };
  paint(context, prop, localView);
  const plate = { canvas, scale, shader: view.shadeColor, left, top, elapsedMs: view.elapsedMs, reducedMotion: view.reducedMotion };
  plates.set(prop, plate);
  return plate;
}

function frontSupport(prop: Prop, u: number, extension = 0): Point {
  const height = prop.height + extension;
  const p = prop.position, bounded = Math.max(p.x - p.y - height, Math.min(p.x + prop.width - p.y, u));
  return bounded <= p.x + prop.width - p.y - height
    ? { x: bounded + p.y + height, y: p.y + height }
    : { x: p.x + prop.width, y: p.x + prop.width - bounded };
}

export function buildingSections(prop: Prop, view: WorldRenderView, occlusion: Occlusion, paint: Painter, extension = 0): WorldRenderObject[] {
  const p = prop.position, u = p.x - p.y, height = prop.height + extension;
  const corners = [view.project({ x: p.x - 2, y: p.y - 2 }, 10), view.project({ x: p.x + prop.width + 2, y: p.y + height + 2 }), view.project({ x: p.x - 2, y: p.y + height + 2 }), view.project({ x: p.x + prop.width + 2, y: p.y - 2 })];
  if (Math.max(...corners.map(p => p.x)) < 0 || Math.min(...corners.map(p => p.x)) > view.width || Math.max(...corners.map(p => p.y)) < 0 || Math.min(...corners.map(p => p.y)) > view.height) {
    return [{ id: prop.id, position: frontSupport(prop, u, extension), draw() {} }];
  }
  const objects: WorldRenderObject[] = [];
  const start = u - height - 1.5, end = u + prop.width + 1.5, step = .5;
  for (let from = start, index = 0; from < end; from += step, index++) {
    const to = Math.min(end, from + step), position = frontSupport(prop, (from + to) / 2, extension);
    const x0 = Math.max(p.x, from + p.y), x1 = Math.min(p.x + prop.width, to + p.y + height);
    const y0 = Math.max(p.y, p.x - to), y1 = Math.min(p.y + height, p.x + prop.width - from);
    const sectionOcclusion = occlusion && x1 > x0 && y1 > y0 ? { ...occlusion, rect: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } } : undefined;
    objects.push({
      id: index === 0 ? prop.id : `${prop.id}.section-${index}`,
      position,
      occlusion: sectionOcclusion,
      draw(ctx, currentView) {
        const plate = plateFor(prop, currentView, paint), origin = currentView.project(p);
        const x = Math.max(0, Math.round((from - u) * plate.scale - plate.left));
        const right = Math.min(plate.canvas.width, Math.round((to - u) * plate.scale - plate.left));
        if (right <= x) return;
        ctx.drawImage(plate.canvas, x, 0, right - x, plate.canvas.height, Math.round(origin.x + plate.left) + x, Math.round(origin.y + plate.top), right - x, plate.canvas.height);
      },
    });
  }
  return objects;
}
