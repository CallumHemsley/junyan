import { Fragment } from "react";
import type { Line, Word } from "./contracts";
import { lineParts, type LanguagePolicy } from "./language";
import type { TokenLook } from "./opening-view";
import WordToken from "./WordToken";

export default function WordLine({ line, look, onLookup, policy }: {
  line: Line;
  look: (word: Word) => TokenLook;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
  policy?: LanguagePolicy;
}) {
  return lineParts(line, policy).map((part, index) => part.kind === "word"
    ? <WordToken key={index} word={part.word} look={look(part.word)} onLookup={onLookup} />
    : <Fragment key={index}>{part.text}</Fragment>);
}
