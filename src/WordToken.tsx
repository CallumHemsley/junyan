import type { Word } from "./contracts";
import type { TokenLook } from "./opening-view";

export default function WordToken({
  word,
  look,
  onLookup,
}: {
  word: Word;
  look: TokenLook;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void;
}) {
  return (
    <button
      className={`word${look === "fogged" ? " fogged" : ""}${look === "dot" ? " new-word" : ""}`}
      data-word-lookup
      data-recovered={look !== "fogged"}
      onClick={(event) => onLookup(word, event.currentTarget)}
    >
      {word.text}
    </button>
  );
}
