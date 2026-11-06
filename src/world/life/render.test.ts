import { expect, it } from 'vitest';
import { drawLifeActor, drawLifeReactions } from './render';
import { initialLifeState } from './interactions';
import type { ActorPose } from './model';

function surface(alpha: number) {
  const drawn: { color: string; alpha: number }[] = [];
  const stack: { globalAlpha: number; fillStyle: string; strokeStyle: string }[] = [];
  const state = {
    globalAlpha: alpha, fillStyle: '', strokeStyle: '', lineWidth: 1,
    save() { stack.push({ globalAlpha: this.globalAlpha, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle }); },
    restore() { Object.assign(this, stack.pop()); },
    fillRect() { drawn.push({ color: this.fillStyle, alpha: this.globalAlpha }); },
    stroke() { drawn.push({ color: this.strokeStyle, alpha: this.globalAlpha }); },
    translate() {}, scale() {}, beginPath() {}, ellipse() {},
  };
  return { ctx: state as unknown as CanvasRenderingContext2D, drawn };
}
it('shades cat and bird materials explicitly and preserves inherited occlusion alpha', () => {
  for (const kind of ['cat', 'bird'] as const) {
    const { ctx, drawn } = surface(.45);
    const bases: unknown[] = [];
    const actor: ActorPose = { id: 'life.actor', characterId: kind === 'cat' ? 'white-cat' : 'bird', kind, position: { x: 2, y: 2 }, facing: 'south', action: 'idle', activity: 'sit', phaseMs: 100, radius: .16 };
    drawLifeActor(ctx, actor, { playerPosition: { x: 0, y: 0 }, width: 200, height: 100, pass: 'objects', project: point => point, elapsedMs: 100, reducedMotion: true, shadeColor: base => { bases.push(base); return '#010203'; } }, () => { throw Error('Wildlife must not use a human renderer'); });
    expect(drawn.length).toBeGreaterThan(5);
    expect(drawn.every(item => item.color === '#010203')).toBe(true);
    expect(drawn.every(item => item.alpha <= .45)).toBe(true);
    expect(bases.every(base => typeof base === 'string' && /^#[a-f0-9]{6}$/i.test(base))).toBe(true);
    expect(ctx.globalAlpha).toBe(.45);
  }
});
it('shades non-emissive reaction strokes without replacing inherited alpha', () => {
  const { ctx, drawn } = surface(.45);
  const state = { ...initialLifeState(), reactions: [{ mapId: 'riverbank', targetId: 'jetty', reaction: 'ripple' as const, atMs: 0 }] };
  drawLifeReactions(ctx, state, 'riverbank', [{ id: 'jetty', position: { x: 3, y: 3 } }], { playerPosition: { x: 0, y: 0 }, width: 200, height: 100, pass: 'objects', project: point => point, elapsedMs: 900, reducedMotion: false, shadeColor: () => '#010203' });
  expect(drawn).toHaveLength(3);
  expect(drawn.every(item => item.color === '#010203' && item.alpha === .225)).toBe(true);
  expect(ctx.globalAlpha).toBe(.45);
});
