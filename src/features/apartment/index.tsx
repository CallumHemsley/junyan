import { useEffect, useRef, useState } from 'react';
import type { Line, Word } from '../../contracts';
import WordToken from '../../WordToken';
import { lineById, wordByHanzi } from './content';
import { cells, dailyFinds, legal, protectedCell, reduce, type Action, type ItemId, type State } from './rules';
import Scene from './Scene';
import './style.css';
export type Props = {
  sceneMode?: 'room' | 'world';
  state: State; day: number; onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void; onPlay: (line: Line) => void;
  recoveredWordIds?: readonly string[]; freshWordIds?: readonly string[];
};
export const itemNames: Record<ItemId, string> = { bed: '床', table: '桌子', chair: '椅子', rug: '地毯', cushion: '靠垫', 'repairs.stool': '凳子', 'garden.planter': '盆栽', 'cats.cushion': '猫靠垫', vase: '花瓶', basket: '篮子', lamp: '灯' };
const itemVocabulary = (id: ItemId) => id === 'cats.cushion' ? ['猫', '靠垫'] : [itemNames[id]];
export default function Apartment({ sceneMode = 'room', state, day, onAction, onLookup, onRecover, onPlay, recoveredWordIds = [], freshWordIds = [] }: Props) {
  const [showGrid,setShowGrid]=useState(sceneMode === 'world');
  const itemButtons=useRef(new Map<ItemId,HTMLButtonElement>());
  const welcome=useRef({play:onPlay,line:lineById[state.notice]});
  useEffect(()=>{welcome.current.play(welcome.current.line);},[]);
  const line = lineById[state.notice];
  const draft = state.selected && state.draft ? { id: state.selected, ...state.draft } : null;
  const valid = draft ? legal(state, draft) : false;
  function act(action: Action, recover: string[] = []) {
    const next = reduce(state, action, day);
    onAction(action);
    if (state.selected && !next.selected) { const id=state.selected; requestAnimationFrame(()=>itemButtons.current.get(id)?.focus()); }
    if(next !== state) onPlay(lineById[next.notice]);
    const changed = next.colour !== state.colour || next.owned.length !== state.owned.length || JSON.stringify(next.placements) !== JSON.stringify(state.placements);
    if (changed && recover.length) onRecover(recover.map(hanzi => wordByHanzi[hanzi].id));
  }
  function confirm() { act({type:'place'},draft ? [...itemVocabulary(draft.id),'放','这里'] : []); }
  const token = (word: Word) => <WordToken key={word.id} word={word} look={freshWordIds.includes(word.id) ? 'dot' : recoveredWordIds.includes(word.id) ? 'plain' : 'fogged'} onLookup={onLookup}/>;
  return <section className="apartment" aria-label="家">
    <header className="apartment-heading"><h1>家</h1><span>林姐</span><button type="button" disabled={!state.undo} onClick={() => act({ type: 'undo' })}>撤回</button></header>
    {sceneMode === 'room' && <Scene state={state} onPreview={(x,y)=>act({type:'preview',x,y})} onConfirm={confirm}/>}
    {draft && <section className="apartment-editor" aria-label="摆放家具"><div className="apartment-tools"><span>{itemNames[draft.id]}</span><button type="button" onClick={() => act({ type: 'rotate' })}>转一下</button><button type="button" onClick={confirm}>放这里</button><button type="button" onClick={() => act({ type: 'store' }, ['收起来'])}>收起来</button><button type="button" onClick={() => act({ type: 'cancel' })}>取消</button><button type="button" aria-expanded={showGrid} onClick={()=>setShowGrid(!showGrid)}>选格子</button></div>
      {showGrid && <div className="apartment-floor-grid" role="group" aria-label="地板">{Array.from({ length: 30 }, (_, i) => {
        const x = i % 6, y = Math.floor(i / 6);
        const occupied = state.placements.find(p => p.id !== draft.id && cells(p,state.rugSize).some(c => c.x === x && c.y === y));
        const highlighted = cells(draft,state.rugSize).some(c => c.x === x && c.y === y);
        return <button type="button" key={i} className={`${highlighted ? 'preview ' : ''}${highlighted && !valid ? 'blocked' : ''}`} aria-label={`第${y+1}行第${x+1}格${protectedCell(x,y) ? '，留出路' : occupied ? `，${itemNames[occupied.id]}` : ''}`} aria-pressed={draft.x === x && draft.y === y} onClick={() => act({ type: 'preview', x, y })}>{protectedCell(x,y) ? '路' : occupied ? itemNames[occupied.id] : <span aria-hidden="true">·</span>}</button>;
      })}</div>}
    </section>}
    <div className="apartment-speech" aria-live="polite"><div className="apartment-line">{line.tokens.map(token)}<span>。</span></div><button type="button" aria-label="再听一遍" onClick={() => onPlay(line)}>再听</button></div>
    {!state.starterClaimed && <div className="apartment-delivery"><div className="apartment-parcel" aria-hidden="true"/><span>桌子 · 椅子 · 地毯 · 靠垫</span><button type="button" onClick={() => act({ type: 'accept-starter' }, ['桌子', '椅子'])}>收下</button><button type="button" onClick={() => onPlay(lineById.welcome)}>先看看</button></div>}
    {state.owned.length>1 && <section className="apartment-inventory" aria-label="家具"><h2>家具</h2><div className="apartment-items">{state.owned.filter(id => id !== 'bed').map(id => <button type="button" key={id} ref={node=>{if(node) itemButtons.current.set(id,node);else itemButtons.current.delete(id);}} aria-pressed={state.selected === id} onClick={() => act({ type: 'select', id })}><span>{itemNames[id]}</span><span className="apartment-item-position">{state.placements.some(p => p.id === id) ? '屋里' : '收着'}</span></button>)}</div></section>}
    {state.starterClaimed && <section className="apartment-options" aria-label="换个样子"><div role="group" aria-label="靠垫颜色"><span>靠垫</span>{(['blue','cream'] as const).map(colour => <button type="button" key={colour} aria-pressed={state.colour === colour} onClick={() => act({ type: 'choose-colour', colour }, colour === 'blue' ? ['蓝色', '靠垫'] : ['米色', '靠垫'])}><i className={`apartment-swatch ${colour}`} aria-hidden="true"/>{colour === 'blue' ? '蓝色' : '米色'}</button>)}</div><div role="group" aria-label="地毯大小"><span>地毯</span>{(['small','large'] as const).map(size => <button type="button" key={size} aria-pressed={state.rugSize === size} onClick={() => act({ type: 'choose-rug', size })}>{size === 'small' ? '小' : '大'}</button>)}</div></section>}
    {state.lastGiftDay < day && dailyFinds.some(id => !state.owned.includes(id)) && <div className="apartment-find"><span>林姐</span><button type="button" onClick={() => act({ type: 'claim-gift' })}>今日小礼物</button></div>}
  </section>;
}
