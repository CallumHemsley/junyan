import { useEffect, useRef } from 'react';
import { createRenderer } from '../../scene/renderer.js';
import { workshopScene } from './scene';
import { speakerFor } from './content';
import type { State } from './rules';

export default function RepairScene({ state }: { state: State }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(state);
  const invalidate = useRef(() => {});
  useEffect(() => { current.current = state; invalidate.current(); }, [state]);
  useEffect(() => {
    if (!canvas.current) return;
    const renderer = createRenderer(canvas.current, workshopScene);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, lastDraw = -Infinity, dirty = true, inViewport = true;
    const schedule = () => {
      if (!frame && !document.hidden && inViewport && (dirty || !preference.matches)) frame = requestAnimationFrame(draw);
    };
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden || !inViewport) return;
      if (dirty || now - lastDraw >= 1000 / 20) {
        renderer.draw(current.current, preference.matches ? 0 : now / 1000);
        lastDraw = now; dirty = false;
      }
      schedule();
    };
    const refresh = () => {
      dirty = true;
      cancelAnimationFrame(frame); frame = 0;
      schedule();
    };
    const observer = new IntersectionObserver(entries => { inViewport = entries[0].isIntersecting; refresh(); });
    observer.observe(canvas.current);
    preference.addEventListener('change', refresh);
    document.addEventListener('visibilitychange', refresh);
    invalidate.current = refresh;
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener('change', refresh);
      document.removeEventListener('visibilitychange', refresh);
      invalidate.current = () => {};
    };
  }, []);
  return <canvas data-speaker={speakerFor(state.feedback).name} ref={canvas} width={360} height={280} aria-hidden="true" />;
}
