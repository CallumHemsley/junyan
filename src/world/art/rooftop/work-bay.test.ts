import {describe, expect, it} from 'vitest';
import {drawMap, renderObjects} from './index';
import {rooftopMap} from '../../maps/rooftop';
import {worldMapSchema} from '../../schema';
import {sampleDayLight} from '../../atmosphere';
import type {WorldRenderView} from '../../render-contract';

function capture(pass: 'ground' | 'objects', elapsedMs = 0, reducedMotion = true) {
  const map = worldMapSchema.parse({...rooftopMap, terrain: [], props: rooftopMap.props.filter(p => p.kind === 'potting-tray')});
  const before = JSON.stringify(map), fills: {color: string; alpha: number; points: {x: number; y: number}[]}[] = [];
  const stack: {alpha: number; color: string}[] = []; let points: {x: number; y: number}[] = [];
  let maxHeight = 0;
  const ctx = {
    globalAlpha: .4, fillStyle: '', strokeStyle: '', lineWidth: 1, imageSmoothingEnabled: false,
    save() {stack.push({alpha: this.globalAlpha, color: this.fillStyle});},
    restore() {const prior = stack.pop()!; this.globalAlpha = prior.alpha; this.fillStyle = prior.color;},
    beginPath() {points = [];}, moveTo(x: number, y: number) {points.push({x, y});}, lineTo(x: number, y: number) {points.push({x, y});},
    closePath() {}, clip() {}, stroke() {}, fillRect() {},
    fill() {fills.push({color: this.fillStyle, alpha: this.globalAlpha, points: [...points]});},
  };
  const view: WorldRenderView = {project: (p, z = 0) => {maxHeight = Math.max(maxHeight, z); return {x: p.x * 100, y: (p.y - z) * 100};},
    shadeColor: color => {expect(String(color)).not.toContain('shaded:'); return `shaded:${color}`;},
    playerPosition: {x: 20, y: 18.2}, width: 720, height: 458, elapsedMs, reducedMotion, pass,
    castLight: {...sampleDayLight('morning'), shadowOffset: [0, 1]},
  };
  const objects = renderObjects(map, view);
  if (pass === 'ground') drawMap(ctx as unknown as CanvasRenderingContext2D, map, view);
  else objects[0].draw(ctx as unknown as CanvasRenderingContext2D, view);
  expect(JSON.stringify(map)).toBe(before);
  expect(ctx.globalAlpha).toBe(.4); expect(stack).toHaveLength(0);
  return {map, objects, fills, maxHeight};
}

describe('supported rooftop potting trolley', () => {
  it('keeps the actual handle height inside its fade extent and retains the original footprint and depth', () => {
    const {map, objects, fills, maxHeight} = capture('objects');
    const prop = map.props[0], object = objects[0];
    expect(maxHeight).toBe(1.85);
    expect(object.occlusion).toEqual({rect: {...prop.position, width: prop.width, height: prop.height}, height: maxHeight, fadeWhenPlayerBehind: true});
    expect(object.depth).toBe(prop.position.x + prop.position.y + (prop.width + prop.height) / 2);
    expect(fills.every(p => p.color.startsWith('shaded:') && p.alpha === .4)).toBe(true);
  });
  it('casts the real handle, tabletop and feet once, with attached contact below the object', () => {
    const {map, fills} = capture('ground');
    const casts = fills.filter(p => p.color.startsWith('rgb('));
    expect(casts).toHaveLength(1);
    expect(casts[0].alpha).toBeCloseTo(.4 * sampleDayLight('morning').shadowOpacity);
    expect(casts[0].points.some(p => p.y === Math.round((map.props[0].position.y + .215 + 1.85 - .02) * 100))).toBe(true);
    expect(Math.max(...casts[0].points.map(p => p.y))).toBe(Math.round((map.props[0].position.y + .51 + 1.61 - .02) * 100));
    const contacts = fills.filter(p => Math.abs(p.alpha - .4 * .34) < .000001);
    expect(contacts).toHaveLength(4);
    expect(contacts.every(p => p.color.startsWith('shaded:'))).toBe(true);
  });
  it('holds the trolley shape and receiving surfaces still in both motion settings', () => {
    for (const pass of ['ground', 'objects'] as const) expect(capture(pass, 94000, false).fills).toEqual(capture(pass).fills);
  });
});
