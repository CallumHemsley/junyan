import {describe, expect, it} from 'vitest';
import {drawMap, renderObjects} from './index';
import {rooftopForGarden} from '../../maps/rooftop';
import {worldMapSchema} from '../../schema';
import {initialState} from '../../../features/garden/rules';
import type {WorldRenderView} from '../../render-contract';
const view: WorldRenderView = {project: p => p, elapsedMs: 0, reducedMotion: true, playerPosition: {x: 35, y: 29.5}, width: 960, height: 600, pass: 'objects'};

describe('rooftop shared compositor adapter', () => {
  it('provides one depth entry per object and leaves the whole objects pass empty', () => {
    const map = worldMapSchema.parse(rooftopForGarden(initialState()));
    const objects = renderObjects(map, view);
    expect(objects.map(o => o.id).sort()).toEqual(map.props.filter(p => p.layer === 'object').map(p => p.id).sort());
    expect(new Set(objects.map(o => o.id)).size).toBe(objects.length);
    expect(objects.every(o => Number.isFinite(o.depth))).toBe(true);
    expect(objects.find(o => o.id === 'rooftop.pergola')?.occlusion?.fadeWhenPlayerBehind).toBe(true);
    expect(objects.find(o => o.id === 'rooftop.stairhead')?.occlusion?.fadeWhenPlayerBehind).toBe(true);
    const untouched = new Proxy({} as CanvasRenderingContext2D, {get: () => {throw new Error('Objects pass must be drawn only through depth entries');}});
    drawMap(untouched, map, view);
  });

  it('does not paint other owners maps when the foundation calls every art module', () => {
    const map = {...worldMapSchema.parse(rooftopForGarden(initialState())), id: 'restaurant'};
    expect(renderObjects(map, view)).toEqual([]);
    const untouched = new Proxy({} as CanvasRenderingContext2D, {get: () => {throw new Error('Rooftop art painted another map');}});
    for (const pass of ['ground', 'objects', 'foreground'] as const) drawMap(untouched, map, {...view, pass});
  });
});
