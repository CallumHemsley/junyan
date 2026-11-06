import { useCallback, useEffect, useRef, useState } from "react";
import type { Line, Position, Word } from "./contracts";
import { KITCHEN, TABLES } from "./contracts";
import { characterFor } from "./content";
import { content } from "./neighbourhood/registry";
import Neighbourhood, { LocationNavigation, NeighbourhoodGifts } from "./neighbourhood/Neighbourhood";
import FeatureLine from "./neighbourhood/FeatureLine";
import { lineById as apartmentLines } from "./features/apartment/content";
import { createNeighbourhood } from "./neighbourhood/model";
import type { LocationId } from "./neighbourhood/contracts";
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
import { checkpointKey as getCheckpointKey, loadGame, saveGame, validateSavedGame } from "./save";
import { lineText } from "./language";
import { ui } from "./language/ui";
import WordLine from "./WordLine";
import { createSession, reduceSession, type Session, type SessionAction } from "./opening";
import { startSession, type StartupRead } from "./startup";
import HospitalOpening from "./HospitalOpening";
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
const checkpointKey = getCheckpointKey(content.language);
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
  const neighbourhood = state.neighbourhood ?? createNeighbourhood(state.day);
  const locationId = neighbourhood.location;
  const [giftNotice, setGiftNotice] = useState(false);
  const dayEndOpen = locationId === "restaurant" && state.ended && panel === "none" && !word;
  const ambience = useAmbience(ready && session.phase === "day" && locationId === "restaurant");
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
        if (before.neighbourhood?.location !== after.neighbourhood?.location) {
          motion.current = null;
          playback.current?.stop();
          setMoving(false);
          setWord(null);
          setPanel("none");
          setGiftNotice(false);
        }
        if (action.type === "claim-neighbourhood-gift") setGiftNotice(true);
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
  const playLine = useCallback((line: Line) => play(line.audio), [play]);
  const acknowledgeRecovery = useCallback(() => {}, []);
  useEffect(() => () => playback.current!.stop(), []);
  useEffect(() => {
    if (panel !== "table") playback.current!.stop();
  }, [panel]);
  useEffect(() => {
    if (!word) playback.current!.stop();
  }, [word]);
  useEffect(() => playback.current!.stop(), [state.day]);
  useEffect(() => {
    if (locationId === "restaurant" && (state.feedback === "wrong-food" || state.feedback === "wrong-change")) {
      const order = getOrder(state, state.activeTable ?? 1, content);
      if (order) play(characterFor(order.customer).retry.audio);
    }
  }, [state.feedback, state.mistakes, state.activeTable, play, locationId]);
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
      if (started.session.phase === "day" && (started.session.game.neighbourhood?.location ?? "restaurant") !== "restaurant") setPanel("none");
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
      saveGame(state, content.language)
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
    const blocked = [...document.querySelectorAll<HTMLElement>(
      ".app-shell button, .app-shell a[href], .app-shell input, .app-shell canvas",
    )].filter(element => !element.closest("[data-word-lookup], .word-popover, [inert]"));
    blocked.forEach(element => { element.inert = true; });
    return () => { blocked.forEach(element => { element.inert = false; }); };
  }, [wordOpen]);
  useEffect(() => {
    if (!wordOpen) return;
    document.querySelector<HTMLButtonElement>(".word-popover button")?.focus();
    return () => {
      const latest = wordTrigger.current;
      if (latest?.isConnected && !latest.closest("[inert]")) latest.focus();
    };
  }, [wordOpen]);
  useEffect(() => {
    const dialog = document.querySelector<HTMLElement>(".paper-panel");
    if (!dialog && !wordOpen) return;
    const controls = () => [...document.querySelectorAll<HTMLElement>(
      wordOpen
        ? "[data-word-lookup], .word-popover button"
        : ".paper-panel button:not(:disabled), .paper-panel a[href], .paper-panel input",
    )].filter(element => !element.closest("[inert]") && element.getClientRects().length > 0);
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const available = controls();
      const index = available.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const next = index < 0 ? (event.shiftKey ? available.length - 1 : 0)
        : (index + (event.shiftKey ? -1 : 1) + available.length) % available.length;
      available[next]?.focus();
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [panel, wordOpen, dayEndOpen, ready, session.phase]);
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
        locationId !== "restaurant" ||
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
  }, [dispatch, visitTable, visitKitchen, panel, word, ready, dayEndOpen, locationId]);
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
  useEffect(() => {
    if (!ready || session.phase !== "day") return;
    document.querySelector<HTMLElement>("[data-location-heading]")?.focus();
  }, [locationId, ready, session.phase]);
  const visitLocation = (location: LocationId) => dispatch({type:"visit-location",location});
  const lookup = (w: Word, trigger: HTMLButtonElement) => {
    wordTrigger.current = trigger;
    setWord(w);
    dispatch({ type: "lookup", wordId: w.id, now: Date.now() });
    play(w.audio);
  };
  const tokens = (line: Line) => (
    <div className="spoken">
      <WordLine line={line} look={(w) => wordState(state.journal[w.id], fresh.includes(w.id))} onLookup={lookup} />
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
  const guardWordCard = (event: { target: EventTarget | null; preventDefault: () => void; stopPropagation: () => void }) => {
    if (wordOpen && event.target instanceof Element &&
        !event.target.closest("[data-word-lookup], .word-popover")) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  if (!ready) return <main className="loading">{ui.loading}</main>;
  const audioNotice = audioError && <p className="save-note" role="status">{audioError === "policy" ? ui.audioPolicy : ui.audioUnavailable}</p>;
  const wordCard = word && (
    <div
      className="word-popover"
      role="dialog"
      aria-modal="false"
      aria-label={ui.wordMeaning(word.text)}
    >
      <button
        className="close-button"
        onClick={() => setWord(null)}
        aria-label={ui.closeWord}
      >
        ×
      </button>
      <span className="eyebrow">{ui.noted}</span>
      <div className="word-card-title">
        <h2 aria-live="polite">{word.text}</h2>
        <button
          className="round-button"
          aria-label={ui.listenWord}
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
      {word.pronunciation && <p className="pronunciation pinyin">{word.pronunciation}</p>}
    </div>
  );
  const brand = (
    <a className="brand" href={import.meta.env.BASE_URL} aria-label={ui.home}>
      <span className="brand-seal">
        {ui.seal.map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)}
      </span>
      <span>
        {ui.brand}<span className="brand-divider"> / </span>{ui.restaurant}
      </span>
    </a>
  );
  if (session.phase === "opening")
    return (
      <div className={`app-shell${wordOpen ? " word-card-open" : ""}`} onClickCapture={guardWordCard}>
        <header className="topbar">{brand}</header>
        <HospitalOpening
          key={openingRun}
          opening={session.opening}
          content={content}
          dispatch={dispatch}
          play={play}
          lookup={lookup}
          inert={false}
          onFinish={() => {
            dispatch({ type: "advance", now: Date.now() });
            setPanel("help");
          }}
        />
        {wordCard}
      </div>
    );
  return (
    <div className={`app-shell${wordOpen ? " word-card-open" : ""}`} onFocusCapture={rememberPanelTrigger} onClickCapture={(event) => { guardWordCard(event); rememberPanelTrigger(event); }}>
      <header className="topbar" inert={panel !== "none" || dayEndOpen}>
        {brand}
        <nav aria-label={ui.navigation}>
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
            <span>{ui.journal}</span>
            <small>{words.length}</small>
          </button>
          <button
            className="help-button"
            aria-label={ui.help}
            onClick={() => setPanel("help")}
          >
            {ui.help}
          </button>
        </nav>
      </header>
      <main inert={panel !== "none" || dayEndOpen} data-location={locationId}>
        <LocationNavigation location={locationId} onVisit={visitLocation}/>
        {locationId === "restaurant" ? <div className="play-layout">
          <section className="world-panel" aria-label={ui.restaurantRegion}>
            <div className="world-caption">
              <button className="day-toggle" aria-expanded={dayExpanded} aria-controls="day-details" onClick={() => setDayExpanded(!dayExpanded)}>
                <Sun />
                <span>{ui.marketDay(state.day)}</span>
                <span aria-hidden="true">{dayExpanded ? "−" : "+"}</span>
              </button>
              <span className="day-progress" aria-label={ui.dayProgressLabel(state.served)}>{ui.dayProgress(state.served)}</span>
            </div>
            <div className="day-details" id="day-details" hidden={!dayExpanded}>
              <span>{ui.earnings(state.earnings)}</span>
              <span>{ui.dishes(state.level)}</span>
            </div>
            <RestaurantScene
              state={state}
              onMove={walk}
              onTable={visitTable}
              onKitchen={visitKitchen}
            />
            <div className="world-footer">
              <span className="next-hint" role="status">{moving ? ui.walking : ""}</span>
              <button className="primary next-action" disabled={!needsKitchen && !nextTable} onClick={() => needsKitchen ? visitKitchen() : nextTable && visitTable(nextTable.table)}>
                {needsKitchen ? ui.collectFood : nextTable ? ui.nextTable(nextTable.table, nextTable.phase) : ui.thanks}<span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
          <section className="service-strip" aria-label={ui.serviceRegion}>
            <div className="customer-list" role="group" aria-label={ui.customers}>
              {state.customers.map((c) => {
                const o = getOrder(state, c.table, content);
                return (
                  <button
                    key={c.table}
                    className={`customer-row ${c.phase === "served" ? "customer-done" : ""}`}
                    onClick={() => visitTable(c.table)}
                    aria-label={ui.customer(c.table, o?.customer ?? "", c.phase)}
                  >
                    <span className="table-number">{ui.table(c.table)}</span>
                    <span className="customer-info">
                      <b>{o?.customer}</b>
                      <small>{ui.phases[c.phase]}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="tray-section" role="group" aria-label={ui.tray}>
              <div className="section-label">
                <span>{ui.tray}</span>
                <span>{state.tray.length} / 6</span>
              </div>
              <div className="tray">
                {state.tray.map((id, i) => {
                    const food = content.foods.find((f) => f.id === id)!;
                    return (
                      <button
                        key={`${id}-${i}`}
                        data-word-lookup onClick={(event) => lookup(food.word, event.currentTarget)}
                        className="tray-item"
                        aria-label={ui.view(food.word.text)}
                      >
                        <FoodArt kind={food.kind} />
                        <span>{food.word.text}</span>
                      </button>
                    );
                  })}
              </div>
              <button className="kitchen-link" aria-label={ui.kitchen} onClick={visitKitchen}>
                {ui.kitchen} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        </div>
        : <Neighbourhood state={neighbourhood} day={state.day} onAction={dispatch} onLookup={lookup} onPlay={playLine} onRecover={acknowledgeRecovery}
            recoveredWordIds={Object.keys(state.journal).filter(id => state.journal[id].recovered)} freshWordIds={fresh}/>}
        <NeighbourhoodGifts state={neighbourhood} onClaim={giftId => {
          const before = sessionRef.current;
          const next = dispatch({type:"claim-neighbourhood-gift",giftId});
          if (next !== before) playLine(apartmentLines.gift);
        }}/>
        {giftNotice && <div className="neighbourhood-gift-note" role="status"><FeatureLine line={apartmentLines.gift} onLookup={lookup} onPlay={playLine}
          recoveredWordIds={Object.keys(state.journal).filter(id => state.journal[id].recovered)} freshWordIds={fresh}/></div>}
        {locationId !== "restaurant" && panel === "none" && audioNotice}
        {saveError && (
          <p role="status" className="save-note">
            {ui.saveUnavailable}
          </p>
        )}
      </main>
      {panel !== "none" && (
        <div className="modal-backdrop" onClick={close}>
          <section
            className={`paper-panel ${panel === "kitchen" ? "kitchen-panel" : ""}`}
            role="dialog"
            aria-modal={!wordOpen}
            aria-label={
              panel === "kitchen"
                ? ui.kitchen
                : panel === "journal"
                  ? ui.journal
                  : panel === "help"
                    ? ui.help
                    : ui.tableOrder(table)
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-button" aria-label={ui.close} onClick={close}>
              ×
            </button>
            {panel === "help" && (
              <div className="learning-help">
                <div className="help-line">
                  {tokens(content.help.welcome)}
                  <button className="round-button" aria-label={ui.listen(lineText(content.help.welcome))} onClick={() => play(content.help.welcome.audio)}><Speaker /></button>
                </div>
                <button className="primary" onClick={close}>
                  {ui.openRestaurant} <span>→</span>
                </button>
                <button className="help-disclosure" aria-expanded={helpExpanded} aria-controls="help-details" onClick={() => setHelpExpanded(!helpExpanded)}>
                  {ui.help} <span aria-hidden="true">{helpExpanded ? "−" : "+"}</span>
                </button>
                <div id="help-details">
                  {helpExpanded && (
                    <>
                      <div className="help-line">
                        {tokens(content.help.lookup)}
                        <button className="round-button" aria-label={ui.listen(lineText(content.help.lookup))} onClick={() => play(content.help.lookup.audio)}><Speaker /></button>
                      </div>
                      <ol className="learning-help-steps">
                        {content.help.steps.map((step, index) => (
                          <li key={step.id} data-help-step={step.id}>
                            <span className="help-step-number" aria-hidden="true">{ui.helpStep(index)}</span>
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
                              <button className="round-button" aria-label={ui.listen(lineText(step.line))} onClick={() => play(step.line.audio)}><Speaker /></button>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="help-line">
                        {tokens(content.help.pace)}
                        <button className="round-button" aria-label={ui.listen(lineText(content.help.pace))} onClick={() => play(content.help.pace.audio)}><Speaker /></button>
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
                    {ui.tableCustomer(table, order.customer)}
                  </span>
                  <button
                      className="round-button"
                      aria-label={ui.replay}
                      onClick={() => play(customer.phase === "served" ? character.thanks.audio : order.line.audio)}
                    >
                      <Speaker />
                    </button>
                </div>
                {customer.phase === "served" ? (
                  <>
                    <div className="receipt">
                      <span className="receipt-title">{ui.restaurant}</span>
                      {order.items.map((item) => {
                        const f = content.foods.find(
                          (f) => f.id === item.foodId,
                        )!;
                        return (
                          <p key={item.foodId}>
                            <button data-word-lookup onClick={(event) => lookup(f.word, event.currentTarget)}>
                              {f.word.text}
                            </button>
                            <span>×{item.quantity}</span>
                            <span>{ui.money(f.price * item.quantity)}</span>
                          </p>
                        );
                      })}
                      <p className="receipt-total">
                        <b>{ui.total(total)}</b>
                        <span>{ui.change(order.paid - total)}</span>
                      </p>
                      <span className="thanks-chop">{ui.thanks}</span>
                    </div>
                    {tokens(character.thanks)}
                    <button className="primary" autoFocus onClick={close}>
                      {ui.continueServing} <span>→</span>
                    </button>
                  </>
                ) : (
                  <>
                    {customer.phase === "ordered" && (
                      <div className="character-greeting">
                        {tokens(character.greeting)}
                        <button className="round-button" aria-label={ui.listenGreeting} onClick={() => play(character.greeting.audio)}><Speaker /></button>
                      </div>
                    )}
                    {tokens(order.line)}
                    {customer.phase === "checkout" ? (
                      <>
                        <p className="checkout-title">
                          {ui.checkout(total, order.paid)}
                        </p>
                        <p className="subtle">{ui.changeLabel}</p>
                        <div className="change-display">
                          {change}
                          <span> {ui.moneyUnit}</span>
                        </div>
                        <div className="money-buttons">
                          {[1, 2, 5, 10].map((n) => (
                            <button key={n} onClick={() => setChange((c) => c + n)}>
                              +{ui.money(n)}
                            </button>
                          ))}
                          <button onClick={() => setChange(0)}>{ui.resetChange}</button>
                        </div>
                        {state.feedback === "wrong-change" && (
                          <div role="status" className="gentle-feedback">
                            {tokens(character.retry)}
                            <p>{ui.retryChange}</p>
                          </div>
                        )}
                        <button className="primary" onClick={completePayment}>
                          {ui.giveChange} <span>→</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="subtle">{ui.orderHint}</p>
                        {state.feedback === "wrong-food" && (
                          <div className="gentle-feedback" role="status">
                            {tokens(character.retry)}
                            <p>{ui.retryFood}</p>
                          </div>
                        )}
                        <div className="dialogue-actions">
                          <button className="secondary" onClick={visitKitchen}>
                            {ui.visitKitchen}
                          </button>
                          <button
                            className="primary"
                            onClick={() => dispatch({ type: "deliver", table, now: Date.now() })}
                          >
                            {ui.deliver} <span>→</span>
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
                <p className="eyebrow">{ui.kitchenEyebrow}</p>
                <h2>{ui.kitchenQuestion}</h2>
                <p className="subtle">
                  {state.customers.some((c) => c.phase === "ordered")
                    ? ui.kitchenHint
                    : ui.kitchenNoOrder}
                </p>
                <div className="food-grid">
                  {content.foods.map((food) => (
                    <div className="food-choice" key={food.id}>
                      <button
                        className="food-pick"
                        onClick={() =>
                          dispatch({ type: "pickup", foodId: food.id })
                        }
                        aria-label={ui.take(food.word.text)}
                        disabled={
                          state.tray.length >= 6 ||
                          !state.customers.some((c) => c.phase === "ordered")
                        }
                      >
                        <FoodArt kind={food.kind} />
                        <span>{food.word.text}</span>
                        <small>{ui.money(food.price)}</small>
                        <i>＋</i>
                      </button>
                      <button
                        className="food-listen"
                        aria-label={ui.listen(food.word.text)}
                        data-word-lookup onClick={(event) => lookup(food.word, event.currentTarget)}
                      >
                        <Speaker />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="kitchen-tray">
                  <span>{ui.trayCount(state.tray.length)}</span>
                  <div>
                    {state.tray.map((id, i) => (
                      <button
                        key={`${id}-${i}`}
                        aria-label={ui.returnFood(content.foods.find((f) => f.id === id)!.word.text)}
                        onClick={() =>
                          dispatch({ type: "return-food", index: i })
                        }
                      >
                        {content.foods.find((f) => f.id === id)!.word.text}{" "}
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                </div>
                {state.feedback === "full" && (
                  <p role="status">{ui.trayFull}</p>
                )}
                <button className="primary" onClick={close}>
                  {ui.readyToDeliver} <span>→</span>
                </button>
              </>
            )}
            {panel === "journal" && (
              <>
                <p className="eyebrow">{ui.journalEyebrow}</p>
                <h2>{ui.journalTitle}</h2>
                <p className="subtle">{ui.journalCount(words.length)}</p>
                {words.length === 0 ? (
                  <p className="journal-empty">
                    {ui.journalEmpty}
                  </p>
                ) : (
                  <div className="journal-list">
                    {words.map((w) => (
                      <button key={w.id} data-word-lookup onClick={(event) => lookup(w, event.currentTarget)}>
                        <span>{w.text}</span>
                        {state.journal[w.id].lookups > 0 && (
                          <small>{ui.lookupCount(state.journal[w.id].lookups)}</small>
                        )}
                        <Speaker />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {audioNotice}
          </section>
        </div>
      )}
      {wordCard}
      {dayEndOpen && (
        <div className="modal-backdrop">
          <section
            className="paper-panel day-end"
            role="dialog"
            aria-modal={!wordOpen}
            aria-label={ui.summary}
          >
            <p className="eyebrow">{ui.closed}</p>
            <h2>{ui.summaryTitle}</h2>
            <div className="tally">
              <p>
                <span>{ui.servedLabel}</span>
                <b>{ui.servedCount}</b>
              </p>
              <p>
                <span>{ui.earningsLabel}</span>
                <b>{ui.moneySpaced(state.earnings)}</b>
              </p>
              <p>
                <span>{ui.wordsLabel}</span>
                <b>{ui.wordCount(words.length)}</b>
              </p>
            </div>
            <p className="subtle">
              {ui.tomorrow(state.level)}
            </p>
            <button
              className="primary"
              onClick={() => {
                dispatch({ type: "next-day" });
                close();
              }}
            >
              {ui.nextDay} <span>→</span>
            </button>
            <button className="secondary" onClick={() => visitLocation("apartment")}>{ui.visitHome}</button>
          </section>
        </div>
      )}
    </div>
  );
}
