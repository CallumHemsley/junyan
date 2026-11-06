import type { Line, Word } from '../../contracts';
import WordToken from '../../WordToken';
import FeatureLine from '../../neighbourhood/FeatureLine';
import type { Affordance } from './model';
import './prompt.css';

export type LifePromptProps = {
  option?: Affordance;
  line?: Line;
  onActivate: (id: string) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  onPlay: (line: Line) => void;
  recoveredWordIds?: readonly string[];
  freshWordIds?: readonly string[];
};
export function LifePrompt({ option, line, onActivate, onLookup, onPlay, recoveredWordIds = [], freshWordIds = [] }: LifePromptProps) {
  if (!option && !line) return null;
  return <div className="life-prompt" data-testid="life-prompt">
    {line && <div aria-live="polite"><FeatureLine line={line} onLookup={onLookup} onPlay={onPlay} recoveredWordIds={recoveredWordIds} freshWordIds={freshWordIds} /></div>}
    {option && <div className="life-prompt-action">
      <span>{option.label.tokens.map((word, index) => <WordToken key={`${word.id}-${index}`} word={word}
        look={freshWordIds.includes(word.id) ? 'dot' : recoveredWordIds.includes(word.id) ? 'plain' : 'fogged'} onLookup={onLookup} />)}</span>
      <button className="life-activate" type="button" data-life-action={option.id} aria-label={option.label.tokens.map(word => word.hanzi).join('')} onClick={() => onActivate(option.id)}>→</button>
    </div>}
  </div>;
}
