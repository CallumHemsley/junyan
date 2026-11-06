import { useEffect, useRef } from 'react';
import type { Line, Word } from '../../contracts';
import WordToken from '../../WordToken';
import { Speaker } from '../../icons';
import { lineFor, speakerFor, wordFor } from './content';
import { canReturn, currentBench, recovered, reduce, visibleParts, type Action, type Job, type Part, type State } from './rules';
import RepairScene from './RepairScene';
import './repairs.css';

export type RepairProps = {
  state: State;
  day: number;
  onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void;
  onPlay: (line: Line) => void;
  recoveredWordIds?: string[];
  freshWordIds?: string[];
  contextualJob?: Job;
};
const partWords: Record<Part, string> = { bulb: '灯泡', cover: '盖子', lead: '线', cell: '电池' };
const partCenters: Record<Part, [number, number]> = { bulb: [49, 23], cover: [36, 47], lead: [52, 33], cell: [43, 31] };
const partPositions: Record<Part, { left: string; top: string }> = {
  bulb: { left: '71%', top: '21%' }, cover: { left: '35%', top: '57%' }, lead: { left: '73%', top: '36%' }, cell: { left: '25%', top: '30%' },
};
export default function Repairs({ state, day, onAction, onLookup, onRecover, onPlay, recoveredWordIds = [], freshWordIds = [], contextualJob }: RepairProps) {
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
  return <section className="repairs" aria-label="修理间" data-testid="repairs">
    <header className="repair-header">
      <h2>{token(wordFor('修理间'))}</h2>
      {!contextualJob && <nav className="repair-jobs" aria-label="修理物件">
        {(['lamp', 'toy'] as Job[]).map(job => <button type="button" key={job} aria-pressed={state.active === job} onClick={() => send({ type: 'switch', job })} data-testid={`repair-job-${job}`}>
          <span className={`repair-job-icon ${job}`} aria-hidden="true" />{job === 'lamp' ? '台灯' : '玩具'}{state.completed.includes(job) && <span className="repair-shelf-mark" aria-hidden="true">·</span>}
        </button>)}
      </nav>}
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
          <span className="repair-part-ring" aria-hidden="true" />{partWords[part]}
        </button>)}
      </div>
      <div className="repair-panel">
        <div className="repair-dialogue">
          <div className="repair-speaker"><span>{speaker.name}</span><button type="button" aria-label="再听" onClick={() => onPlay(line)}><Speaker /></button></div>
          <div className="repair-line" aria-live="polite" aria-atomic="true" data-testid="repair-feedback">
            {line.tokens.map((word, index) => token(word, `${line.id}-${index}`))}
          </div>
        </div>
        <div className="repair-operations">
          {bench ? <>
            <div className="repair-part-name">
              {state.selected ? <>
                {token(wordFor(partWords[state.selected]))}
                {(state.selected === 'bulb' ? ['拧紧', '转松'] : state.selected === 'cover' ? ['打开', '盖上'] : state.selected === 'lead' ? ['金属', '接上', '拔下'] : ['换', '新', '旧']).map(hanzi => token(wordFor(hanzi)))}
              </> : token(wordFor('试试'))}
            </div>
            <div className="repair-part-actions" aria-label="物件操作">
              {bench.kind === 'lamp' && state.selected === 'bulb' && <>
                {control('拧紧', { type: 'turn', job: 'lamp', direction: 'tighten' }, bench.fitting === 'seated' && bench.power === 'off')}
                {control('转松', { type: 'turn', job: 'lamp', direction: 'loosen' }, bench.fitting === 'loose' && bench.power === 'off')}
              </>}
              {bench.kind === 'toy' && state.selected === 'cover' && <>
                {control('打开', { type: 'cover', job: 'toy', position: 'open' }, bench.cover === 'open')}
                {control('盖上', { type: 'cover', job: 'toy', position: 'closed' }, bench.cover === 'closed')}
              </>}
              {bench.kind === 'toy' && state.selected === 'lead' && <>
                {control('接上', { type: 'lead', job: 'toy', position: 'connected' }, bench.lead === 'connected')}
                {control('拔下', { type: 'lead', job: 'toy', position: 'loose' }, bench.lead === 'loose')}
              </>}
              {bench.kind === 'toy' && state.selected === 'cell' && <>
                {control('换电池', { type: 'cell', job: 'toy', condition: 'fresh' }, bench.cell === 'fresh')}
                {control('放回旧电池', { type: 'cell', job: 'toy', condition: 'old' }, bench.cell === 'old')}
              </>}
            </div>
            <div className="repair-main-actions">
              {control('试试', { type: 'test', job: bench.kind })}
              {bench.kind === 'lamp' && control('关掉', { type: 'power-off', job: 'lamp' }, bench.power === 'off')}
              {control('放回', { type: 'return', job: bench.kind }, !canReturn(bench))}
              {control('重新来', { type: 'reset', job: bench.kind })}
            </div>
          </> : <div className="repair-shelf">
            <div className="repair-part-name">{token(wordFor(state.active === 'lamp' ? '台灯' : '玩具'))}{token(wordFor('好'))}{token(wordFor('了'))}</div>
            <button ref={practice} type="button" className="repair-action" onClick={() => send({ type: 'start', job: state.active })}>再修一次</button>
            {state.completed.length === 2 && <div className="repair-gift-words">{token(wordFor('木头'))}{token(wordFor('凳子'))}</div>}
          </div>}
        </div>
      </div>
    </div>
  </section>;
}
