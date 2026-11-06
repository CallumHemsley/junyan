import { useEffect, useRef } from 'react';
import type { Line, Word } from '../../contracts';
import WordToken from '../../WordToken';
import WordLine from '../../WordLine';
import { Speaker } from '../../icons';
import { lineFor, speakerFor, wordFor } from './content';
import { canReturn, currentBench, recovered, reduce, visibleParts, type Action, type Job, type Part, type State } from './rules';
import RepairScene from './RepairScene';
import { featureUi } from '../copy';
import './repairs.css';

const copy = featureUi.repairs;

export type RepairProps = {
  state: State;
  day: number;
  onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void;
  onPlay: (line: Line) => void;
  recoveredWordIds?: string[];
  freshWordIds?: string[];
};
const partWords: Record<Part, string> = { bulb: 'repairs.bulb', cover: 'repairs.cover', lead: 'repairs.wire', cell: 'repairs.battery' };
const partCenters: Record<Part, [number, number]> = { bulb: [49, 23], cover: [36, 47], lead: [52, 33], cell: [43, 31] };
const partPositions: Record<Part, { left: string; top: string }> = {
  bulb: { left: '71%', top: '21%' }, cover: { left: '35%', top: '57%' }, lead: { left: '73%', top: '36%' }, cell: { left: '25%', top: '30%' },
};
export default function Repairs({ state, day, onAction, onLookup, onRecover, onPlay, recoveredWordIds = [], freshWordIds = [] }: RepairProps) {
  const latest = useRef(state);
  latest.current = state;
  const practice = useRef<HTMLButtonElement>(null);
  const focusPractice = useRef(false);
  const bench = currentBench(state);
  useEffect(() => {
    if (!bench && focusPractice.current) { practice.current?.focus(); focusPractice.current = false; }
  }, [bench]);
  const line = lineFor(state.feedback);
  const speaker = speakerFor(state.feedback);
  const played = useRef<string | null>(null);
  useEffect(() => {
    if (played.current === line.id) return;
    played.current = line.id;
    onPlay(line);
  }, [line, onPlay]);
  const send = (action: Action) => {
    const before = latest.current;
    const after = reduce(before, action, day);
    if (after === before) return;
    latest.current = after;
    if (action.type === 'return') focusPractice.current = true;
    onAction(action);
    const ids = recovered(before, action, after);
    if (ids.length) onRecover(ids);
  };
  const token = (word: Word, key = word.id) => <WordToken key={key} word={word} look={!recoveredWordIds.includes(word.id) ? 'fogged' : freshWordIds.includes(word.id) ? 'dot' : 'plain'} onLookup={onLookup} />;
  const control = (label: string, action: Action, disabled = false) => <button className="repair-action" type="button" onClick={() => send(action)} disabled={disabled}>{label}</button>;
  return <section className="repairs" aria-label={copy.title} data-testid="repairs">
    <header className="repair-header">
      <h2>{token(wordFor('repairs.workshop'))}</h2>
      <nav className="repair-jobs" aria-label={copy.jobs}>
        {(['lamp', 'toy'] as Job[]).map(job => <button type="button" key={job} aria-pressed={state.active === job} onClick={() => send({ type: 'switch', job })} data-testid={`repair-job-${job}`}>
          <span className={`repair-job-icon ${job}`} aria-hidden="true" />{copy.jobNames[job]}{state.completed.includes(job) && <span className="repair-shelf-mark" aria-hidden="true">·</span>}
        </button>)}
      </nav>
    </header>
    <div className="repair-layout">
      <div className="repair-scene" data-testid="repair-scene" data-object={bench?.kind ?? 'shelf'} data-test={bench?.test ?? 'returned'}>
        <RepairScene state={state} />
        {bench && <svg className="repair-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {visibleParts(bench).map(part => {
            const center = partCenters[part], label = partPositions[part];
            return <g key={part} data-selected={state.selected === part}>
              <line x1={parseFloat(label.left)} y1={parseFloat(label.top)} x2={center[0]} y2={center[1]} />
              <ellipse cx={center[0]} cy={center[1]} rx={part === 'bulb' ? 5 : 3.5} ry={part === 'bulb' ? 6.5 : 4.5} />
            </g>;
          })}
        </svg>}
        {bench && visibleParts(bench).map(part => <button type="button" key={part} className="repair-part" style={partPositions[part]} aria-pressed={state.selected === part} data-testid={`repair-part-${part}`} onClick={() => send({ type: 'select', job: bench.kind, part })}>
          <span className="repair-part-ring" aria-hidden="true" />{wordFor(partWords[part]).text}
        </button>)}
      </div>
      <div className="repair-panel">
        <div className="repair-dialogue">
          <div className="repair-speaker"><span>{speaker.name}</span><button type="button" aria-label={copy.replay} onClick={() => onPlay(line)}><Speaker /></button></div>
          <div className="repair-line" aria-live="polite" aria-atomic="true" data-testid="repair-feedback">
            <WordLine line={line} look={word => !recoveredWordIds.includes(word.id) ? 'fogged' : freshWordIds.includes(word.id) ? 'dot' : 'plain'} onLookup={onLookup} />
          </div>
        </div>
        <div className="repair-operations">
          {bench ? <>
            <div className="repair-part-name">
              {state.selected ? <>
                {token(wordFor(partWords[state.selected]))}
                {(state.selected === 'bulb' ? ['repairs.tighten', 'repairs.loosen'] : state.selected === 'cover' ? ['repairs.open', 'repairs.close'] : state.selected === 'lead' ? ['repairs.metal', 'repairs.connect', 'repairs.disconnect'] : ['repairs.replace', 'repairs.new', 'repairs.old']).map(id => token(wordFor(id)))}
              </> : token(wordFor('try'))}
            </div>
            <div className="repair-part-actions" aria-label={copy.operations}>
              {bench.kind === 'lamp' && state.selected === 'bulb' && <>
                {control(copy.tighten, { type: 'turn', job: 'lamp', direction: 'tighten' }, bench.fitting === 'seated' && bench.power === 'off')}
                {control(copy.loosen, { type: 'turn', job: 'lamp', direction: 'loosen' }, bench.fitting === 'loose' && bench.power === 'off')}
              </>}
              {bench.kind === 'toy' && state.selected === 'cover' && <>
                {control(copy.open, { type: 'cover', job: 'toy', position: 'open' }, bench.cover === 'open')}
                {control(copy.close, { type: 'cover', job: 'toy', position: 'closed' }, bench.cover === 'closed')}
              </>}
              {bench.kind === 'toy' && state.selected === 'lead' && <>
                {control(copy.connect, { type: 'lead', job: 'toy', position: 'connected' }, bench.lead === 'connected')}
                {control(copy.disconnect, { type: 'lead', job: 'toy', position: 'loose' }, bench.lead === 'loose')}
              </>}
              {bench.kind === 'toy' && state.selected === 'cell' && <>
                {control(copy.replaceBattery, { type: 'cell', job: 'toy', condition: 'fresh' }, bench.cell === 'fresh')}
                {control(copy.replaceOldBattery, { type: 'cell', job: 'toy', condition: 'old' }, bench.cell === 'old')}
              </>}
            </div>
            <div className="repair-main-actions">
              {control(copy.test, { type: 'test', job: bench.kind })}
              {bench.kind === 'lamp' && control(copy.powerOff, { type: 'power-off', job: 'lamp' }, bench.power === 'off')}
              {control(copy.return, { type: 'return', job: bench.kind }, !canReturn(bench))}
              {control(copy.reset, { type: 'reset', job: bench.kind })}
            </div>
          </> : <div className="repair-shelf">
            <div className="repair-part-name">{token(wordFor(state.active === 'lamp' ? 'repairs.lamp' : 'repairs.toy'))}{token(wordFor('good'))}{token(wordFor('le'))}</div>
            <button ref={practice} type="button" className="repair-action" onClick={() => send({ type: 'start', job: state.active })}>{copy.practice}</button>
            {state.completed.length === 2 && <div className="repair-gift-words">{token(wordFor('repairs.wood'))}{token(wordFor('repairs.stool'))}</div>}
          </div>}
        </div>
      </div>
    </div>
  </section>;
}
