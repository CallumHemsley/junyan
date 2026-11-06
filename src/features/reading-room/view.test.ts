import { expect, it } from 'vitest';
import { frameCamera, presentationArea, project } from '../../world/camera';
import { readingRoomMap } from '../../world/maps/reading-room';
import { readingWindowFrame } from '../../world/art/reading-room/window-geometry';
import { legal } from './rules';
import { placementRect } from './world';
import { readingRoomFrame } from './view';

it('keeps each whole usable floor, furniture height and authored window inside the actual visible scene', () => {
  const layouts = [
    { canvas: { x: 0, y: 68, width: 390, height: 772 }, main: { x: 0, y: 68, width: 390, height: 772 }, panel: { x: 16, y: 430, width: 358, height: 334 }, screen: { width: 390, height: 844 } },
    { canvas: { x: 0, y: 68, width: 390, height: 772 }, main: { x: 0, y: 68, width: 390, height: 544 }, panel: { x: 16, y: 200, width: 358, height: 336 }, screen: { width: 390, height: 844 } },
    { canvas: { x: 0, y: 76, width: 1440, height: 924 }, main: { x: 0, y: 76, width: 1440, height: 924 }, panel: { x: 944, y: 524, width: 480, height: 400 }, screen: { width: 1440, height: 1000 } },
  ];
  for (const brief of ['window', 'alcove'] as const) for (const layout of layouts) {
    const frame = readingRoomFrame({ brief, selected: null, draft: null });
    const width = layout.canvas.width / 2, height = layout.canvas.height / 2;
    const area = presentationArea(layout.canvas, layout.main, layout.panel, layout.screen);
    const camera = frameCamera(frame, width, height, area, width < 300 ? 11 : 15);
    const visible = (p: { x: number; y: number; z: number }) => {
      const screen = project(p, camera, p.z);
      expect(screen.x).toBeGreaterThanOrEqual(area.x * width + 11.99);
      expect(screen.x).toBeLessThanOrEqual((area.x + area.width) * width - 11.99);
      expect(screen.y).toBeGreaterThanOrEqual(area.y * height + 11.99);
      expect(screen.y).toBeLessThanOrEqual((area.y + area.height) * height - 11.99);
    };
    // Check every legal full furniture footprint, not just the preview's centre pixel.
    for (const id of ['table', 'chair'] as const) for (const rotation of [0, 1] as const) for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
      const placement = { id, rotation, x, y };
      if (!legal(brief, [], placement)) continue;
      const r = placementRect(placement, brief);
      for (const x of [r.x, r.x + r.width]) for (const y of [r.y, r.y + r.height]) for (const z of [0, 1.25]) visible({ x, y, z });
    }
    const window = readingRoomMap.props.find(p => p.id === `reading-room.${brief === 'window' ? 'broad' : 'alcove'}-window`)!;
    for (const x of [window.position.x - readingWindowFrame.overhang, window.position.x + window.width + readingWindowFrame.overhang]) {
      visible({ x, y: window.position.y + readingWindowFrame.overhang, z: readingWindowFrame.bottom + readingWindowFrame.height });
    }
  }
});

it('includes an outlying selected ghost without altering project state', () => {
  const state = { brief: 'alcove' as const, selected: 'table' as const, draft: { x: 5, y: 4, rotation: 1 as const } };
  const before = structuredClone(state), rect = placementRect({ id: state.selected, ...state.draft }, state.brief);
  const frame = readingRoomFrame(state);
  expect(frame).toContainEqual({ x: rect.x + rect.width, y: rect.y + rect.height, z: 1.25 });
  expect(state).toEqual(before);
});
