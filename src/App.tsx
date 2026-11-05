import { useCallback, useEffect, useRef, useState } from "react";
import type { Line, Position, Word } from "./contracts";
import { KITCHEN, TABLES } from "./contracts";
import { characterFor, content } from "./content";
import { contentWords } from "./content/words";
import {
  createGame,
  getOrder,
  orderTotal,
  isNear,
  canVisitKitchen,
} from "./game";
import RestaurantScene from "./scene/RestaurantScene";
import FoodArt from "./FoodArt";
import { loadGame, saveGame, validateSavedGame } from "./save";
import { createSession, reduceSession, type Session, type SessionAction } from "./opening";
import { startSession, type StartupRead } from "./startup";
import HospitalOpening from "./HospitalOpening";
import WordToken from "./WordToken";
import { nextDots, wordState } from "./recovery";
import { Speaker } from "./icons";
import { route } from "./navigation";
import { createPlayback, type PlaybackError } from "./audio/playback";
import { useAmbience, AmbienceControls } from "./audio/AmbienceControls";

const testMode =
  import.meta.env.DEV &&
  new URLSearchParams(location.search).get("test") === "1";
const opening = import.meta.env.DEV ? new URLSearchParams(location.search).get("opening") : null;
const requestedSeed = Number(new URLSearchParams(location.search).get("seed") || 42);
const seed = Number.isFinite(requestedSeed) ? requestedSeed : 42;
const testStart = () => createSession(content, seed, opening === "play" ? "opening" : "day");
const checkpointKey = "junyan-waiter-pending-v1";
const phases = {
  seated: "等候点餐",
  ordered: "等候上菜",
  checkout: "等候找零",
  served: "多谢",
};
const dayNames = ["", "第一天", "第二天", "第三天", "第四天", "第五天"];
const Book = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h7q3 0 3 3v14q-1-2-3-2H4Zm16 0h-3q-3 0-3 3m0 14q1-2 3-2h3Z" />
  </svg>
);
const Sun = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
  </svg>
);

