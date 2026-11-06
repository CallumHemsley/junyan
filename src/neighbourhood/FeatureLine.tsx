import type { Line } from "../contracts";
import WordLine from "../WordLine";
import { lineText } from "../language";
import { ui } from "../language/ui";
import { Speaker } from "../icons";
import type { FeatureViewProps } from "./contracts";

type Props = Pick<FeatureViewProps<unknown, unknown>, "onLookup" | "onPlay" | "recoveredWordIds" | "freshWordIds"> & { line: Line };

export default function FeatureLine({ line, onLookup, onPlay, recoveredWordIds = [], freshWordIds = [] }: Props) {
  return (
    <div className="help-line">
      <div className="spoken">
        <WordLine line={line} look={word => !recoveredWordIds.includes(word.id) ? 'fogged' : freshWordIds.includes(word.id) ? 'dot' : 'plain'} onLookup={onLookup} />
      </div>
      <button className="round-button" aria-label={ui.listen(lineText(line))} onClick={() => onPlay(line)}>
        <Speaker />
      </button>
    </div>
  );
}
