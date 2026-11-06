import { useEffect, useRef } from 'react';
import type { FeatureViewProps } from '../../neighbourhood/contracts';
import WordToken from '../../WordToken';
import FeatureLine from '../../neighbourhood/FeatureLine';
import { briefFor, instruction, instructionsFor, words, type BriefId } from './content';
import { cells, legal, protectedCell, recoveryForTransition, reduce, type Action, type State } from './rules';
import { copy } from './copy';
import './style.css';

export type Props = FeatureViewProps<State, Action>;
export default function ReadingRoom({ state, onAction, onLookup, onPlay, onRecover, recoveredWordIds = [], freshWordIds = [] }: Props) {
  const initial = useRef({ play: onPlay, line: instruction[state.notice] });
  useEffect(() => { initial.current.play(initial.current.line); }, []);
  const learning = { onLookup, onPlay, recoveredWordIds, freshWordIds };
  const placements = state.layouts[state.brief];
  const draft = state.selected && state.draft ? { id: state.selected, ...state.draft } : null;
  const valid = draft ? legal(state.brief, placements, draft) : false;
  function act(action: Action) {
    const next = reduce(state, action);
    onAction(action);
    if (next !== state) onPlay(instruction[next.notice]);
    const recovered = recoveryForTransition(state, action, next);
    if (recovered.length) onRecover(recovered);
  }
  function token(id: string) {
    const word = words.find(word => word.id === id)!;
    return <WordToken key={id} word={word} look={freshWordIds.includes(id) ? 'dot' : recoveredWordIds.includes(id) ? 'plain' : 'fogged'} onLookup={onLookup} />;
  }
  function briefButton(brief: BriefId, numeral: string) {
    const locked = brief === 'alcove' && !state.completed.includes('window');
    return <button type="button" data-brief={brief} aria-label={locked ? copy.locked : brief === 'window' ? copy.first : copy.second} disabled={locked} aria-pressed={state.brief === brief} onClick={() => act({ type: 'begin-brief', brief })}>
      <span>{numeral}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM12 3v18M5 12h14"/></svg>{state.completed.includes(brief) && <span className="reading-room-project-mark" aria-label={copy.progress}>◇</span>}
    </button>;
  }
  return <section className="reading-room" aria-label={copy.title} data-brief={state.brief} data-status={state.status}>
    <header className="reading-room-heading"><svg className="reading-room-book" viewBox="0 0 32 26" aria-hidden="true"><path d="M16 5Q9 0 2 3v20q7-3 14 1 7-4 14-1V3q-7-3-14 2Zm0 0v19M6 8l6 1M6 13l6 1m8-5 6-1m-6 6 6-1"/></svg><div>{token('table')}<span aria-hidden="true">·</span>{token('apartment.chair')}</div></header>
    <nav className="reading-room-briefs" aria-label={copy.briefs}>{briefButton('window', '①')}{briefButton('alcove', '②')}</nav>
    <div className="reading-room-current" aria-live="polite"><FeatureLine line={instruction[state.notice]} {...learning}/></div>
    <details className="reading-room-instructions"><summary aria-label={copy.instructions}><span aria-hidden="true">☷</span>{token('look')}</summary>{instructionsFor(state.brief).map(line => <FeatureLine key={line.id} line={line} {...learning}/>)}</details>
    {state.status === 'editing' && <>
      <div className="reading-room-kit" role="group" aria-label={copy.briefs}>
        <div>{token('table')}<button type="button" data-item="table" aria-label={copy.table} aria-pressed={state.selected === 'table'} onClick={() => act({ type: 'select', id: 'table' })}><svg viewBox="0 0 32 28" aria-hidden="true"><path d="M3 6h26v5H3zm3 5v14m20-14v14M7 16h18"/></svg></button></div>
        <div>{token('apartment.chair')}<button type="button" data-item="chair" aria-label={copy.chair} aria-pressed={state.selected === 'chair'} onClick={() => act({ type: 'select', id: 'chair' })}><svg viewBox="0 0 32 28" aria-hidden="true"><path d="M8 15V3h16v12M5 15h22v4H5zm3 4v7m16-7v7M8 9h16"/></svg></button></div>
      </div>
      {draft && <section className="reading-room-editor" onKeyDown={event => {
        if (event.key === 'Enter' && event.target === event.currentTarget) { event.preventDefault(); act({ type: 'place' }); }
      }} tabIndex={0} aria-label={copy.floor}>
        <div className="reading-room-tools"><button type="button" aria-label={copy.rotate} onClick={() => act({ type: 'rotate' })}>↻</button><button type="button" aria-label={copy.place} onClick={() => act({ type: 'place' })}>↓</button><button type="button" aria-label={copy.cancel} onClick={() => act({ type: 'cancel' })}>×</button></div>
        <div className="reading-room-grid" role="group" aria-label={copy.floor}>{Array.from({ length: 30 }, (_, i) => {
          const x = i % 6, y = Math.floor(i / 6), path = protectedCell(x, y), fixture = briefFor(state.brief).fixtures.some(c => c.x === x && c.y === y);
          const occupant = placements.find(p => p.id !== draft.id && cells(p).some(c => c.x === x && c.y === y));
          const highlighted = cells(draft).some(c => c.x === x && c.y === y);
          return <button key={i} type="button" data-cell={`${x},${y}`} aria-label={copy.cell(x, y, path, fixture, occupant?.id === 'table' ? '桌子' : occupant ? '椅子' : undefined)} aria-pressed={draft.x === x && draft.y === y} className={`${path ? 'path ' : ''}${fixture ? 'fixture ' : ''}${highlighted ? valid ? 'preview' : 'blocked' : ''}`} onClick={() => act({ type: 'preview', x, y })}><span aria-hidden="true">{path ? '⋅' : fixture ? '▥' : occupant ? '▰' : highlighted ? '◇' : '·'}</span></button>;
        })}</div>
      </section>}
    </>}
    <footer className="reading-room-actions"><button type="button" aria-label={copy.restart} onClick={() => act({ type: 'restart' })}>↺</button>{state.status === 'editing' && <button className="reading-room-check" type="button" aria-label={copy.check} onClick={() => act({ type: 'check' })}>◇</button>}{state.status === 'complete' && state.brief === 'window' && <button className="reading-room-next" type="button" aria-label={copy.second} onClick={() => act({ type: 'begin-brief', brief: 'alcove' })}>② →</button>}</footer>
  </section>;
}
