import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Word } from "../../contracts";
import { content } from "../../content";
import "../../../docs/design/tokens.css";
import "../../style.css";
import { ContextualInteraction, KitchenControls, RestaurantTableControls, WorldPocketBar } from "./index";
import "./harness.css";

function Harness() {
  const [open, setOpen] = useState(false);
  const [kitchen, setKitchen] = useState(false);
  const [change, setChange] = useState(0);
  const [tray, setTray] = useState<string[]>([]);
  const [lookup, setLookup] = useState<{word:Word;trigger:HTMLButtonElement}|null>(null);
  const [notice, setNotice] = useState("");
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const order = content.orders[0];
  const long = new URLSearchParams(location.search).has("long");
  const words = {
    onLookup: (word: Word, element: HTMLButtonElement) => { setNotice(word.text); setLookup({word,trigger:element}); },
    onPlay: () => setNotice("replay"),
    recoveredWordIds: order.line.tokens.map(word => word.id),
  };
  return <main className={`ui-harness ${new URLSearchParams(location.search).get("placement") === "top" ? "placement-top" : ""}`}>
    <img className="harness-world" src="/docs/evidence/0090/world-phone.png" alt="" />
    <button className="harness-anchor" onClick={event => { setTrigger(event.currentTarget); setOpen(true); }}>1桌</button>
    <output className="harness-notice" data-notice>{notice}</output>
    {open && <ContextualInteraction target={kitchen ? { kind: "kitchen" } : { kind: "table", table: 1 }} suspended={lookup !== null} title={kitchen ? "厨房" : `1桌 · ${order.customer}`}
      dialogue={kitchen ? undefined : { current: { line: order.line }, history: long ? Array.from({ length: 7 }, () => ({ line: order.line })) : [] }} {...words} onClose={() => setOpen(false)} returnFocusTo={trigger}
      actions={kitchen ? [{ id: "close", control: <button onClick={() => setOpen(false)}>端好了，去上菜</button> }] : [
        { id: "kitchen", control: <button onClick={() => setKitchen(true)}>去厨房</button> },
        { id: "pay", control: <button onClick={() => setNotice(`pay-${change}`)}>递上找零</button> },
      ]}>
      {kitchen ? <KitchenControls foods={content.foods} tray={tray} pickupEnabled={tray.length < 6} trayHeading={<>托盘 {tray.length}/6</>} onPickup={id => setTray([...tray, id])} onReturn={index => setTray(tray.filter((_, i) => i !== index))} {...words} /> :
        <RestaurantTableControls phase="checkout" order={order} foods={content.foods} summary={<>共 4块 · 收到 {order.paid}块</>} changeLabel={<>找零 {change}块</>} resetControl={<button onClick={() => setChange(0)}>重来</button>} receiptSummary={null} thanks={null} change={change} onChange={setChange} {...words} />}
    </ContextualInteraction>}
    {lookup && <div className="word-popover" role="dialog" aria-label={`${lookup.word.text}的意思`} onKeyDown={event => {
      if (event.key === "Escape") { event.stopPropagation(); setLookup(null); requestAnimationFrame(() => lookup.trigger.focus()); }
    }}><button autoFocus aria-label="关闭词卡" onClick={() => { setLookup(null); requestAnimationFrame(() => lookup.trigger.focus()); }}>×</button><h2>{lookup.word.text}</h2><p>{lookup.word.pronunciation}</p></div>}
    <WorldPocketBar journalControl={<button onClick={() => setNotice("journal")}>本子 <span>3</span></button>} trayControl={<button onClick={() => { setKitchen(true); setOpen(true); }}>托盘 <span>{tray.length}/6</span></button>} />
  </main>;
}

createRoot(document.getElementById("root")!).render(<Harness />);
