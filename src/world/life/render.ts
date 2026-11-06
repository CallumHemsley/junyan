import type { WorldRenderView } from '../render-contract';
import type { Position } from '../../contracts';
import type { ActorPose } from './model';
import type { LifeState } from './interactions';

export type LifeView = Pick<WorldRenderView, 'project' | 'elapsedMs' | 'reducedMotion'>;
export type ResidentDrawer = (ctx: CanvasRenderingContext2D, actor: ActorPose, view: LifeView, posture: 'stand' | 'sit' | 'work' | 'react') => void;

function wildlife(ctx: CanvasRenderingContext2D, actor: ActorPose, view: LifeView) {
  const p = view.project(actor.position);
  const phase = view.reducedMotion ? 0 : actor.phaseMs;
  const flip = actor.facing === 'west' || actor.facing === 'north' ? -1 : 1;
  ctx.save();
  ctx.translate(Math.round(p.x), Math.round(p.y));
  ctx.scale(flip, 1);
  ctx.fillStyle = '#29352a40';
  ctx.fillRect(-6, -1, 12, 3);
  if (actor.kind === 'cat') {
    const white = actor.characterId === 'white-cat';
    const fur = white ? '#ede5ce' : '#343c38', edge = white ? '#b3a88a' : '#202b28';
    const stride = actor.action === 'walk' ? Math.floor(phase / 140) % 2 : 0;
    const tail = view.reducedMotion ? 0 : Math.floor(phase / 600) % 2;
    ctx.fillStyle = edge;
    ctx.fillRect(-7, -9, 13, 8);
    ctx.fillRect(2, -13, 7, 9);
    ctx.fillRect(2, -15, 2, 3);
    ctx.fillRect(7, -15, 2, 3);
    ctx.fillRect(-10, -8 - tail, 4, 3);
    ctx.fillRect(-12, -11 - tail, 3, 4);
    ctx.fillStyle = fur;
    ctx.fillRect(-6, -8, 11, 6);
    ctx.fillRect(3, -12, 5, 6);
    ctx.fillRect(-5 + stride, -3, 3, 3);
    ctx.fillRect(2 - stride, -3, 3, 3);
    ctx.fillStyle = white ? '#7a8868' : '#b7bd83';
    ctx.fillRect(7, -10, 1, 1);
    ctx.fillStyle = '#aea18d';
    ctx.fillRect(8, -8, 2, 1);
  } else {
    const flutter = actor.activity === 'startle' && !view.reducedMotion ? Math.floor(phase / 100) % 3 : 0;
    ctx.fillStyle = '#75644d';
    ctx.fillRect(-3, -6, 6, 4);
    ctx.fillRect(1, -9, 4, 4);
    ctx.fillStyle = '#b8a17b';
    ctx.fillRect(-2, -5, 4, 2);
    ctx.fillStyle = '#4b5145';
    ctx.fillRect(-5, -7 - flutter * 2, 4, 2 + flutter);
    ctx.fillStyle = '#c2a16a';
    ctx.fillRect(5, -7, 2, 1);
    ctx.fillRect(-1, -2, 1, 2);
    ctx.fillRect(2, -2, 1, 2);
    ctx.fillStyle = '#252f2a';
    ctx.fillRect(3, -8, 1, 1);
  }
  ctx.restore();
}

export function drawLifeActor(ctx: CanvasRenderingContext2D, actor: ActorPose, view: LifeView, drawResident: ResidentDrawer): void {
  if (actor.kind !== 'resident') { wildlife(ctx, actor, view); return; }
  const posture = actor.activity === 'sit' ? 'sit' : actor.activity === 'work' ? 'work' : actor.activity === 'watch' ? 'react' : 'stand';
  drawResident(ctx, actor, view, posture);
}

export function drawLifeReactions(ctx: CanvasRenderingContext2D, state: LifeState, mapId: string, targets: readonly { id: string; position: Position }[], view: LifeView): void {
  for (const event of state.reactions) {
    if (event.mapId !== mapId) continue;
    const age = view.elapsedMs - event.atMs;
    if (age < 0 || age > 1800) continue;
    const target = targets.find(target => target.id === event.targetId);
    if (!target) continue;
    const p = view.project(target.position);
    const progress = view.reducedMotion ? .5 : age / 1800;
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = '#d4dfc2';
    ctx.lineWidth = 1;
    if (event.reaction === 'ripple') {
      for (let i = 0; i < 3; i++) {
        const size = 3 + progress * 16 + i * 5;
        ctx.beginPath(); ctx.ellipse(p.x, p.y - 2, size, size * .4, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (event.reaction === 'sway' || event.reaction === 'flutter') {
      for (let i = 0; i < 4; i++) {
        const x = p.x + (i - 1.5) * 5, y = p.y - 10 - progress * 14 - i % 2 * 4;
        ctx.fillStyle = i % 2 ? '#9eaf80' : '#d8c596'; ctx.fillRect(Math.round(x), Math.round(y), 3, 2);
      }
    }
    ctx.restore();
  }
}