export default function App() {
  const [session, setSession] = useState<Session>(testStart);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [idle] = useState(() => createGame(content, seed));
  const [openingRun, setOpeningRun] = useState(0);
  const state = session.phase === "day" ? session.game : idle;
  const stateRef = useRef(state);
  stateRef.current = state;
  const [ready, setReady] = useState(testMode);
  const [saveError, setSaveError] = useState(false);
  const [panel, setPanel] = useState<
    "none" | "table" | "kitchen" | "journal" | "help"
  >("help");
  const [table, setTable] = useState(1);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [dayExpanded, setDayExpanded] = useState(false);
  const [word, setWord] = useState<Word | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);
  const wordTrigger = useRef<HTMLButtonElement | null>(null);
  const panelTrigger = useRef<HTMLElement | null>(null);
  const wordOpen = word !== null;
  const [change, setChange] = useState(0);
  const [moving, setMoving] = useState(false);
  const [audioError, setAudioError] = useState<PlaybackError>(null);
  const dayEndOpen = state.ended && panel === "none" && !word;
  const ambience = useAmbience(ready && session.phase === "day");
  const playback = useRef<ReturnType<typeof createPlayback> | null>(null);
  if (!playback.current)
    playback.current = createPlayback((url) => new Audio(url), setAudioError, ambience.speaking);
  const motion = useRef<{ path: Position[]; arrive?: () => void } | null>(null);
  const dispatch = useCallback(
    (action: SessionAction) => {
      const previous = sessionRef.current;
      const next = reduceSession(previous, action, content);
      if (next === previous) return next;
      if (previous.phase === "day" && next.phase === "day") {
        const { game: before } = previous;
        const { game: after } = next;
        setFresh((dots) => nextDots(dots, before, action, after));
      }
      if (!testMode && action.type !== "move" && next.phase === "day") {
        try {
          localStorage.setItem(checkpointKey, JSON.stringify(next.game));
        } catch {
          try {
            localStorage.removeItem(checkpointKey);
          } catch {}
          setSaveError(true);
        }
      }
      sessionRef.current = next;
      if (next.phase === "day") stateRef.current = next.game;
      setSession(next);
      return next;
    },
    [],
  );
  const play = useCallback((url: string, onEnded?: () => void) => {
    playback.current!.play(import.meta.env.BASE_URL + url.slice(1), onEnded);
  }, []);
  useEffect(() => () => playback.current!.stop(), []);
  useEffect(() => {
    if (panel !== "table") playback.current!.stop();
  }, [panel]);
  useEffect(() => {
    if (!word) playback.current!.stop();
  }, [word]);
  useEffect(() => playback.current!.stop(), [state.day]);
  useEffect(() => {
    if (state.feedback === "wrong-food" || state.feedback === "wrong-change") {
      const order = getOrder(state, state.activeTable ?? 1, content);
      if (order) play(characterFor(order.customer).retry.audio);
    }
  }, [state.feedback, state.mistakes, state.activeTable, play]);
  useEffect(() => {
    if (testMode) return;
    let cancelled = false;
    let checkpoint = null;
    let localFailed = false;
    try {
      const pending = localStorage.getItem(checkpointKey);
      if (pending) checkpoint = validateSavedGame(JSON.parse(pending), content);
      if (checkpoint)
        localStorage.setItem(checkpointKey, JSON.stringify(checkpoint));
    } catch {
      localFailed = true;
    }
    const start = (read: StartupRead) => {
      const started = startSession(read, content, seed, opening === "skip");
      sessionRef.current = started.session;
      setSession(started.session);
      if (started.saveError) setSaveError(true);
      setReady(true);
    };
    // Recovery is already validated and must not wait behind another tab's IDB work.
    if (checkpoint) {
      start({ checkpoint, saved: null, failed: localFailed });
      return;
    }
    let settled = false;
    const finish = (saved: StartupRead["saved"], failed = false) => {
      if (cancelled || settled) return;
      settled = true;
      clearTimeout(timeout);
      start({ checkpoint: null, saved, failed: failed || localFailed });
    };
    // Queued native opens may emit neither blocked nor error. Once play starts,
    // a late snapshot must never replace the player's newer state.
    const timeout = setTimeout(() => finish(null, true), 1500);
    loadGame(content).then((saved) => finish(saved)).catch(() => finish(null, true));
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);
  useEffect(() => {
    if (!ready || testMode || session.phase !== "day") return;
    const timer = setTimeout(() => {
      const checkpoint = JSON.stringify(state);
      saveGame(state)
        .then(() => {
          if (localStorage.getItem(checkpointKey) === checkpoint)
            localStorage.removeItem(checkpointKey);
        })
        .catch(() => setSaveError(true));
    }, 350);
    return () => clearTimeout(timer);
  }, [state, ready, session.phase]);
  useEffect(() => {
    let frame: number;
    let previous = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      const task = motion.current;
      if (task) {
        const target = task.path[0];
        const p = stateRef.current.player;
        const dx = target.x - p.x,
          dy = target.y - p.y,
          d = Math.hypot(dx, dy),
          step = dt * 5;
        if (d <= Math.max(step, 0.06)) {
          dispatch({ type: "move", position: target });
          task.path.shift();
          if (!task.path.length) {
            motion.current = null;
            setMoving(false);
            task.arrive?.();
          }
        } else
          dispatch({
            type: "move",
            position: { x: p.x + (dx / d) * step, y: p.y + (dy / d) * step },
          });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dispatch]);
  const walk = useCallback((position: Position, arrive?: () => void) => {
    const path = route(stateRef.current.player, {
      x: Math.max(0, Math.min(12, position.x)),
      y: Math.max(0, Math.min(10, position.y)),
    });
    if (!path.length) return;
    setWord(null);
    setPanel("none");
    setMoving(true);
    motion.current = {
      path,
      arrive,
    };
  }, []);
  const visitTable = useCallback(
    (number: number) => {
      const target = TABLES.find((t) => t.table === number)!;
      const open = () => {
        setTable(number);
        setChange(0);
        dispatch({ type: "interact", table: number });
        setPanel("table");
        const order = getOrder(stateRef.current, number, content);
        if (
          order &&
          stateRef.current.customers.find((c) => c.table === number)?.phase !==
            "served"
        )
          play(order.line.audio);
      };
      if (isNear(stateRef.current.player, target)) open();
      else walk({ x: target.x + 1.4, y: target.y }, open);
    },
    [dispatch, play, walk],
  );
  const visitKitchen = useCallback(() => {
    const open = () => setPanel("kitchen");
    if (canVisitKitchen(stateRef.current)) open();
    else walk({ x: KITCHEN.x, y: KITCHEN.y + 1.3 }, open);
  }, [walk]);
  useEffect(() => {
    if (panel === "none" && !wordOpen) return;
    motion.current = null;
    setMoving(false);
  }, [panel, wordOpen]);
  useEffect(() => {
    if (!ready || (panel === "none" && !dayEndOpen)) return;
    const previous = panelTrigger.current;
    const dialog = document.querySelector<HTMLElement>(".paper-panel");
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      if (previous?.isConnected && !previous.closest("[inert]")) previous.focus();
    };
  }, [panel, dayEndOpen, ready, session.phase]);
  useEffect(() => {
    if (!wordOpen) return;
    const previous = wordTrigger.current;
    document.querySelector<HTMLButtonElement>(".word-popover button")?.focus();
    return () => previous?.focus();
  }, [wordOpen]);
  useEffect(() => {
    const dialog = document.querySelector<HTMLElement>(
      wordOpen ? ".word-popover" : ".paper-panel",
    );
    if (!dialog) return;
    if (!dialog.contains(document.activeElement)) {
      dialog.querySelector<HTMLButtonElement>("button")?.focus();
    }
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a[href],input",
        ),
      ];
      const first = controls[0],
        last = controls.at(-1);
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
    };
  }, [panel, wordOpen, dayEndOpen, ready, state.customers, session.phase]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (word) setWord(null);
        else if (sessionRef.current.phase === "day") {
          motion.current = null;
          setMoving(false);
          setPanel("none");
        }
        return;
      }
      if (
        !ready ||
        sessionRef.current.phase !== "day" ||
        dayEndOpen ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        panel !== "none" ||
        word ||
        (event.target instanceof HTMLElement &&
          (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) ||
            event.target.isContentEditable))
      )
        return;
      const directions: Record<string, [number, number]> = {
        ArrowUp: [-0.45, -0.45],
        w: [-0.45, -0.45],
        ArrowDown: [0.45, 0.45],
        s: [0.45, 0.45],
        ArrowLeft: [-0.45, 0.45],
        a: [-0.45, 0.45],
        ArrowRight: [0.45, -0.45],
        d: [0.45, -0.45],
      };
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        motion.current = null;
        setMoving(false);
        setPanel("none");
        setWord(null);
        const p = stateRef.current.player;
        dispatch({
          type: "move",
          position: { x: p.x + direction[0], y: p.y + direction[1] },
        });
      }
      if (event.key === " " || event.key.toLowerCase() === "e") {
        if (event.key === " " && event.target instanceof HTMLButtonElement)
          return;
        event.preventDefault();
        if (canVisitKitchen(stateRef.current)) visitKitchen();
        else {
          const near = TABLES.find((t) => isNear(t, stateRef.current.player));
          if (near) visitTable(near.table);
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [dispatch, visitTable, visitKitchen, panel, word, ready, dayEndOpen]);
  useEffect(() => {
    if (!testMode) return;
    const hooks = {
      getState: () => (sessionRef.current.phase === "day" ? sessionRef.current.game : null),
      getSession: () => sessionRef.current,
      dispatch,
      reset: () => {
        motion.current = null;
        setMoving(false);
        const next = testStart();
        sessionRef.current = next;
        setSession(next);
        setOpeningRun((run) => run + 1);
        setFresh([]);
        setWord(null);
        setPanel("none");
      },
      content,
    };
    (window as Window & { __TEST__?: typeof hooks }).__TEST__ = hooks;
    return () => {
      delete (window as Window & { __TEST__?: typeof hooks }).__TEST__;
    };
  }, [dispatch]);
  const lookup = (w: Word, trigger: HTMLButtonElement) => {
    wordTrigger.current = trigger;
    setWord(w);
    dispatch({ type: "lookup", wordId: w.id, now: Date.now() });
    play(w.audio);
  };
  const tokens = (line: Line) => (
    <div className="spoken">
      {line.tokens.map((w, i) => (
        <WordToken
          key={`${w.id}-${i}`}
          word={w}
          look={wordState(state.journal[w.id], fresh.includes(w.id))}
          onLookup={lookup}
        />
      ))}
    </div>
  );
  const order = getOrder(state, table, content);
  const character = order ? characterFor(order.customer) : undefined;
  const customer = state.customers.find((c) => c.table === table);
  const total = order ? orderTotal(order, content) : 0;
  const allWords = contentWords(content);
  const words = [
    ...new Map(
      allWords.filter((w) => state.journal[w.id]).map((w) => [w.id, w]),
    ).values(),
  ];
  const close = () => {
    setPanel("none");
    setWord(null);
  };
  const completePayment = () => {
    if (!order) return;
    dispatch({ type: "pay", table, change });
    if (change === order.paid - total) play(characterFor(order.customer).thanks.audio);
  };
  const activeCustomer = state.customers.find((entry) => entry.table === state.activeTable);
  const waitingCustomer = activeCustomer?.phase === "ordered"
    ? activeCustomer
    : state.customers.find((entry) => entry.phase === "ordered");
  const nextCustomer = state.customers.find((entry) => entry.phase === "checkout")
    ?? (state.tray.length > 0 ? waitingCustomer : undefined);
  const needsKitchen = !nextCustomer && Boolean(waitingCustomer);
  const nextTable = nextCustomer ?? state.customers.find((entry) => entry.phase === "seated");
  const rememberPanelTrigger = (event: { target: EventTarget | null }) => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLElement>(".topbar button, .topbar a, main button");
    if (trigger) panelTrigger.current = trigger;
  };
  if (!ready) return <main className="loading">早安，小馆正在开门。</main>;
  const wordCard = word && (
    <div
      className="word-popover"
      role="dialog"
      aria-modal="true"
      aria-label={`${word.hanzi}的意思`}
    >
      <button
        className="close-button"
        onClick={() => setWord(null)}
        aria-label="关闭词卡"
      >
        ×
      </button>
      <span className="eyebrow">记在本子里</span>
      <div className="word-card-title">
        <h2>{word.hanzi}</h2>
        <button
          className="round-button"
          aria-label="听这个词"
          onClick={() => play(word.audio)}
        >
          <Speaker />
        </button>
      </div>
      {content.foods.find((f) => f.word.id === word.id) && (
        <FoodArt
          kind={content.foods.find((f) => f.word.id === word.id)!.kind}
        />
      )}
      <p className="pinyin">{word.pinyin}</p>
    </div>
  );
  const brand = (
    <a className="brand" href={import.meta.env.BASE_URL} aria-label="君言首页">
      <span className="brand-seal">
        君<br />言
      </span>
      <span>
        君言<span className="brand-divider"> / </span>早安小馆
      </span>
    </a>
  );
  if (session.phase === "opening")
    return (
      <div className="app-shell">
        <header className="topbar" inert={wordOpen}>{brand}</header>
        <HospitalOpening
          key={openingRun}
          opening={session.opening}
          content={content}
          dispatch={dispatch}
          play={play}
          lookup={lookup}
          inert={wordOpen}
          onFinish={() => {
            dispatch({ type: "advance", now: Date.now() });
            setPanel("help");
          }}
        />
        {wordCard}
      </div>
    );
  return (
    <div className="app-shell" onFocusCapture={rememberPanelTrigger} onClickCapture={rememberPanelTrigger}>
      <header className="topbar" inert={panel !== "none" || wordOpen || dayEndOpen}>
        {brand}
        <nav aria-label="小馆">
          <AmbienceControls ambience={ambience} />
          <button
            onClick={() => {
              motion.current = null;
              setMoving(false);
              setPanel("journal");
              setWord(null);
            }}
          >
            <Book />
            <span>本子</span>
            <small>{words.length}</small>
          </button>
          <button
            className="help-button"
            aria-label="怎么玩"
            onClick={() => setPanel("help")}
          >
            怎么玩
          </button>
        </nav>
      </header>
      <main inert={panel !== "none" || wordOpen || dayEndOpen}>
        <div className="play-layout">
          <section className="world-panel" aria-label="早安小馆餐厅">
            <div className="world-caption">
              <button className="day-toggle" aria-expanded={dayExpanded} aria-controls="day-details" onClick={() => setDayExpanded(!dayExpanded)}>
                <Sun />
                <span>{dayNames[state.day] || `第${state.day}天`} · 早市</span>
                <span aria-hidden="true">{dayExpanded ? "−" : "+"}</span>
              </button>
              <span className="day-progress" aria-label={`招呼客人 ${state.served} / 4 桌`}>{state.served} / 4 桌</span>
            </div>
            <div className="day-details" id="day-details" hidden={!dayExpanded}>
              <span>小馆进账 {state.earnings} 块</span>
              <span>{state.level === 1 ? "一道菜" : state.level === 2 ? "两样菜" : "三样菜"}</span>
            </div>
            <RestaurantScene
              state={state}
              onMove={walk}
              onTable={visitTable}
              onKitchen={visitKitchen}
            />
            <div className="world-footer">
              <span className="next-hint" role="status">{moving ? "走过去…" : ""}</span>
              <button className="primary next-action" disabled={!needsKitchen && !nextTable} onClick={() => needsKitchen ? visitKitchen() : nextTable && visitTable(nextTable.table)}>
                {needsKitchen ? "去厨房取餐" : nextTable ? `${nextTable.table}桌 · ${nextTable.phase === "checkout" ? "找零" : nextTable.phase === "ordered" ? "上菜" : "听点餐"}` : "多谢"}<span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
          <section className="service-strip" aria-label="今日客人和托盘">
            <div className="customer-list" role="group" aria-label="今日客人">
              {state.customers.map((c) => {
                const o = getOrder(state, c.table, content);
                return (
                  <button
                    key={c.table}
                    className={`customer-row ${c.phase === "served" ? "customer-done" : ""}`}
                    onClick={() => visitTable(c.table)}
                    aria-label={`${c.table}桌 ${o?.customer} ${phases[c.phase]}`}
                  >
                    <span className="table-number">{c.table}桌</span>
                    <span className="customer-info">
                      <b>{o?.customer}</b>
                      <small>{phases[c.phase]}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="tray-section" role="group" aria-label="托盘">
              <div className="section-label">
                <span>托盘</span>
                <span>{state.tray.length} / 6</span>
              </div>
              <div className="tray">
                {state.tray.map((id, i) => {
                    const food = content.foods.find((f) => f.id === id)!;
                    return (
                      <button
                        key={`${id}-${i}`}
                        onClick={(event) => lookup(food.word, event.currentTarget)}
                        className="tray-item"
                        aria-label={`查看${food.word.hanzi}`}
                      >
                        <FoodArt kind={food.kind} />
                        <span>{food.word.hanzi}</span>
                      </button>
                    );
                  })}
              </div>
              <button className="kitchen-link" aria-label="厨房" onClick={visitKitchen}>
                厨房 <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        </div>
        {saveError && (
          <p role="status" className="save-note">
            本次进度暂时无法保存，请保持页面打开。
          </p>
        )}
      </main>
      {panel !== "none" && (
        <div className="modal-backdrop" onClick={close} inert={wordOpen}>
          <section
            className={`paper-panel ${panel === "kitchen" ? "kitchen-panel" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === "kitchen"
                ? "厨房"
                : panel === "journal"
                  ? "本子"
                  : panel === "help"
                    ? "怎么玩"
                    : `${table}桌点餐`
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-button" aria-label="关闭" onClick={close}>
              ×
            </button>
            {panel === "help" && (
              <div className="learning-help">
                <div className="help-line">
                  {tokens(content.help.welcome)}
                  <button className="round-button" aria-label={`听${content.help.welcome.tokens.map((token) => token.hanzi).join("")}`} onClick={() => play(content.help.welcome.audio)}><Speaker /></button>
                </div>
                <button className="primary" onClick={close}>
                  开门迎客 <span>→</span>
                </button>
                <button className="help-disclosure" aria-expanded={helpExpanded} aria-controls="help-details" onClick={() => setHelpExpanded(!helpExpanded)}>
                  怎么玩 <span aria-hidden="true">{helpExpanded ? "−" : "+"}</span>
                </button>
                <div id="help-details">
                  {helpExpanded && (
                    <>
                      <div className="help-line">
                        {tokens(content.help.lookup)}
                        <button className="round-button" aria-label={`听${content.help.lookup.tokens.map((token) => token.hanzi).join("")}`} onClick={() => play(content.help.lookup.audio)}><Speaker /></button>
                      </div>
                      <ol className="learning-help-steps">
                        {content.help.steps.map((step, index) => (
                          <li key={step.id} data-help-step={step.id}>
                            <span className="help-step-number" aria-hidden="true">{["一", "二", "三"][index]}</span>
                            <svg className="help-picture" viewBox="0 0 240 76" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {step.id === "order" ? <>
                                <circle cx="35" cy="17" r="9" /><path d="M20 42q0-18 15-18t15 18M12 46h66M22 46v22m45-22v22" />
                                <path d="M60 15h53v26H86l-10 9v-9H60zM125 39h25m-7-7 7 7-7 7M164 19h54v39h-54zM174 30h34m-34 10h25m-25 10h30" />
                                <path d="m47 70-6-10q-3-6 1-6l6 5V42q0-5 5-3v17l8-2q5 0 5 5v11" />
                              </> : step.id === "kitchen" ? <>
                                <path d="M12 46h81v21H12zM20 46V28h64v18M18 28q34-25 68 0M35 14q-5-5 0-10m16 9q-5-5 0-10m16 11q-5-5 0-10M108 39h25m-7-7 7 7-7 7M151 56h77l-8 10h-61z" />
                                <ellipse cx="178" cy="43" rx="17" ry="12" /><path d="M165 41q13-22 26 0m-15-9 2 10M205 29h15l-2 25h-11z" />
                              </> : <>
                                <path d="M8 42h65l-7 10H15zM18 41q0-20 20-20t20 20M30 23l8 10 8-10M85 39h22m-7-7 7 7-7 7M122 50h64m-55 0v18m46-18v18" />
                                <ellipse cx="152" cy="42" rx="17" ry="6" /><circle cx="169" cy="14" r="8" /><path d="M157 32q0-11 12-11t12 11M204 13v20m-5-7 5 7 5-7" />
                                <circle cx="204" cy="46" r="10" /><circle cx="220" cy="61" r="10" /><path d="M201 43h6m-6 6h6m10 9h6m-6 6h6" />
                              </>}
                            </svg>
                            <div className="help-line">
                              {tokens(step.line)}
                              <button className="round-button" aria-label={`听${step.line.tokens.map((token) => token.hanzi).join("")}`} onClick={() => play(step.line.audio)}><Speaker /></button>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="help-line">
                        {tokens(content.help.pace)}
                        <button className="round-button" aria-label="听慢慢来" onClick={() => play(content.help.pace.audio)}><Speaker /></button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {panel === "table" && order && customer && character && (
              <>
                <div className="dialogue-heading">
                  <span>
                    {table}桌 · {order.customer}
                  </span>
                  <button
                      className="round-button"
                      aria-label="再听一遍"
                      onClick={() => play(customer.phase === "served" ? character.thanks.audio : order.line.audio)}
                    >
                      <Speaker />
                    </button>
                </div>
                {customer.phase === "served" ? (
                  <>
                    <div className="receipt">
                      <span className="receipt-title">早安小馆</span>
                      {order.items.map((item) => {
                        const f = content.foods.find(
                          (f) => f.id === item.foodId,
                        )!;
                        return (
                          <p key={item.foodId}>
                            <button onClick={(event) => lookup(f.word, event.currentTarget)}>
                              {f.word.hanzi}
                            </button>
                            <span>×{item.quantity}</span>
                            <span>{f.price * item.quantity}块</span>
                          </p>
                        );
                      })}
                      <p className="receipt-total">
                        <b>共 {total}块</b>
                        <span>找零 {order.paid - total}块</span>
                      </p>
                      <span className="thanks-chop">多谢</span>
                    </div>
                    {tokens(character.thanks)}
                    <button className="primary" onClick={close}>
                      继续招呼 <span>→</span>
                    </button>
                  </>
                ) : (
                  <>
                    {customer.phase === "ordered" && (
                      <div className="character-greeting">
                        {tokens(character.greeting)}
                        <button className="round-button" aria-label="听招呼" onClick={() => play(character.greeting.audio)}><Speaker /></button>
                      </div>
                    )}
                    {tokens(order.line)}
                    {customer.phase === "checkout" ? (
                      <>
                        <p className="checkout-title">
                          共 {total}块 · 收到 {order.paid}块
                        </p>
                        <p className="subtle">找零</p>
                        <div className="change-display">
                          {change}
                          <span> 块</span>
                        </div>
                        <div className="money-buttons">
                          {[1, 2, 5, 10].map((n) => (
                            <button key={n} onClick={() => setChange((c) => c + n)}>
                              +{n}块
                            </button>
                          ))}
                          <button onClick={() => setChange(0)}>重来</button>
                        </div>
                        {state.feedback === "wrong-change" && (
                          <div role="status" className="gentle-feedback">
                            {tokens(character.retry)}
                            <p>再算一算，慢慢来。</p>
                          </div>
                        )}
                        <button className="primary" onClick={completePayment}>
                          递上找零 <span>→</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="subtle">点字听词 · 记住后去厨房取餐</p>
                        {state.feedback === "wrong-food" && (
                          <div className="gentle-feedback" role="status">
                            {tokens(character.retry)}
                            <p>可以回厨房放下，再拿一次。</p>
                          </div>
                        )}
                        <div className="dialogue-actions">
                          <button className="secondary" onClick={visitKitchen}>
                            去厨房
                          </button>
                          <button
                            className="primary"
                            onClick={() => dispatch({ type: "deliver", table, now: Date.now() })}
                          >
                            上菜 <span>→</span>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {panel === "kitchen" && (
              <>
                <p className="eyebrow">厨房 · 热乎的早饭</p>
                <h2>刚才，客人点了什么？</h2>
                <p className="subtle">
                  {state.customers.some((c) => c.phase === "ordered")
                    ? "一次先送一桌，托盘最多六份。"
                    : "先去桌边，听听客人点什么。"}
                </p>
                <div className="food-grid">
                  {content.foods.map((food) => (
                    <div className="food-choice" key={food.id}>
                      <button
                        className="food-pick"
                        onClick={() =>
                          dispatch({ type: "pickup", foodId: food.id })
                        }
                        aria-label={`拿${food.word.hanzi}`}
                        disabled={
                          state.tray.length >= 6 ||
                          !state.customers.some((c) => c.phase === "ordered")
                        }
                      >
                        <FoodArt kind={food.kind} />
                        <span>{food.word.hanzi}</span>
                        <small>{food.price}块</small>
                        <i>＋</i>
                      </button>
                      <button
                        className="food-listen"
                        aria-label={`听${food.word.hanzi}`}
                        onClick={(event) => lookup(food.word, event.currentTarget)}
                      >
                        <Speaker />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="kitchen-tray">
                  <span>托盘 {state.tray.length}/6</span>
                  <div>
                    {state.tray.map((id, i) => (
                      <button
                        key={`${id}-${i}`}
                        aria-label={`放回${content.foods.find((f) => f.id === id)!.word.hanzi}`}
                        onClick={() =>
                          dispatch({ type: "return-food", index: i })
                        }
                      >
                        {content.foods.find((f) => f.id === id)!.word.hanzi}{" "}
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                </div>
                {state.feedback === "full" && (
                  <p role="status">托盘满了，先送一桌吧。</p>
                )}
                <button className="primary" onClick={close}>
                  端好了，去上菜 <span>→</span>
                </button>
              </>
            )}
            {panel === "journal" && (
              <>
                <p className="eyebrow">我的本子</p>
                <h2>在小馆遇见的词。</h2>
                <p className="subtle">{words.length} 个词 · 点一下，再听一遍</p>
                {words.length === 0 ? (
                  <p className="journal-empty">
                    听客人点餐时，点一个字，收进本子。
                  </p>
                ) : (
                  <div className="journal-list">
                    {words.map((w) => (
                      <button key={w.id} onClick={(event) => lookup(w, event.currentTarget)}>
                        <span>{w.hanzi}</span>
                        {state.journal[w.id].lookups > 0 && (
                          <small>听过 {state.journal[w.id].lookups} 次</small>
                        )}
                        <Speaker />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {audioError && (
              <p className="save-note" role="status">
                {audioError === "policy"
                  ? "点一下喇叭，再听一遍。"
                  : "声音暂时没有播出，再点一次听听。"}
              </p>
            )}
          </section>
        </div>
      )}
      {wordCard}
      {dayEndOpen && (
        <div className="modal-backdrop">
          <section
            className="paper-panel day-end"
            role="dialog"
            aria-modal="true"
            aria-label="今日小结"
          >
            <p className="eyebrow">打烊了</p>
            <h2>四桌早饭，一点新收获。</h2>
            <div className="tally">
              <p>
                <span>招呼客人</span>
                <b>4 桌</b>
              </p>
              <p>
                <span>小馆进账</span>
                <b>{state.earnings} 块</b>
              </p>
              <p>
                <span>本子里的词</span>
                <b>{words.length} 个</b>
              </p>
            </div>
            <p className="subtle">
              {state.level === 1
                ? "明天，要记住数量和两样菜了。"
                : state.level === 2
                  ? "明天，试试三样菜的点餐。"
                  : "明天，老朋友还会带来新点餐。"}
            </p>
            <button
              className="primary"
              onClick={() => {
                dispatch({ type: "next-day" });
                close();
              }}
            >
              明天见 <span>→</span>
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
