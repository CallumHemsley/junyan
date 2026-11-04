import { useEffect, useMemo, useRef, useState } from "react";
import type { Content, Line, OpeningStep, Word } from "./contracts";
import { contentWords } from "./content/words";
import FoodArt from "./FoodArt";
import { Speaker } from "./icons";
import { NEXT_BED, type OpeningState, type Session, type SessionAction } from "./opening";
import { tokenLook, wardFrame } from "./opening-view";
import WardScene from "./scene/WardScene";
import WordToken from "./WordToken";

const Eye = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12q10-11 20 0-10 11-20 0Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

function entryClip(step: OpeningStep): string | null {
  switch (step.type) {
    case "say-en":
      return step.audio;
    case "say":
    case "request":
      return step.line.audio;
    case "end":
      return step.title.audio;
    case "reply":
      return null;
  }
}

export default function HospitalOpening({
  opening,
  content,
  dispatch,
  play,
  lookup,
  onFinish,
  inert,
}: {
  opening: OpeningState;
  content: Content;
  dispatch: (action: SessionAction) => Session;
  play: (url: string) => void;
  lookup: (word: Word, trigger: HTMLButtonElement) => void;
  onFinish: () => void;
  inert: boolean;
}) {
  const [woke, setWoke] = useState(false);
  const [offered, setOffered] = useState<{ food: string; tries: number } | null>(null);
  const talk = useRef<HTMLElement>(null);
  const answerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const steps = content.opening.steps;
  const step = steps[opening.step];
  const frame = useMemo(
    () => wardFrame(opening, content, offered?.food ?? null),
    [opening, content, offered],
  );
  const settled = opening.feedback === "thanks" || opening.reply !== null;

  useEffect(() => () => clearTimeout(answerTimer.current), []);
  useEffect(() => {
    if (!woke) return;
    const clip = entryClip(steps[opening.step]);
    if (clip) play(clip);
  }, [opening.step]);
  useEffect(() => {
    talk.current?.querySelector<HTMLElement>("[data-step-focus]")?.focus();
  }, [woke, opening.step, settled]);

  const wake = () => {
    const clip = entryClip(step);
    if (clip) play(clip);
    setWoke(true);
  };
  const advance = () => {
    clearTimeout(answerTimer.current);
    setOffered(null);
    if (step.type === "end") onFinish();
    else dispatch({ type: "advance", now: Date.now() });
  };

  if (!woke)
    return (
      <main className="opening opening-wake" inert={inert}>
        <button className="wake-button" aria-label="醒来" onClick={wake}>
          <Eye />
        </button>
      </main>
    );

  const who = (id: string) => content.opening.cast.find((member) => member.id === id)?.name;
  const tokens = (line: Line) => (
    <div className="spoken">
      {line.tokens.map((word, index) => (
        <WordToken key={`${word.id}-${index}`} word={word} look={tokenLook(opening, word.id)} onLookup={lookup} />
      ))}
    </div>
  );
  const label = (word: Word) => (
    <span className={`tile-word${tokenLook(opening, word.id) === "fogged" ? " fogged" : ""}`}>{word.hanzi}</span>
  );
  const replay = (clip: string) => (
    <button className="round-button" aria-label="再听一遍" onClick={() => play(clip)}>
      <Speaker />
    </button>
  );
  const controls = (clip: string, next = true) => (
    <div className="opening-controls">
      {replay(clip)}
      {next && (
        <button className="continue-button" aria-label="继续" data-step-focus onClick={advance}>
          <Arrow />
        </button>
      )}
    </div>
  );
  const speech = (speaker: string, line: Line, next = true) => (
    <div className="opening-line">
      <span className="speaker">{who(speaker)}</span>
      {tokens(line)}
      {controls(line.audio, next)}
    </div>
  );
  const foods = content.opening.tray.map((id) => content.foods.find((food) => food.id === id)!);
  const recovered = contentWords(content).filter(
    (word, index, all) =>
      Object.hasOwn(opening.recovered, word.id) && all.findIndex((other) => other.id === word.id) === index,
  ).sort((a, b) => opening.recovered[a.id] - opening.recovered[b.id]);

  const body = () => {
    switch (step.type) {
      case "say-en":
        return (
          <div className="paper-card opening-line">
            <span className="speaker">{who(step.who)}</span>
            <p className="english" lang="en">“{step.en}”</p>
            {controls(step.audio)}
          </div>
        );
      case "say":
        return <div className="paper-card">{speech(step.who, step.line)}</div>;
      case "request": {
        const give = (foodId: string) => {
          dispatch({ type: "pickup", foodId });
          const next = dispatch({ type: "deliver", table: NEXT_BED });
          setOffered((previous) => ({ food: foodId, tries: (previous?.tries ?? 0) + 1 }));
          if (next.phase !== "opening") return;
          if (next.opening.feedback === "thanks") play(step.ok.audio);
          else if (next.opening.feedback === "wrong-food") play(step.wrong.audio);
        };
        return (
          <>
            <div className="paper-card">{speech(step.who, step.line, false)}</div>
            <div className="paper-card bedside" role="group" aria-label="床头柜">
              <div className="bedside-tray">
                {foods.map((food, index) => (
                  <button
                    key={food.id}
                    className={`tile${settled && offered?.food === food.id ? " given" : ""}`}
                    data-nudge={opening.feedback === "wrong-food" && offered?.food === food.id ? offered.tries % 2 : undefined}
                    aria-label={food.word.hanzi}
                    disabled={settled}
                    data-step-focus={index === 0 && !settled ? true : undefined}
                    onClick={() => give(food.id)}
                  >
                    <FoodArt kind={food.kind} />
                    {label(food.word)}
                  </button>
                ))}
              </div>
              {opening.feedback === "wrong-food" && (
                <div className="opening-answer" role="status">
                  {speech(step.who, step.wrong, false)}
                </div>
              )}
              {opening.feedback === "thanks" && (
                <div className="opening-answer" role="status">
                  {speech(step.who, step.ok)}
                </div>
              )}
            </div>
          </>
        );
      }
      case "reply": {
        const asked = steps[opening.step - 1];
        const choice = opening.reply === null ? null : step.options[opening.reply];
        const answer = (option: number) => {
          dispatch({ type: "reply", option });
          play(step.options[option].word.audio);
          clearTimeout(answerTimer.current);
          answerTimer.current = setTimeout(() => play(step.options[option].answer.audio), 900);
        };
        return (
          <>
            {asked.type === "say" && <div className="paper-card">{speech(asked.who, asked.line, false)}</div>}
            <div className="paper-card">
              <div className="reply-chips" role="group" aria-label="回答">
                {step.options.map((option, index) => (
                  <button
                    key={option.word.id}
                    className={`chip${opening.reply === index ? " chosen" : ""}`}
                    disabled={opening.reply !== null}
                    data-step-focus={index === 0 && opening.reply === null ? true : undefined}
                    onClick={() => answer(index)}
                  >
                    {label(option.word)}
                  </button>
                ))}
              </div>
              {choice && (
                <div className="opening-answer" role="status">
                  {speech(step.who, choice.answer)}
                </div>
              )}
            </div>
          </>
        );
      }
      case "end":
        return (
          <div className="paper-card end-card">
            <h2>
              {step.title.tokens.map((word, index) => (
                <span key={word.id}>
                  {index > 0 && <span aria-hidden="true"> · </span>}
                  <WordToken word={word} look="plain" onLookup={lookup} />
                </span>
              ))}
            </h2>
            <span className="end-rule" aria-hidden="true" />
            <div className="spoken end-words">
              {recovered.map((word) => (
                <WordToken key={word.id} word={word} look={tokenLook(opening, word.id)} onLookup={lookup} />
              ))}
            </div>
            {controls(step.title.audio)}
          </div>
        );
    }
  };

  return (
    <main className="opening" inert={inert} data-step={opening.step} data-step-type={step.type}>
      <div className="opening-layout">
        <section className="world-panel opening-world" aria-label="病房">
          <div inert>
            <WardScene frame={frame} />
          </div>
          <div className="wake-veil" aria-hidden="true" />
        </section>
        <section className="opening-talk" ref={talk} aria-live="polite">
          <div className="opening-step" key={opening.step}>
            {body()}
          </div>
        </section>
      </div>
    </main>
  );
}
