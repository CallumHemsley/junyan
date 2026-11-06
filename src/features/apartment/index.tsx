import { useEffect, useRef, useState } from 'react';
import type { Line, Word } from '../../contracts';
import WordLine from '../../WordLine';
import { lineById } from './content';
import { featureUi } from '../copy';
import { cells, dailyFinds, legal, protectedCell, recoveryForTransition, reduce, type Action, type ItemId, type State } from './rules';
import Scene from './Scene';
import './style.css';
const copy = featureUi.apartment;

export type Props = {
  sceneMode?: 'room' | 'world';
  state: State; day: number; onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void; onPlay: (line: Line) => void;
  recoveredWordIds?: readonly string[]; freshWordIds?: readonly string[];
};
export const itemNames = copy.items;
export default function Apartment({ sceneMode = 'room', state, day, onAction, onLookup, onRecover, onPlay, recoveredWordIds = [], freshWordIds = [] }: Props) {
  const [showGrid,setShowGrid]=useState(sceneMode === 'world');
  const itemButtons=useRef(new Map<ItemId,HTMLButtonElement>());
  const welcome=useRef({play:onPlay,line:lineById[state.notice]});
  useEffect(()=>{welcome.current.play(welcome.current.line);},[]);
  const line = lineById[state.notice];
  const draft = state.selected && state.draft ? { id: state.selected, ...state.draft } : null;
  const valid = draft ? legal(state, draft) : false;
  function act(action: Action) {
    const next = reduce(state, action, day);
    onAction(action);
    if (state.selected && !next.selected) { const id=state.selected; requestAnimationFrame(()=>itemButtons.current.get(id)?.focus()); }
    if(next !== state) onPlay(lineById[next.notice]);
    const recovered = recoveryForTransition(state, action, next);
    if (recovered.length) onRecover(recovered);
  }
  function confirm() { act({type:'place'}); }

  return <section className="apartment" aria-label={copy.title}>
    <header className="apartment-heading"><h1>{copy.title}</h1><span>{copy.resident}</span><button type="button" disabled={!state.undo} onClick={() => act({ type: 'undo' })}>{copy.undo}</button></header>
    {sceneMode === 'room' && <Scene state={state} onPreview={(x,y)=>act({type:'preview',x,y})} onConfirm={confirm}/>}
    {draft && <section className="apartment-editor" aria-label={copy.editor}><div className="apartment-tools"><span>{itemNames[draft.id]}</span><button type="button" onClick={() => act({ type: 'rotate' })}>{copy.rotate}</button><button type="button" onClick={confirm}>{copy.place}</button><button type="button" onClick={() => act({ type: 'store' })}>{copy.store}</button><button type="button" onClick={() => act({ type: 'cancel' })}>{copy.cancel}</button><button type="button" aria-expanded={showGrid} onClick={()=>setShowGrid(!showGrid)}>{copy.grid}</button></div>
      {showGrid && <div className="apartment-floor-grid" role="group" aria-label={copy.floor}>{Array.from({ length: 30 }, (_, i) => {
        const x = i % 6, y = Math.floor(i / 6);
        const occupied = state.placements.find(p => p.id !== draft.id && cells(p,state.rugSize).some(c => c.x === x && c.y === y));
        const highlighted = cells(draft,state.rugSize).some(c => c.x === x && c.y === y);
        return <button type="button" key={i} className={`${highlighted ? 'preview ' : ''}${highlighted && !valid ? 'blocked' : ''}`} aria-label={copy.cell(x, y, protectedCell(x,y), occupied ? itemNames[occupied.id] : undefined)} aria-pressed={draft.x === x && draft.y === y} onClick={() => act({ type: 'preview', x, y })}>{protectedCell(x,y) ? copy.path : occupied ? itemNames[occupied.id] : <span aria-hidden="true">·</span>}</button>;
      })}</div>}
    </section>}
    <div className="apartment-speech" aria-live="polite"><div className="apartment-line"><WordLine line={line} look={word => freshWordIds.includes(word.id) ? 'dot' : recoveredWordIds.includes(word.id) ? 'plain' : 'fogged'} onLookup={onLookup} /><span>{featureUi.sentenceEnd}</span></div><button type="button" aria-label={copy.replayLabel} onClick={() => onPlay(line)}>{copy.replay}</button></div>
    {!state.starterClaimed && <div className="apartment-delivery"><div className="apartment-parcel" aria-hidden="true"/><span>{copy.starter}</span><button type="button" onClick={() => act({ type: 'accept-starter' })}>{copy.accept}</button><button type="button" onClick={() => onPlay(lineById.welcome)}>{copy.preview}</button></div>}
    {state.owned.length>1 && <section className="apartment-inventory" aria-label={copy.inventory}><h2>{copy.inventory}</h2><div className="apartment-items">{state.owned.filter(id => id !== 'bed').map(id => <button type="button" key={id} ref={node=>{if(node) itemButtons.current.set(id,node);else itemButtons.current.delete(id);}} aria-pressed={state.selected === id} onClick={() => act({ type: 'select', id })}><span>{itemNames[id]}</span><span className="apartment-item-position">{state.placements.some(p => p.id === id) ? copy.placed : copy.stored}</span></button>)}</div></section>}
    {state.starterClaimed && <section className="apartment-options" aria-label={copy.options}><div role="group" aria-label={copy.cushionColour}><span>{copy.cushion}</span>{(['blue','cream'] as const).map(colour => <button type="button" key={colour} aria-pressed={state.colour === colour} onClick={() => act({ type: 'choose-colour', colour })}><i className={`apartment-swatch ${colour}`} aria-hidden="true"/>{copy.colours[colour]}</button>)}</div><div role="group" aria-label={copy.rugSize}><span>{copy.rug}</span>{(['small','large'] as const).map(size => <button type="button" key={size} aria-pressed={state.rugSize === size} onClick={() => act({ type: 'choose-rug', size })}>{copy.sizes[size]}</button>)}</div></section>}
    {state.lastGiftDay < day && dailyFinds.some(id => !state.owned.includes(id)) && <div className="apartment-find"><span>{copy.resident}</span><button type="button" onClick={() => act({ type: 'claim-gift' })}>{copy.gift}</button></div>}
  </section>;
}
