import {useEffect, useRef} from 'react';
import {createRenderer, projectPosition} from '../../scene/renderer.js';
import {gardenScene, sites} from './scene';
import {type PlantId, type Site, type State, plantIds, siteIds} from './rules';
import {label} from './content';

export default function GardenScene({state, selected, movingShade, onSite}: {
  state: State; selected: PlantId | null; movingShade: boolean; onSite: (site: Site) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(state);
  const redraw = useRef(() => {});
  useEffect(() => {current.current = state; redraw.current();}, [state]);
  useEffect(() => {
    if (!canvas.current) return;
    const renderer = createRenderer(canvas.current, gardenScene());
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = -Infinity;
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      if (now - last >= 100) {renderer.draw(current.current, motion.matches ? 0 : now / 1000); last = now;}
      if (!motion.matches) frame = requestAnimationFrame(draw);
    };
    const refresh = () => {
      cancelAnimationFrame(frame); frame = 0; last = -Infinity;
      if (!document.hidden) frame = requestAnimationFrame(draw);
    };
    redraw.current = refresh;
    motion.addEventListener('change', refresh);
    document.addEventListener('visibilitychange', refresh);
    refresh();
    return () => {
      cancelAnimationFrame(frame); redraw.current = () => {};
      motion.removeEventListener('change', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const numbers = ['one', 'two', 'three', 'four', 'five', 'six'];
  return <div className="garden-scene" data-testid="garden-scene">
    <canvas ref={canvas} width={360} height={280} aria-hidden="true" />
    {state.restored && siteIds.map(site => {
      const pot = plantIds.find(id => state.plants[id].site === site);
      const point = sites[site];
      const position = projectPosition({x: point.x + 6, y: point.y + 5}, .15);
      const chosen = movingShade ? state.shade === site : pot === selected;
      return <button type="button" key={site} className={`garden-site${chosen ? ' selected' : ''}${pot ? ' occupied' : ''}`}
        style={{left: `${position.left}%`, top: `${position.top}%`}}
        aria-label={`${label(numbers[site]).tokens[0].hanzi}${label(pot ?? 'empty').tokens[0].hanzi}`}
        aria-pressed={chosen} onClick={() => onSite(site)} data-testid={`garden-site-${site}`}>

      </button>;
    })}
  </div>;
}
