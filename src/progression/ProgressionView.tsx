import type { Content, GameState, Word } from "../contracts";
import { contentWords } from "../content/words";
import WordLine from "../WordLine";
import type { LanguagePolicy } from "../language";
import { progressionUi, type ProgressionCopy } from "./copy";
import { balance, catalog } from "./model";
import { recommendation } from "./scenarios";
import type { NeighbourhoodAction } from "../neighbourhood/transitions";
import "./style.css";

type Props = { game: GameState; content: Content; now: number; onAction: (action: NeighbourhoodAction) => void; onLookup: (word: Word, trigger: HTMLButtonElement) => void; copy?: ProgressionCopy; policy?: LanguagePolicy };
export default function ProgressionView({ game, content, now, onAction, onLookup, copy = progressionUi, policy }: Props) {
  const home = game.neighbourhood?.apartment;
  const location = game.neighbourhood?.location ?? "restaurant";
  const invitation = recommendation(game, now, content);
  const vocabulary = contentWords(content);
  const tokens = (ids: string[]) => <WordLine line={{ tokens: ids.map(id => vocabulary.find(w => w.id === id)!) }} look={() => "plain"} onLookup={onLookup} policy={policy} />;
  return <div className="living-progression">
    {location === "apartment" && home && <section className="furnishing-shop" aria-label={copy.furniture}>
      <header><h2>{copy.furniture}</h2><span aria-label={copy.balance}>{copy.money(balance(game))}</span></header>
      <div className="furnishing-choices">{catalog.furniture.map(item => {
        const owned = home.owned.includes(item.id);
        return <div key={item.id} className="furnishing-choice" data-furniture={item.id}>
          <div className={`furnishing-preview ${item.id}`} aria-hidden="true"><i /></div>
          <div>{tokens([item.modifier, item.word])}</div>
          <button type="button" data-buy={item.id} disabled={owned || balance(game) < item.price} onClick={() => onAction({ type: "purchase-furniture", id: item.id })}>{owned ? copy.owned : copy.buy(item.price)}</button>
        </div>;
      })}</div>
    </section>}
    {invitation && invitation.location !== location && (location !== "restaurant" || game.ended) && <aside className="neighbourhood-invitation" aria-label={copy.invitation}>
      <span className="invitation-label">{tokens(invitation.label)}</span>
      <button type="button" data-follow-scenario={invitation.id} onClick={() => onAction({ type: "follow-scenario", id: invitation.id })}>{copy.visit}</button>
    </aside>}
  </div>;
}
