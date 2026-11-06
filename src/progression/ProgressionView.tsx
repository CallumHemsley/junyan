import type { Content, GameState, Word } from "../contracts";
import { contentWords } from "../content/words";
import WordToken from "../WordToken";
import { balance, catalog } from "./model";
import { recommendation } from "./scenarios";
import type { NeighbourhoodAction } from "../neighbourhood/transitions";
import "./style.css";

type Props = { game: GameState; content: Content; now: number; onAction: (action: NeighbourhoodAction) => void; onLookup: (word: Word, trigger: HTMLButtonElement) => void };
export default function ProgressionView({ game, content, now, onAction, onLookup }: Props) {
  const home = game.neighbourhood?.apartment;
  const location = game.neighbourhood?.location ?? "restaurant";
  const invitation = recommendation(game, now);
  const vocabulary = contentWords(content);
  const token = (hanzi: string) => {
    const word = vocabulary.find(w => w.hanzi === hanzi)!;
    return <WordToken key={hanzi} word={word} look="plain" onLookup={onLookup} />;
  };
  return <div className="living-progression">
    {location === "apartment" && home && <section className="furnishing-shop" aria-label="添置家具">
      <header><h2>添置家具</h2><span aria-label="可用的钱">{balance(game)} 块</span></header>
      <div className="furnishing-choices">{catalog.furniture.map(item => {
        const owned = home.owned.includes(item.id);
        return <div key={item.id} className="furnishing-choice" data-furniture={item.id}>
          <div className={`furnishing-preview ${item.id}`} aria-hidden="true"><i /></div>
          <div>{token(item.modifier)}{token(item.word)}</div>
          <button type="button" data-buy={item.id} disabled={owned || balance(game) < item.price} onClick={() => onAction({ type: "purchase-furniture", id: item.id })}>{owned ? "已收下" : `买下 · ${item.price} 块`}</button>
        </div>;
      })}</div>
    </section>}
    {invitation && (location !== "restaurant" || game.ended) && <aside className="neighbourhood-invitation" aria-label="去楼里看看">
      <span className="invitation-label">{invitation.label.map(token)}</span>
      <button type="button" data-follow-scenario={invitation.id} onClick={() => onAction({ type: "follow-scenario", id: invitation.id })}>去看看</button>
    </aside>}
  </div>;
}
