import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Repairs from '../../src/features/repairs';
import { initialState, reduce, validate } from '../../src/features/repairs/rules';
import '../../docs/design/tokens.css';
import '../../src/style.css';

const saved = new URLSearchParams(location.search).get('state');
const start = saved ? validate(JSON.parse(saved)) ?? initialState() : initialState();
const observations = { actions: [] as unknown[], recoveries: [] as string[][], plays: [] as string[], lookups: [] as string[], state: start };
Object.assign(window, { repairHarness: observations });
function Harness() {
  const [state, setState] = useState(start);
  const [recovered, setRecovered] = useState<string[]>([]);
  const [fresh, setFresh] = useState<string[]>([]);
  observations.state = state;
  return <Repairs state={state} day={3} recoveredWordIds={recovered} freshWordIds={fresh}
    onAction={action => { observations.actions.push(action); setState(previous => reduce(previous, action, 3)); }}
    onRecover={ids => { observations.recoveries.push(ids); setRecovered(previous => [...new Set([...previous, ...ids])]); setFresh(ids); }}
    onLookup={word => { observations.lookups.push(word.id); }}
    onPlay={line => { observations.plays.push(line.id); }} />;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Harness /></StrictMode>);
