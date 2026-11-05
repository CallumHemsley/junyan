import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import Garden from './index';
import {initialState, reduce, type Action, type State} from './rules';
import type {Line, Word} from '../../contracts';
import '../../../docs/design/tokens.css';
import '../../style.css';

declare global {
  interface Window {
    __GARDEN_TEST__?: {state: () => State; recoveries: () => string[]; plays: () => string[]; action: (action: Action) => void; nextDay: (day?: number) => void; snapshot: () => {state: State; day: number}; restore: (value: {state: State; day: number}) => void};
  }
}
function Harness() {
  const [state, setState] = useState(initialState);
  const [day, setDay] = useState(1);
  const [recovered, setRecovered] = useState<string[]>([]);
  const [lookup, setLookup] = useState<Word | null>(null);
  const history = useRef<string[]>([]);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const wordClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (lookup) wordClose.current?.focus();
    return () => {if (lookup) trigger.current?.focus();};
  }, [lookup]);
  const dispatch = (action: Action) => setState(value => reduce(value, action, day));
  window.__GARDEN_TEST__ = {state: () => state, recoveries: () => recovered, plays: () => history.current,
    action: dispatch, nextDay: value => setDay(value ?? day + 1), snapshot: () => ({state, day}), restore: value => {setDay(value.day); setState(value.state);}};
  return <main>
    <div inert={Boolean(lookup)}><Garden state={state} day={day} onAction={dispatch}
      onRecover={ids => setRecovered(value => [...new Set([...value, ...ids])])} recoveredWordIds={recovered}
      onLookup={(word, button) => {trigger.current = button; setLookup(word);}}
      onPlay={(value: Line) => {history.current.push(value.id);}}/></div>
    {lookup && <div role="dialog" aria-label={lookup.hanzi} style={{position: 'fixed', bottom: 16, left: 16, padding: 24, background: 'var(--surface-card)', border: '1px solid var(--hairline-strong)', zIndex: 20}}>
      <span>{lookup.hanzi}</span><p data-testid="garden-harness-pinyin">{lookup.pinyin}</p><button ref={wordClose} onClick={() => setLookup(null)}>收起</button>
    </div>}
  </main>;
}
if (import.meta.env.DEV && new URLSearchParams(location.search).get('test') === '1') createRoot(document.getElementById('root')!).render(<Harness/>);
