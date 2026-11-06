import { featureUi } from '../copy';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Cats from './index';
import { initialState, reduce, validate, type Action, type State } from './rules';
import type { Word } from '../../contracts';
import '../../../docs/design/tokens.css';
import '../../style.css';

if (!import.meta.env.DEV || new URLSearchParams(location.search).get('test') !== '1') throw new Error('Development harness only');
const params = new URLSearchParams(location.search);
let initial = initialState();
if (params.has('state')) {
  try { initial = validate(JSON.parse(params.get('state')!)) ?? initial; } catch {}
}
let setSaved: (state: State) => void;
let setDay: (day: number) => void;
let snapshot = initial;
let dayValue = Number(params.get('day') ?? 1);
const events: { recover: string[][]; play: string[]; lookup: string[] } = { recover: [], play: [], lookup: [] };
Object.assign(window, { __CATS_HARNESS__: {
  state: () => snapshot, day: (day: number) => { dayValue = day; setDay(day); },
  restore: (value: unknown) => { const state = validate(value); if (!state) throw new Error('Invalid cats save'); setSaved(state); },
  events,
} });
function Harness() {
  const [state, save] = useState(initial), [day, updateDay] = useState(dayValue);
  const [recovered, setRecovered] = useState<string[]>([]), [word, lookup] = useState<Word | null>(null);
  setSaved = save; setDay = updateDay; snapshot = state;
  return <><Cats state={state} day={day} onAction={(action: Action) => save(reduce(state, action, day))}
    onRecover={ids => { events.recover.push(ids); setRecovered(current => [...new Set([...current, ...ids])]); }}
    onLookup={word => { events.lookup.push(word.id); lookup(word); }}
    onPlay={line => events.play.push(line.id)} recoveredWordIds={recovered} />
    {word && <aside className="cats-harness-word" role="dialog" aria-label={word.text}><strong>{word.text}</strong>{word.pronunciation && <p>{word.pronunciation}</p>}<button onClick={() => lookup(null)} aria-label={featureUi.dismiss}>×</button></aside>}
  </>;
}
createRoot(document.getElementById('cats-harness')!).render(<Harness />);
