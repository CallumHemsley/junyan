import { expect, it } from 'vitest';
import { drawLowerCrossing } from './index';
import { drawLandscapeProp } from './draw';
import { worldMaps } from '../../registry';
import type { WorldRenderView } from '../../render-contract';

function recordingContext() {
  const draws: { color: string; clips: number }[] = [];
  const clips: { x: number; y: number }[][] = [];
  let path: { x: number; y: number }[] = [], activeClips = 0;
  const stack: { alpha: number; clips: number; color: string }[] = [];
  const context = {
    globalAlpha: .45, fillStyle: '',
    save() { stack.push({ alpha: this.globalAlpha, clips: activeClips, color: this.fillStyle }); },
    restore() { const state = stack.pop()!; this.globalAlpha = state.alpha; activeClips = state.clips; this.fillStyle = state.color; },
    beginPath() { path = []; },
    moveTo(x: number, y: number) { path.push({ x, y }); },
    lineTo(x: number, y: number) { path.push({ x, y }); },
    closePath() {},
    clip() { clips.push([...path]); activeClips++; },
    fill() { draws.push({ color: this.fillStyle, clips: activeClips }); },
    fillRect() { draws.push({ color: this.fillStyle, clips: activeClips }); },
    translate() {}, scale() {},
  };
  return { context: context as unknown as CanvasRenderingContext2D, draws, clips, stack };
}

it('clips every timber mark to the real lower deck and shades original materials once', () => {
  const { context, draws, clips, stack } = recordingContext(), inputs: string[] = [];
  const map = worldMaps.riverbank, before = JSON.stringify(map);
  const view: WorldRenderView = {
    project: (p) => ({ x: 720 + (p.x - p.y) * 15, y: (p.x + p.y) * 7.5 - 400 }),
    shadeColor: base => { inputs.push(String(base)); return '#010203'; },
    width: 1440, height: 1000, playerPosition: { x: 45, y: 57 }, elapsedMs: 12000, reducedMotion: true, pass: 'ground',
  };
  drawLowerCrossing(context, map, view);
  const r = map.terrain.find(t => t.id === 'riverbank.low-footbridge')!.rect;
  expect(clips).toEqual([[{ x: r.x, y: r.y }, { x: r.x + r.width, y: r.y }, { x: r.x + r.width, y: r.y + r.height }, { x: r.x, y: r.y + r.height }].map(p => view.project(p))]);
  expect(draws.length).toBeGreaterThan(100);
  expect(draws.every(draw => draw.clips === 1 && draw.color === '#010203')).toBe(true);
  expect(inputs.every(color => color !== '#010203')).toBe(true);
  expect(context.globalAlpha).toBe(.45);
  expect(stack).toHaveLength(0);
  expect(JSON.stringify(map)).toBe(before);
});

it('keeps landmark construction inside the shared shading and alpha contract', () => {
  for (const kind of ['laundry', 'boat', 'mooring', 'tied-rope']) {
    const { context, draws, stack } = recordingContext();
    const prop = worldMaps.riverbank.props.find(prop => prop.kind === kind)!;
    expect(drawLandscapeProp(context, prop, (x, y) => ({ x, y }), 18, 0, true, () => '#010203')).toBe(true);
    expect(draws.length).toBeGreaterThan(5);
    expect(draws.every(draw => draw.color === '#010203')).toBe(true);
    expect(context.globalAlpha).toBe(.45);
    expect(stack).toHaveLength(0);
  }
});

it('does not repaint other maps with lower-crossing timber', () => {
  const { context, draws } = recordingContext();
  drawLowerCrossing(context, worldMaps.park, {} as WorldRenderView);
  expect(draws).toHaveLength(0);
});
