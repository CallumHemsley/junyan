import { useEffect, useRef } from 'react';
import type { Line, Word } from '../../contracts';
import WordLine from '../../WordLine';
import Courtyard from './Courtyard';
import { lineFor } from './content';
import { choices, recoveryForTransition, reduce, type Action, type State, type Target } from './rules';
import './cats.css';

export { words, lines } from './content';
export { initialState, reduce, validate, gifts } from './rules';
export type { State, Action } from './rules';
export type Props = {
  state: State; day: number;
  onAction: (action: Action) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onRecover: (wordIds: string[]) => void;
  onPlay: (line: Line) => void;
  recoveredWordIds?: readonly string[];
  freshWordIds?: readonly string[];
  presentation?: 'scene' | 'controls';
};
export default function Cats({ state, day, onAction, onLookup, onRecover, onPlay, recoveredWordIds = [], freshWordIds = [], presentation = 'scene' }: Props) {
  const welcome = useRef({ play: onPlay, line: lineFor(state.feedback) });
  const actionControls = useRef<HTMLDivElement>(null);
  const actionTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { welcome.current.play(welcome.current.line); }, []);
  useEffect(() => {
    const trigger = actionTrigger.current;
    actionTrigger.current = null;
    if (trigger && !trigger.isConnected) actionControls.current?.querySelector<HTMLButtonElement>('.cats-action > button')?.focus();
  }, [state]);
  const act = (action: Action) => {
    const next = reduce(state, action, day);
    const recovered = recoveryForTransition(state, next);
    const focused = document.activeElement;
    if (next !== state && focused instanceof HTMLButtonElement && actionControls.current?.contains(focused)) actionTrigger.current = focused;
    onAction(action);
    if (recovered.length) onRecover(recovered);
    if (next !== state && (next.feedback !== state.feedback || action.type === 'select')) onPlay(lineFor(next.feedback));
  };
  const tokens = (key: string) => <WordLine line={lineFor(key)} look={word => freshWordIds.includes(word.id) ? 'dot' : recoveredWordIds.includes(word.id) ? 'plain' : 'fogged'} onLookup={onLookup} />;
  const inspect: Target[] = ['aunt', 'bicycle', 'bench', 'door', 'window'];
  return <section className="cats-view" data-presentation={presentation} aria-label={lineFor('label-courtyard').text} data-testid="cats-view">
    {presentation === 'scene' && <header className="cats-heading"><h2>{tokens('label-courtyard')}</h2><span className="cats-cast">{tokens('label-white')}<span aria-hidden="true"> · </span>{tokens('label-black')}</span></header>}
    {presentation === 'scene' && <Courtyard state={state} day={day} onSelect={target => act({ type: 'select', target })} />}
    {presentation === 'scene' && <div className="cats-landmarks" aria-label={lineFor('action-look').text}>
      {inspect.map(target => <button key={target} type="button" aria-pressed={state.selected === target}
        data-testid={`cats-${target}`} onClick={() => act({ type: 'select', target })}>{lineFor(`label-${target}`).text}</button>)}
    </div>}
    <div className="cats-dialogue" aria-live="polite" aria-atomic="true" data-testid="cats-dialogue">
      <p className="cats-speaker">{tokens('label-aunt')}</p>
      <div className="cats-speech">{tokens(state.feedback)}</div>
      <div className="cats-dialogue-controls">
        <button type="button" className="cats-replay" aria-label={lineFor('action-replay').text} onClick={() => onPlay(lineFor(state.feedback))}>↻</button>
        <div className="cats-actions" ref={actionControls}>
          {choices(state).map(choice => <div className="cats-action" key={choice.action.type}>
            <span className="cats-action-words">{tokens(choice.label)}</span>
            <button type="button" aria-label={lineFor(choice.label).text} data-testid={`cats-action-${choice.action.type}`} onClick={() => act(choice.action)}>→</button>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
