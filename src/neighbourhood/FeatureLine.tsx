import type { Line } from "../contracts";
import WordToken from "../WordToken";
import { Speaker } from "../icons";
import type { FeatureViewProps } from "./contracts";

type Props = Pick<FeatureViewProps<unknown, unknown>, "onLookup" | "onPlay" | "recoveredWordIds" | "freshWordIds"> & { line: Line };

export default function FeatureLine({ line, onLookup, onPlay, recoveredWordIds = [], freshWordIds = [] }: Props) {
  return (
    <div className="help-line">
      <div className="spoken">
        {line.tokens.map((word, index) => (
          <WordToken
            key={`${word.id}-${index}`}
            word={word}
            look={!recoveredWordIds.includes(word.id) ? "fogged" : freshWordIds.includes(word.id) ? "dot" : "plain"}
            onLookup={onLookup}
          />
        ))}
      </div>
      <button className="round-button" aria-label={`听${line.tokens.map(word => word.hanzi).join("")}`} onClick={() => onPlay(line)}>
        <Speaker />
      </button>
    </div>
  );
}
