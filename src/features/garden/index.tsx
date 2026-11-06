import {useEffect, useId, useRef, useState, type ReactNode, type KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {Line, Word} from '../../contracts';
import WordToken from '../../WordToken';
import GardenScene from './GardenScene';
import {label, line} from './content';
import {gifts, plantIds, recoveryForTransition, reduce, weather, siteIds, type Action, type PlantId, type Site, type State} from './rules';
import './garden.css';

export type GardenProps = {
  presentation?: 'scene' | 'controls'; plantId?: PlantId;
  state: State; day: number; onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void; onPlay: (line: Line) => void;
  recoveredWordIds?: readonly string[]; freshWordIds?: readonly string[];
};
function Icon({kind}: {kind: 'water' | 'wait' | 'move' | 'shade' | 'look' | 'tidy' | 'cancel' | 'listen'}) {
  const shapes: Record<typeof kind, ReactNode> = {
    water: <><path d="M12 3C9 8 5 11 5 15a7 7 0 0 0 14 0c0-4-4-7-7-12Z"/><path d="M8 15c0 2 1 3 3 3"/></>,
    wait: <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>,
    move: <><path d="M4 12h16M12 4v16m-8-8 3-3m-3 3 3 3m13-3-3-3m3 3-3 3M12 4 9 7m3-3 3 3m-3 13-3-3m3 3 3-3"/></>,
    shade: <><path d="M3 11c1-9 17-9 18 0Zm9 0v9m-4 0h8"/></>,
    look: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    tidy: <><path d="M5 7h14v13H5ZM3 4h18v3H3Zm9 3v13M8 11h1m6 0h1"/></>,
    cancel: <path d="m6 6 12 12M18 6 6 18"/>,
    listen: <><path d="M4 9h4l5-4v14l-5-4H4Z"/><path d="M17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[kind]}</svg>;
}

export default function Garden(props: GardenProps) {
  const {state, day, onAction, onRecover, onLookup, onPlay, presentation = 'scene', plantId, recoveredWordIds = [], freshWordIds = []} = props;
  const [selected, setSelected] = useState<PlantId>(plantId ?? 'flower');
  const [moving, setMoving] = useState<'pot' | 'shade' | null>(null);
  const [confirm, setConfirm] = useState<PlantId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {if (plantId) {setSelected(plantId); setNotice(null); setConfirm(null); setMoving(null);}}, [plantId]);
  const pending = useRef<{before: State; expected: State; action: Action; notice: string | null} | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const waterButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const heading = useId();
  const ready = state.day === day;
  const pot = state.plants[selected];
  const recovered = new Set(recoveredWordIds), fresh = new Set(freshWordIds);
  const text = (value: Pick<Line, 'id' | 'tokens'>, punctuation = false) => value.tokens.map((word, index) => {
    const token = <WordToken key={`${word.id}-${index}`} word={word}
      look={fresh.has(word.id) ? 'dot' : value.id.startsWith('garden.label-') || recovered.has(word.id) ? 'plain' : 'fogged'} onLookup={onLookup}/>;
    return punctuation && index === value.tokens.length - 1 ? <span className="garden-final-token" key={`${word.id}-${index}`}>{token}。</span> : token;
  });
  const name = (id: string) => label(id).tokens.map(word => word.hanzi).join('');
  useEffect(() => {if (!ready) onAction({type: 'sync'});}, [day, ready, onAction]);
  useEffect(() => {setNotice(null); setConfirm(null); setMoving(null);}, [day]);
  useEffect(() => {
    const transition = pending.current;
    if (!transition || JSON.stringify(state) !== JSON.stringify(transition.expected)) return;
    pending.current = null;
    const ids = recoveryForTransition(transition.before, state, transition.action);
    if (ids.length) onRecover(ids);
    setNotice(transition.notice);
  }, [state, onRecover]);
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {if (event.key === 'Escape') setMoving(null);};
    document.addEventListener('keydown', cancel);
    return () => document.removeEventListener('keydown', cancel);
  }, []);
  const wasConfirm = useRef(false);
  useEffect(() => {
    if (confirm) cancelButton.current?.focus();
    else if (wasConfirm.current) waterButton.current?.focus();
    wasConfirm.current = Boolean(confirm);
  }, [confirm]);

  const act = (action: Action, message: string | null = null) => {
    const expected = reduce(state, action, day);
    if (expected === state) return;
    pending.current = {before: state, expected, action, notice: message};
    onAction(action);
  };
  const choose = (id: PlantId) => {setSelected(id); setNotice(null); if (moving !== 'shade') setMoving(null);};
  const place = (site: Site) => {
    if (moving === 'shade') {act({type: 'shade', site}, 'shade-advice'); setMoving(null); return;}
    const occupant = plantIds.find(id => state.plants[id].site === site);
    if (moving === 'pot' && !occupant) {act({type: 'move', plant: selected, site}, 'select-help'); setMoving(null); return;}
    if (occupant && !moving) choose(occupant);
  };
  const speak = notice ?? (moving === 'shade' ? 'shade-help' : moving === 'pot' ? 'select-help' : pot.result && !pot.result.observed ?
    pot.result.outcome === 'grew' ? (state.plants.flower.growth === 3 && state.plants.tree.growth === 3 ? 'mature-result' : 'growth-result') : pot.result.outcome === 'drooped' ? 'extra-result' : pot.result.outcome === 'shade' ? 'shade-result' : 'rest-result' :
    weather(state.day) === 'rain' && pot.care === 'ready' && pot.site !== state.shade ? 'rain-advice' : pot.care === 'extra' ? 'extra-result' : pot.care === 'ready' ? 'wet-warning' : 'dry-advice');
  const playback = useRef(onPlay);
  playback.current = onPlay;
  useEffect(() => {if (state.restored) playback.current(line(speak));}, [speak, state.restored]);
  const tool = (id: string, icon: Parameters<typeof Icon>[0]['kind'], click: () => void, disabled = false, pressed?: boolean) =>
    <div className="garden-tool" key={id}>
      <button type="button" aria-label={name(id)} onClick={click} disabled={disabled || !ready} aria-pressed={pressed} autoFocus={id === 'keep-waiting'}
        ref={id === 'water-verb' ? waterButton : id === 'keep-waiting' ? cancelButton : undefined} className="garden-tool-button"><Icon kind={icon}/></button>
      <span className="garden-tool-label">{text(label(id))}</span>
    </div>;
  const closeConfirmation = () => setConfirm(null);
  const containConfirmation = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); closeConfirmation(); return;}
    if (event.key !== 'Tab') return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last?.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first?.focus();}
  };
  return <section className="garden" aria-labelledby={heading} data-testid="garden-view" data-selected-plant={selected} data-presentation={presentation}>
    <div className="garden-body" inert={Boolean(confirm)}>
    <header className="garden-heading">
      <h1 id={heading}>{text(label('roof'))}{text(label('garden'))}</h1>
      <span className="garden-weather" data-weather={weather(state.day)}>{text(label(weather(state.day) === 'rain' ? 'rain' : weather(state.day) === 'hot' ? 'hot' : 'clear'))}</span>
    </header>
    {presentation === 'scene' && <GardenScene state={state} selected={moving === 'shade' ? null : selected} movingShade={moving === 'shade'} onSite={place}/>}
    {!state.restored ? <div className="garden-arrival">
      {tool('tidy', 'tidy', () => act({type: 'tidy', value: true}))}
      <p>{text(label('crates'))}{text(label('put'))}{text(label('place'))}</p>
    </div> : <>
      {!plantId && <div className="garden-pots" aria-label={name('pot')}>
        {plantIds.map(id => <div key={id} className={`garden-pot-card${id === selected && moving !== 'shade' ? ' active' : ''}`}>
          <button type="button" className="garden-pot-select" aria-label={`${name('select')}${name(id)}`} aria-pressed={selected === id && moving !== 'shade'} onClick={() => choose(id)}>
            <span className={`garden-sprig ${id}`} aria-hidden="true"><i/><i/><i/></span>
            <span className="garden-stages" aria-hidden="true">{[1, 2, 3].map(stage => <i key={stage} data-grown={state.plants[id].growth >= stage}/>)}</span>
          </button>
          <div className="garden-pot-name">{text(label(id))}</div>
        </div>)}
      </div>}
      <div className="garden-workbench">
        <div className="garden-selection">
          <strong>{text(label(selected))}</strong>
          <span>{text(label(pot.care === 'dry' ? 'dry' : pot.care === 'extra' ? 'pooled' : 'wet'))}{pot.drooping && text(label('drooping'))}</span>
          {pot.result && <div className="garden-comparison" data-testid="garden-comparison">
            <span>{text(label('before'))}<i aria-label={`${pot.result.before}`} data-growth={pot.result.before}/></span>
            <span aria-hidden="true">→</span>
            <span>{text(label('now'))}<i aria-label={`${pot.result.after}`} data-growth={pot.result.after}/></span>
          </div>}
        </div>
        <div className="garden-tools">
          {tool('water-verb', 'water', () => pot.care === 'ready' ? setConfirm(selected) : act({type: 'water', plant: selected}, 'wet-warning'), pot.care === 'extra')}
          {tool('wait', 'wait', () => act({type: 'wait', plant: selected}, 'wait-help'), pot.care === 'extra' || pot.waited)}
          {tool('move', 'move', () => {setMoving(moving === 'pot' ? null : 'pot'); setNotice(null);}, false, moving === 'pot')}
          {tool('shade-screen', 'shade', () => {setMoving(moving === 'shade' ? null : 'shade'); setNotice(null);}, false, moving === 'shade')}
          {pot.result && tool('observe', 'look', () => act({type: 'observe', plant: selected}, speak), pot.result.observed)}
          {moving && tool('cancel', 'cancel', () => setMoving(null))}
        </div>
      </div>
      {presentation === 'controls' && moving && <div className="garden-placement-choices" role="group" aria-label={name('place')}>
        {siteIds.map(site => <button type="button" key={site} aria-label={`${site + 1}${name('place')}`}
          disabled={moving === 'pot' && plantIds.some(id => state.plants[id].site === site)}
          aria-pressed={moving === 'shade' ? state.shade === site : state.plants[selected].site === site}
          onClick={() => place(site)}>{site + 1}</button>)}
      </div>}
      <div className="garden-conversation" aria-live="polite">
        <div className="garden-speaker">{text(label('lin'))}<button type="button" aria-label={name('listen')} className="garden-replay" onClick={() => onPlay(line(speak))}><Icon kind="listen"/></button></div>
        <p className="garden-spoken" data-testid="garden-dialogue">{text(line(speak), true)}</p>
      </div>
      <footer className="garden-footer">
        <p>{text(line('day-help'))}</p>
        {gifts(state).length > 0 && <p className="garden-gift">{text(label('planter'))} · {text(label('home'))}</p>}
        {tool('return', 'tidy', () => act({type: 'tidy', value: false}))}
      </footer>
    </>}
    </div>
    {confirm && <div className="garden-confirm-backdrop"><div ref={dialog} role="dialog" aria-modal="true" className="garden-confirm" data-testid="garden-confirm" aria-labelledby={`${heading}-warning`} onKeyDown={containConfirmation}>
      <h2 id={`${heading}-warning`}>{text(line('wet-warning'))}</h2>
      <p>{text(line('extra-result'))}</p>
      <div className="garden-confirm-actions">
        {tool('keep-waiting', 'wait', closeConfirmation)}
        {tool('anyway', 'water', () => {act({type: 'water-extra', plant: confirm}, 'extra-result'); closeConfirmation();})}
      </div>
    </div></div>}
  </section>;
}
