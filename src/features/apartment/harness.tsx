import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Apartment from './index';
import { initialState, reduce, type Action } from './rules';
import type { Word } from '../../contracts';
import '../../style.css';
function Harness() {
  const [state,setState]=useState(initialState);
  const [recovered,setRecovered]=useState<string[]>([]);
  const [lookup,setLookup]=useState<Word|null>(null);
  const played=useRef<string[]>([]);
  useEffect(()=>{
    const target=window as Window & {__APARTMENT_TEST__?: unknown};
    target.__APARTMENT_TEST__={getState:()=>state,getRecovered:()=>recovered,getPlayed:()=>played.current};
    return ()=>{delete target.__APARTMENT_TEST__;};
  },[state,recovered]);
  return <><Apartment state={state} day={1} onAction={(a:Action)=>setState(s=>reduce(s,a,1))} onLookup={word=>setLookup(word)} onRecover={ids=>setRecovered(s=>[...new Set([...s,...ids])])} onPlay={line=>{played.current.push(line.id);}} recoveredWordIds={recovered}/>{lookup && <dialog open aria-label="词语"><p>{lookup.hanzi}</p><p>{lookup.pinyin}</p><p>{lookup.gloss}</p><button onClick={()=>setLookup(null)}>收起</button></dialog>}</>;
}
if(import.meta.env.DEV && new URLSearchParams(location.search).get('test') === '1') createRoot(document.getElementById('root')!).render(<Harness/>);
