import ProgressionView from "./progression/ProgressionView";
import {ContextualInteraction,RestaurantTableControls,KitchenControls,WorldPocketBar} from "./world/ui";
import {activityTarget} from "./world/activity";
import {performLifeInteraction} from "./world/life-bridge";
import WorldViewport from "./world/WorldViewport";
import { restoreWorld } from "./world/state";
import { mapsForNeighbourhood } from "./world/dynamic";
import { serviceDayPhase } from "./world/lighting";
import WordToken from "./WordToken";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Line, Word } from "./contracts";
import { TABLES } from "./contracts";
import { characterFor } from "./content";
import { content } from "./neighbourhood/registry";
import Neighbourhood, { NeighbourhoodGifts } from "./neighbourhood/Neighbourhood";
import FeatureLine from "./neighbourhood/FeatureLine";
import { worldToGrid as readingRoomCell } from "./features/reading-room/world";
import { readingRoomFrame } from "./features/reading-room/view";
import { lineById as apartmentLines } from "./features/apartment/content";
import { createNeighbourhood } from "./neighbourhood/model";
import { contentWords } from "./content/words";
import {
  createGame,
  getOrder,
  orderTotal,
  isNear,
  canVisitKitchen,
} from "./game";
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
    "none" | "table" | "kitchen" | "journal" | "help" | "tray"
  >("help");
  const [requestedTable, setTable] = useState(1);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [word, setWord] = useState<Word | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);
  const wordTrigger = useRef<HTMLButtonElement | null>(null);
  const panelTrigger = useRef<HTMLElement | null>(null);
  const wordOpen = word !== null;
  const dayPhase = serviceDayPhase(state.served);
  const [change, setChange] = useState(0);
  const [audioError, setAudioError] = useState<PlaybackError>(null);
  const neighbourhood = state.neighbourhood ?? createNeighbourhood(state.day);
  const locationId = neighbourhood.location;
  const worldRegistry = mapsForNeighbourhood(neighbourhood);
  const world = restoreWorld(state.world, worldRegistry, locationId, false);
  const presentationFrame = useMemo(() => world.activeActivity === 'reading-room' ? readingRoomFrame(neighbourhood['reading-room']) : null, [world.activeActivity, neighbourhood['reading-room']]);
  const binding=activityTarget(world,worldRegistry[world.mapId]);
  const table=binding?.kind==="table"?binding.table:requestedTable;
  const activityOpen = binding !== null;
  const blockingPanel=panel==="help"||panel==="journal"||panel==="tray";
  const [giftNotice, setGiftNotice] = useState(false);
  const [summaryOpen,setSummaryOpen]=useState(false);
  const [ambientLine,setAmbientLine]=useState<Line|null>(null);
  const dayEndOpen = summaryOpen && world.mapId === "restaurant" && state.ended && panel === "none" && !word;
  const ambience = useAmbience(ready && session.phase === "day" && world.mapId === "restaurant");
  const playback = useRef<ReturnType<typeof createPlayback> | null>(null);
  if (!playback.current)
    playback.current = createPlayback((url) => new Audio(url), setAudioError, ambience.speaking);
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
          playback.current?.stop();
          setWord(null);
          setPanel("none");
          setGiftNotice(false);
        }
        if (action.type === "claim-neighbourhood-gift") setGiftNotice(true);
      }
      if (!testMode && next.phase === "day") {
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
  const visitTable = useCallback(
    (number: number) => {
      const active=stateRef.current.world;
      if(active && active.activeAnchorId!==`restaurant.table-${number}`)return;
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

    },
    [dispatch, play],
  );
  const visitKitchen = useCallback(() => {
    if(stateRef.current.world && stateRef.current.world.activeAnchorId!=="restaurant.kitchen"){dispatch({type:"world-close"});setPanel("none");return;}
    const open = () => setPanel("kitchen");
    if (canVisitKitchen(stateRef.current)) open();

  }, [dispatch]);
  useEffect(() => {
    if (panel === "none" && !wordOpen) return;
  }, [panel, wordOpen]);
  useEffect(() => {
    if (!ready || (panel === "none" && !dayEndOpen)) return;
    const previous = panelTrigger.current;
    const dialog = document.querySelector<HTMLElement>(".paper-panel");
    dialog?.querySelector<HTMLButtonElement>(dayEndOpen ? ".day-next" : "button")?.focus();
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
    )].filter(element => !element.closest("[inert]") && element.checkVisibility());
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
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if(event.key!=="Escape"||event.defaultPrevented)return;if(word)setWord(null);else if(summaryOpen)setSummaryOpen(false);else if(sessionRef.current.phase==="day"){dispatch({type:"world-close"});setPanel("none");}};
    window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[dispatch,word,summaryOpen]);
  useEffect(() => {
    if (!testMode) return;
    const hooks = {
      getState: () => (sessionRef.current.phase === "day" ? sessionRef.current.game : null),
      getSession: () => sessionRef.current,
      dispatch,
      reset: () => {
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
  const registered = (wordId:string) => {
    const word=allWords.find(word=>word.id===wordId);
    return word?<WordToken word={word} look={wordState(state.journal[word.id],fresh.includes(word.id))} onLookup={lookup}/>:null;
  };
  const close = () => {
    setPanel("none");
    setWord(null);
  };
  const leaveRestaurant = () => {
    if(state.ended && binding?.kind==="table")setSummaryOpen(true);
    dispatch({type:"world-close"});
    close();
  };
  const completePayment = () => {
    if (!order) return;
    dispatch({ type: "pay", table, change });
    if (change === order.paid - total) play(characterFor(order.customer).thanks.audio);
  };
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
        {ui.seal.map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}
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
    <div className={`app-shell connected-shell${wordOpen ? " word-card-open" : ""}`} data-theme={dayPhase === "evening" || dayPhase === "night" ? "evening" : "morning"} onFocusCapture={rememberPanelTrigger} onClickCapture={(event) => { guardWordCard(event); rememberPanelTrigger(event); }}>
      <header className="topbar" inert={blockingPanel || dayEndOpen}>
        {brand}
        <nav aria-label={ui.navigation}>
          <AmbienceControls ambience={ambience} />
          <button
            className="help-button"
            aria-label={ui.help}
            onClick={() => setPanel("help")}
          >
            {ui.help}
          </button>
        </nav>
      </header>
      <main inert={blockingPanel || dayEndOpen} data-location={locationId}>
        <WorldViewport state={world} maps={worldRegistry} game={state} onLookup={lookup} onPlay={playLine} dialogue={ambientLine} fresh={fresh} presentationFrame={presentationFrame} onScenePoint={point=>{if(world.activeActivity!=="reading-room"||!neighbourhood["reading-room"].selected)return;const cell=readingRoomCell(point,neighbourhood["reading-room"].brief);if(cell)dispatch({type:"feature-action",feature:"reading-room",action:{type:"preview",...cell},now:Date.now()});}} onAction={action=>{
          if(action.type==="world-life") {
            const result=performLifeInteraction(worldRegistry[world.mapId],state,world,action);
            setAmbientLine(result.line??null);if(result.line)playLine(result.line);
          }else if(action.type==="world-move")setAmbientLine(null);
          const next=dispatch(action);
          if(action.type==="world-interact"&&next.phase==="day"&&next.game.world?.activeActivity==="restaurant") {
            const id=next.game.world.activeAnchorId;
            if(id==="restaurant.kitchen")visitKitchen();
            else {const number=Number(id?.split("table-")[1]);if(number)visitTable(number);}
          }
        }} paused={panel !== "none" || wordOpen || dayEndOpen}/>
        <WorldPocketBar journalControl={<><span>{registered("journal")}</span><button aria-label="本子" onClick={()=>setPanel("journal")}><Book/><span>{words.length}</span></button></>} trayControl={<><span>{registered("tray")}</span><button aria-label="托盘" onClick={()=>setPanel("tray")}><span aria-hidden="true">▱</span><span>{state.tray.length}/6</span></button></>}/>
        {state.ended && world.mapId==="restaurant" && <button className="world-day-summary" aria-label={ui.summary} onClick={()=>{setPanel("none");setSummaryOpen(true);}}><Sun/></button>}
        {activityOpen && binding && <ContextualInteraction target={binding}
          title={<span aria-label={binding.kind==="table"?`${binding.table}桌点餐`:binding.kind==="kitchen"?"厨房":binding.kind==="repair"?"修理间":binding.kind==="cat"?"院子":binding.kind==="garden"?"花园":binding.kind==="reading-room"?"共用书房":"家"}>{binding.kind==="table"?binding.table:null}{binding.kind==="reading-room"?<>{registered("table")}{registered("apartment.chair")}</>:registered(binding.kind==="table"?"customer":binding.kind==="kitchen"?"kitchen":binding.kind==="repair"?"repairs.workshop":binding.kind==="cat"?"cats.courtyard":binding.kind==="garden"?"garden.garden":"apartment.home")}</span>}
          dialogue={binding.kind==="table"&&order&&character&&customer?{current:{line:customer.phase==="served"?character.thanks:order.line},history:customer.phase==="ordered"?[{line:character.greeting}]:[]}:undefined}
          onClose={()=>{if(state.ended&&binding.kind==="table")setSummaryOpen(true);dispatch({type:"world-close"});setPanel("none");}} returnFocusTo={panelTrigger.current} suspended={wordOpen}
          onLookup={lookup} onPlay={playLine} recoveredWordIds={Object.keys(state.journal).filter(id=>state.journal[id].recovered)} freshWordIds={fresh}
          actions={binding.kind==="table"&&customer?[{id:"service",control:<button className="world-submit" aria-label={customer.phase==="served"?"继续招呼":customer.phase==="checkout"?"递上找零":"上菜"} onClick={()=>customer.phase==="served"?leaveRestaurant():customer.phase==="checkout"?completePayment():dispatch({type:"deliver",table,now:Date.now()})}>→</button>}]:binding.kind==="kitchen"?[{id:"carry",control:<button className="world-submit" aria-label="端好了，去上菜" onClick={leaveRestaurant}>↗</button>}]:[]}>
          {binding.kind==="table"&&order&&customer&&<RestaurantTableControls phase={customer.phase} order={order} foods={content.foods} change={change} onChange={setChange} onLookup={lookup}
            summary={<p aria-label={`共${total}块，收到${order.paid}块`}>∑ {total} · ↓ {order.paid}</p>} changeLabel={<span>{registered("change")} {change}</span>}
            resetControl={<button aria-label="重来" onClick={()=>setChange(0)}>↺</button>} receiptSummary={<p>∑ {total} · {registered("change")} {order.paid-total}</p>}
            thanks={<span className="thanks-chop">{registered("thanks")}</span>}/>}
          {binding.kind==="kitchen"&&<KitchenControls trayHeading={<span>{registered("tray")} {state.tray.length}/6</span>} foods={content.foods} tray={state.tray} pickupEnabled={state.tray.length<6&&state.customers.some(c=>c.phase==="ordered")} onPickup={foodId=>dispatch({type:"pickup",foodId})} onReturn={index=>dispatch({type:"return-food",index})} onLookup={lookup}/>}
          {binding.kind!=="table"&&binding.kind!=="kitchen"&&<Neighbourhood contextual target={binding} state={neighbourhood} day={state.day} onAction={dispatch} onLookup={lookup} onPlay={playLine} onRecover={acknowledgeRecovery} recoveredWordIds={Object.keys(state.journal).filter(id=>state.journal[id].recovered)} freshWordIds={fresh}/>}
          {(state.feedback==="wrong-food"||state.feedback==="wrong-change")&&binding.kind==="table"&&character&&<div role="status">{tokens(character.retry)}</div>}
          {binding.kind === "apartment" && <ProgressionView game={state} content={content} now={Date.now()} onAction={action=>{dispatch(action);if(action.type==="follow-scenario"){setSummaryOpen(false);dispatch({type:"world-close"});close();}}} onLookup={lookup}/>}
          <NeighbourhoodGifts state={neighbourhood} onClaim={giftId=>{const before=sessionRef.current;const next=dispatch({type:"claim-neighbourhood-gift",giftId});if(next!==before)playLine(apartmentLines.gift);}}/>
          {giftNotice&&<FeatureLine line={apartmentLines.gift} onLookup={lookup} onPlay={playLine}/>}
          {audioNotice}
        </ContextualInteraction>}
        {locationId !== "restaurant" && panel === "none" && !activityOpen && audioNotice}
        {saveError && (
          <p role="status" className="save-note">
            {ui.saveUnavailable}
          </p>
        )}
      </main>
      {blockingPanel && (
        <div className="modal-backdrop" onClick={close}>
          <section
            className="paper-panel"
            role="dialog"
            aria-modal={!wordOpen}
            aria-label={panel==="journal"?ui.journal:panel==="tray"?ui.tray:ui.help}
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
            {panel==="tray"&&<div className="tray-pocket" role="group" aria-label="托盘">{state.tray.map((id,index)=>{const food=content.foods.find(food=>food.id===id)!;return <div key={`${id}-${index}`}><FoodArt kind={food.kind}/><WordToken word={food.word} look={wordState(state.journal[food.word.id],fresh.includes(food.word.id))} onLookup={lookup}/></div>;})}</div>}
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
            <ProgressionView game={state} content={content} now={Date.now()} onAction={action=>{dispatch(action);if(action.type==="follow-scenario"){setSummaryOpen(false);dispatch({type:"world-close"});close();}}} onLookup={lookup}/>
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
              className="primary day-next"
              onClick={() => {
                setSummaryOpen(false);
                dispatch({ type: "advance-world-day", now: Date.now() });
                close();
              }}
            >
              {ui.nextDay} <span>→</span>
            </button>
            <button className="secondary" onClick={() => {setSummaryOpen(false);dispatch({type:"world-close"});close();}}>出去走走</button>
          </section>
        </div>
      )}
    </div>
  );
}
