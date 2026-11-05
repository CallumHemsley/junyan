import { useEffect, useRef } from 'react';
import { createRenderer, projectPosition } from '../../scene/renderer.js';
import { courtyardScene, whitePosition, visualPose } from './scene';
import type { State, Target } from './rules';
import { lineFor } from './content';

export default function Courtyard({ state, day, onSelect }: { state: State; day: number; onSelect: (target: Target) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef({ state, day });
  const invalidate = useRef(() => {});
  useEffect(() => { current.current = { state, day }; invalidate.current(); }, [state, day]);
  useEffect(() => {
    let stop = () => {};
    const pending = requestAnimationFrame(() => {
      if (!canvas.current) return;
      const renderer = createRenderer(canvas.current, courtyardScene);
      const preference = matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0, lastDraw = -Infinity, dirty = true, visible = true;
      let pose = visualPose(current.current.state, current.current.day);
      const draw = (now: number) => {
        frame = 0;
        if (document.hidden || !visible) return;
        if (dirty || now - lastDraw >= 1000 / 20) {
          const target = visualPose(current.current.state, current.current.day);
          const blend = preference.matches ? 1 : .24;
          const point = (from: typeof target.white, to: typeof target.white) => ({ x: from.x + (to.x - from.x) * blend, y: from.y + (to.y - from.y) * blend });
          pose = { white: point(pose.white, target.white), player: point(pose.player, target.player), sitting: target.sitting };
          renderer.draw(current.current.state, current.current.day, preference.matches ? 0 : now / 1000, pose);
          lastDraw = now; dirty = false;
        }
        if (!preference.matches) frame = requestAnimationFrame(draw);
      };
      const refresh = () => {
        dirty = true;
        cancelAnimationFrame(frame); frame = 0;
        if (!document.hidden && visible) frame = requestAnimationFrame(draw);
      };
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh(); });
      observer.observe(canvas.current);
      preference.addEventListener('change', refresh);
      document.addEventListener('visibilitychange', refresh);
      invalidate.current = refresh;
      refresh();
      stop = () => {
        cancelAnimationFrame(frame); observer.disconnect();
        preference.removeEventListener('change', refresh);
        document.removeEventListener('visibilitychange', refresh);
        invalidate.current = () => {};
      };
    });
    return () => { cancelAnimationFrame(pending); stop(); };
  }, []);
  const cats = [{ id: 'white' as const, position: whitePosition(state, day) }, { id: 'black' as const, position: { x: 9.35, y: 5.42 } }];
  return <div className="cats-scene" data-testid="cats-scene">
    <canvas ref={canvas} width="360" height="280" aria-hidden="true" />
    {cats.map(cat => {
      const p = projectPosition(cat.position, -.5);
      return <button key={cat.id} type="button" className="cats-target"
        style={{ left: `${p.left + (cat.id === 'white' ? -14 : 12)}%`, top: `${p.top + 8}%` }}
        aria-pressed={state.selected === cat.id} onClick={() => onSelect(cat.id)}
        data-testid={`cats-${cat.id}`}>{lineFor(`label-${cat.id}`).text}</button>;
    })}
  </div>;
}
