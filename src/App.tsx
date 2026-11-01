import {useCallback,useEffect,useRef,useState} from 'react';
import type {Action,GameState,Line,Position,Word} from './contracts';
import {KITCHEN,TABLES} from './contracts';
import {content} from './content';
import {createGame,reduceGame,getOrder,orderTotal,isNear,canVisitKitchen} from './game';
import RestaurantScene from './scene/RestaurantScene';
import FoodArt from './FoodArt';
import {loadGame,saveGame} from './save';

const testMode=import.meta.env.DEV&&new URLSearchParams(location.search).get('test')==='1';
const seed=Number(new URLSearchParams(location.search).get('seed')||42);
const phases={seated:'等候点餐',ordered:'等候上菜',checkout:'等候找零',served:'多谢'};
const dayNames=['','第一天','第二天','第三天','第四天','第五天'];
const Speaker=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Zm12-1q4 4 0 8m3-11q7 7 0 14"/></svg>;
const Book=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7q3 0 3 3v14q-1-2-3-2H4Zm16 0h-3q-3 0-3 3m0 14q1-2 3-2h3Z"/></svg>;
const Sun=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>;

export default function App(){
  const [state,setState]=useState<GameState>(()=>createGame(content,Number.isFinite(seed)?seed:42));
  const stateRef=useRef(state);stateRef.current=state;
  const [ready,setReady]=useState(testMode);
  const [saveError,setSaveError]=useState(false);
  const [panel,setPanel]=useState<'none'|'table'|'kitchen'|'journal'|'help'>('help');
  const [table,setTable]=useState(1);
  const [word,setWord]=useState<Word|null>(null);
  const [change,setChange]=useState(0);
  const [moving,setMoving]=useState(false);
  const [audioError,setAudioError]=useState(false);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const motion=useRef<{target:Position;arrive?:()=>void}|null>(null);
  const dispatch=useCallback((action:Action)=>setState(s=>reduceGame(s,action,content)),[]);
  const play=useCallback((url:string)=>{
    audioRef.current?.pause();
    const audio=new Audio(url);audioRef.current=audio;
    setAudioError(false);audio.play().catch(()=>setAudioError(true));
  },[]);
  useEffect(()=>()=>audioRef.current?.pause(),[]);
  useEffect(()=>{if(testMode)return;let cancelled=false;loadGame().then(saved=>{if(!cancelled&&saved&&saved.customers.every(c=>content.orders.some(o=>o.id===c.orderId))&&saved.tray.every(id=>content.foods.some(f=>f.id===id)))setState(saved);}).catch(()=>setSaveError(true)).finally(()=>{if(!cancelled)setReady(true);});return()=>{cancelled=true;};},[]);
  useEffect(()=>{if(!ready||testMode)return;const timer=setTimeout(()=>{saveGame(state).catch(()=>setSaveError(true));},350);return()=>clearTimeout(timer);},[state,ready]);
  useEffect(()=>{
    let frame:number;let previous=0;
    const tick=(now:number)=>{const dt=Math.min((now-previous)/1000,.04);previous=now;const task=motion.current;
      if(task){const p=stateRef.current.player;const dx=task.target.x-p.x,dy=task.target.y-p.y,d=Math.hypot(dx,dy),step=dt*5;
        if(d<=Math.max(step,.06)){dispatch({type:'move',position:task.target});motion.current=null;setMoving(false);task.arrive?.();}
        else dispatch({type:'move',position:{x:p.x+dx/d*step,y:p.y+dy/d*step}});
      }frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[dispatch]);
  const walk=useCallback((position:Position,arrive?:()=>void)=>{setWord(null);setPanel('none');setMoving(true);motion.current={target:{x:Math.max(0,Math.min(12,position.x)),y:Math.max(0,Math.min(10,position.y))},arrive};},[]);
  const visitTable=useCallback((number:number)=>{
    const target=TABLES.find(t=>t.table===number)!;
    const open=()=>{setTable(number);setChange(0);dispatch({type:'interact',table:number});setPanel('table');const order=getOrder(stateRef.current,number,content);if(order&&stateRef.current.customers.find(c=>c.table===number)?.phase!=='served')play(order.line.audio);};
    if(isNear(stateRef.current.player,target))open();else walk({x:target.x,y:Math.min(10,target.y+1.3)},open);
  },[dispatch,play,walk]);
  const visitKitchen=useCallback(()=>{const open=()=>setPanel('kitchen');if(canVisitKitchen(stateRef.current))open();else walk({x:KITCHEN.x,y:KITCHEN.y+1.3},open);},[walk]);
  useEffect(()=>{
    if(panel==='none')return;
    const previous=document.activeElement;
    const dialog=document.querySelector<HTMLElement>('.paper-panel');
    dialog?.querySelector<HTMLButtonElement>('button')?.focus();
    const trap=(event:KeyboardEvent)=>{if(event.key!=='Tab'||word)return;const controls=[...dialog?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input')||[]];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}};
    document.addEventListener('keydown',trap);
    return()=>{document.removeEventListener('keydown',trap);if(previous instanceof HTMLElement)previous.focus();};
  },[panel,word]);
  useEffect(()=>{const key=(event:KeyboardEvent)=>{
    if(event.key==='Escape'){setPanel('none');setWord(null);return;}
    if(event.target instanceof HTMLElement&&/INPUT|TEXTAREA|BUTTON/.test(event.target.tagName))return;
    const directions:Record<string,[number,number]>={ArrowUp:[-.45,-.45],w:[-.45,-.45],ArrowDown:[.45,.45],s:[.45,.45],ArrowLeft:[-.45,.45],a:[-.45,.45],ArrowRight:[.45,-.45],d:[.45,-.45]};
    const direction=directions[event.key];if(direction){event.preventDefault();motion.current=null;setMoving(false);setPanel('none');setWord(null);const p=stateRef.current.player;dispatch({type:'move',position:{x:p.x+direction[0],y:p.y+direction[1]}});}
    if(event.key===' '||event.key.toLowerCase()==='e'){event.preventDefault();if(canVisitKitchen(stateRef.current))visitKitchen();else{const near=TABLES.find(t=>isNear(t,stateRef.current.player));if(near)visitTable(near.table);}}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[dispatch,visitTable,visitKitchen]);
  useEffect(()=>{
    if(!testMode)return;
    const hooks={getState:()=>stateRef.current,dispatch,reset:()=>{motion.current=null;setMoving(false);setState(createGame(content,seed));setPanel('none');},content};
    (window as Window&{__TEST__?:typeof hooks}).__TEST__=hooks;
    return()=>{delete (window as Window&{__TEST__?:typeof hooks}).__TEST__;};
  },[dispatch]);
  const lookup=(w:Word)=>{setWord(w);dispatch({type:'lookup',wordId:w.id,now:Date.now()});play(w.audio);};
  const tokens=(line:Line)=> <div className="spoken">{line.tokens.map((w,i)=><button key={`${w.id}-${i}`} className={`word ${!state.journal[w.id]?'new-word':''}`} onClick={()=>lookup(w)}>{w.hanzi}</button>)}</div>;
  const order=getOrder(state,table,content);
  const customer=state.customers.find(c=>c.table===table);
  const total=order?orderTotal(order,content):0;
  const allWords=[...content.foods.map(f=>f.word),...content.orders.flatMap(o=>o.line.tokens),...content.thanks.tokens,...content.retry.tokens];
  const words=[...new Map(allWords.filter(w=>state.journal[w.id]).map(w=>[w.id,w])).values()];
  const close=()=>{setPanel('none');setWord(null);};
  const completePayment=()=>{if(!order)return;dispatch({type:'pay',table,change});if(change===order.paid-total)play(content.thanks.audio);};
  if(!ready)return <main className="loading">早安，小馆正在开门。</main>;
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="君言首页"><span className="brand-seal">君<br/>言</span><span>君言<span className="brand-divider"> / </span>早安小馆</span></a><nav><button onClick={()=>{motion.current=null;setMoving(false);setPanel('journal');setWord(null);}}><Book/><span>本子</span><small>{words.length}</small></button><button className="help-button" aria-label="怎么玩" onClick={()=>setPanel('help')}>?</button></nav></header>
    <main>
      <div className="day-heading"><div><p className="eyebrow">{dayNames[state.day]||`第${state.day}天`} <span>·</span> 早市</p><h1>一桌一味，慢慢记住。</h1></div><div className="day-stats"><span><b>{state.served}</b> / 4 桌</span><span><b>{state.earnings}</b> 块</span></div></div>
      <div className="play-layout"><section className="world-panel" aria-label="早安小馆餐厅">
        <div className="world-caption"><span className="sun-mark"><Sun/></span><span>{state.level===1?'先从一道菜开始。':state.level===2?'记住数量，再去取餐。':'多了几道菜，慢慢听。'}</span><span className="level">{state.level===1?'一道菜':state.level===2?'两样菜':'三样菜'}</span></div>
        <RestaurantScene state={state} onMove={walk} onTable={visitTable} onKitchen={visitKitchen}/>
        <div className="world-footer"><span>{moving?'走过去…':'点桌子听点餐 · 点厨房取餐'}</span><span className="keyboard-hint">↑ ↓ ← → 走动 <kbd>E</kbd> 招呼</span><button className="small-link" onClick={()=>setPanel('help')}>怎么玩</button></div>
      </section>
      <aside className="side-panel"><div className="section-label"><span>今日客人</span><span>四位老朋友</span></div><div className="customer-list">{state.customers.map(c=>{const o=getOrder(state,c.table,content);return <button key={c.table} className={`customer-row ${c.phase==='served'?'customer-done':''}`} onClick={()=>visitTable(c.table)} aria-label={`${c.table}桌 ${o?.customer} ${phases[c.phase]}`}><span className={`portrait portrait-${c.table}`} aria-hidden="true"><i/></span><span className="customer-info"><b>{o?.customer}</b><small>{phases[c.phase]}</small></span><span className="table-number">{c.table}桌</span></button>;})}</div>
        <div className="tray-section"><div className="section-label"><span>托盘</span><span>{state.tray.length} / 6</span></div><div className="tray">{state.tray.length===0?<div className="empty-tray"><span className="tray-line"/><p>听完点餐，去厨房看看。</p></div>:state.tray.map((id,i)=>{const food=content.foods.find(f=>f.id===id)!;return <button key={`${id}-${i}`} onClick={()=>lookup(food.word)} className="tray-item" aria-label={`查看${food.word.hanzi}`}><FoodArt kind={food.kind}/><span>{food.word.hanzi}</span></button>;})}</div><button className="kitchen-link" onClick={visitKitchen}>去厨房取餐 <span>↗</span></button></div>
        <div className="learning-note"><span className="note-mark">言</span><p>听见一个词，<br/>也记住一道早饭。</p><small>不认识的字，点一下。</small></div>
      </aside></div>
      <footer className="page-footer"><span>早餐热着，慢慢来。</span><span>君言 · 语言在生活里</span></footer>
      {saveError&&<p role="status" className="save-note">本次进度暂时无法保存，请保持页面打开。</p>}
    </main>
    {panel!=='none'&&<div className="modal-backdrop" onClick={close}><section className={`paper-panel ${panel==='kitchen'?'kitchen-panel':''}`} role="dialog" aria-modal="true" aria-label={panel==='kitchen'?'厨房':panel==='journal'?'本子':panel==='help'?'怎么玩':`${table}桌点餐`} onClick={e=>e.stopPropagation()}><button className="close-button" aria-label="关闭" onClick={close}>×</button>
      {panel==='help'&&<><p className="eyebrow">欢迎来小馆</p><h2>早安，今天你来招呼。</h2><div className="help-steps"><p><b>一</b><span>走到桌边，听客人点餐。<small>点桌子就会走过去。</small></span></p><p><b>二</b><span>记住菜名，去厨房取餐。<small>点一下汉字，听一听、看一看。</small></span></p><p><b>三</b><span>把早饭送对桌，再找零。<small>每天四桌，菜会慢慢变多。</small></span></p></div><button className="primary" onClick={close}>开门迎客 <span>→</span></button><p className="help-foot">没有倒计时，慢慢听就好。</p></>}
      {panel==='table'&&order&&customer&&<><div className="dialogue-heading"><span>{table}桌 · {order.customer}</span>{customer.phase!=='served'&&<button className="round-button" aria-label="再听一遍" onClick={()=>play(order.line.audio)}><Speaker/></button>}</div>
        {customer.phase==='served'?<><div className="receipt"><span className="receipt-title">早安小馆</span>{order.items.map(item=>{const f=content.foods.find(f=>f.id===item.foodId)!;return <p key={item.foodId}><button onClick={()=>lookup(f.word)}>{f.word.hanzi}</button><span>×{item.quantity}</span><span>{f.price*item.quantity}块</span></p>;})}<p className="receipt-total"><b>共 {total}块</b><span>找零 {order.paid-total}块</span></p><span className="thanks-chop">多谢</span></div>{tokens(content.thanks)}<button className="primary" onClick={close}>继续招呼 <span>→</span></button></>:
        customer.phase==='checkout'?<><p className="checkout-title">一共 {total}块，给你 {order.paid}块。</p><p className="subtle">找零</p><div className="change-display">{change}<span> 块</span></div><div className="money-buttons">{[1,2,5,10].map(n=><button key={n} onClick={()=>setChange(c=>c+n)}>+{n}块</button>)}<button onClick={()=>setChange(0)}>重来</button></div>{state.feedback==='wrong-change'&&<p role="status" className="gentle-feedback">再算一算，慢慢来。</p>}<button className="primary" onClick={completePayment}>递上找零 <span>→</span></button></>:
        <>{tokens(order.line)}<p className="subtle">点字听词 · 记住后去厨房取餐</p>{state.feedback==='wrong-food'&&<div className="gentle-feedback" role="status">{tokens(content.retry)}<p>可以回厨房放下，再拿一次。</p></div>}<div className="dialogue-actions"><button className="secondary" onClick={visitKitchen}>去厨房</button><button className="primary" onClick={()=>dispatch({type:'deliver',table})}>上菜 <span>→</span></button></div></>}
      </>}
      {panel==='kitchen'&&<><p className="eyebrow">厨房 · 热乎的早饭</p><h2>刚才，客人点了什么？</h2><p className="subtle">{state.customers.some(c=>c.phase==='ordered')?'点菜放上托盘，最多六份。':'先去桌边，听听客人点什么。'}</p><div className="food-grid">{content.foods.map(food=><div className="food-choice" key={food.id}><button className="food-pick" onClick={()=>dispatch({type:'pickup',foodId:food.id})} aria-label={`拿${food.word.hanzi}`} disabled={state.tray.length>=6||!state.customers.some(c=>c.phase==='ordered')}><FoodArt kind={food.kind}/><span>{food.word.hanzi}</span><small>{food.price}块</small><i>＋</i></button><button className="food-listen" aria-label={`听${food.word.hanzi}`} onClick={()=>lookup(food.word)}><Speaker/></button></div>)}</div><div className="kitchen-tray"><span>托盘 {state.tray.length}/6</span><div>{state.tray.map((id,i)=><button key={`${id}-${i}`} aria-label={`放回${content.foods.find(f=>f.id===id)!.word.hanzi}`} onClick={()=>dispatch({type:'return-food',index:i})}>{content.foods.find(f=>f.id===id)!.word.hanzi} <span>×</span></button>)}</div></div>{state.feedback==='full'&&<p role="status">托盘满了，先送一桌吧。</p>}<button className="primary" onClick={close}>端好了，去上菜 <span>→</span></button></>}
      {panel==='journal'&&<><p className="eyebrow">我的本子</p><h2>在小馆遇见的词。</h2><p className="subtle">{words.length} 个词 · 点一下，再听一遍</p>{words.length===0?<p className="journal-empty">听客人点餐时，点一个字，收进本子。</p>:<div className="journal-list">{words.map(w=><button key={w.id} onClick={()=>lookup(w)}><span>{w.hanzi}</span><small>听过 {state.journal[w.id].lookups} 次</small><Speaker/></button>)}</div>}</>}
      {audioError&&<p className="save-note" role="status">声音暂时没有播出，再点一次听听。</p>}
    </section></div>}
    {word&&<div className="word-popover" role="dialog" aria-label={`${word.hanzi}的意思`}><button className="close-button" onClick={()=>setWord(null)} aria-label="关闭词卡">×</button><span className="eyebrow">记在本子里</span><div className="word-card-title"><h2>{word.hanzi}</h2><button className="round-button" aria-label="听这个词" onClick={()=>play(word.audio)}><Speaker/></button></div>{content.foods.find(f=>f.word.id===word.id)&&<FoodArt kind={content.foods.find(f=>f.word.id===word.id)!.kind}/>}<p className="pinyin">{word.pinyin}</p><p className="gloss">{word.gloss}</p></div>}
    {state.ended&&panel==='none'&&!word&&<div className="modal-backdrop"><section className="paper-panel day-end" role="dialog" aria-modal="true" aria-label="今日小结"><p className="eyebrow">打烊了</p><h2>四桌早饭，一点新收获。</h2><div className="tally"><p><span>招呼客人</span><b>4 桌</b></p><p><span>小馆进账</span><b>{state.earnings} 块</b></p><p><span>本子里的词</span><b>{words.length} 个</b></p></div><p className="subtle">{state.level===1?'明天，要记住数量和两样菜了。':state.level===2?'明天，试试三样菜的点餐。':'明天，老朋友还会带来新点餐。'}</p><button className="primary" onClick={()=>{dispatch({type:'next-day'});close();}}>明天见 <span>→</span></button></section></div>}
  </div>;
}
