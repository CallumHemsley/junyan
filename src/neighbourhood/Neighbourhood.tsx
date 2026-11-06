import type {InteractionTarget} from "../world/ui";
import {plantIds} from "../features/garden/rules";
import type { Line, Word } from "../contracts";
import Apartment from "../features/apartment";
import Cats from "../features/cats";
import Repairs from "../features/repairs";
import Garden from "../features/garden";
import type { GiftId, LocationId } from "./contracts";
import type { NeighbourhoodState } from "./model";
import { availableGifts } from "./model";
import type { NeighbourhoodAction } from "./transitions";
import { neighbourhoodUi as copy } from "./copy";
import "./style.css";

export const locationNames = copy.locations;
export function LocationNavigation({ location, onVisit }: { location: LocationId; onVisit: (location: LocationId) => void }) {
  return <nav className="neighbourhood-nav" aria-label={copy.navigation}>
    {(Object.keys(locationNames) as LocationId[]).map(id => <button key={id} type="button" data-location-button={id} aria-current={location === id ? "page" : undefined} onClick={() => onVisit(id)}>{locationNames[id]}</button>)}
  </nav>;
}

type Props = {
  state: NeighbourhoodState; day: number; contextual?: boolean; target?:InteractionTarget|null; onAction: (action: NeighbourhoodAction) => void;
  onLookup: (word: Word, trigger: HTMLButtonElement) => void; onPlay: (line: Line) => void;
  onRecover: (ids: string[]) => void; recoveredWordIds: string[]; freshWordIds: string[];
};
export default function Neighbourhood({ state, day, onAction, contextual, target, ...learning }: Props) {
  const shared = { day, ...learning };
  return <div className="neighbourhood-feature" tabIndex={-1} data-location-heading aria-label={locationNames[state.location]}>
    {state.location === "apartment" && <Apartment {...shared} sceneMode={contextual?"world":"room"} state={state.apartment} onAction={action => onAction({type:"feature-action",feature:"apartment",action,now:Date.now()})}/>}
    {state.location === "cats" && <Cats {...shared} presentation={contextual?"controls":"scene"} state={state.cats} onAction={action => onAction({type:"feature-action",feature:"cats",action,now:Date.now()})}/>}
    {state.location === "repairs" && <Repairs {...shared} contextualJob={contextual ? state.repairs.active : undefined} state={state.repairs} onAction={action => onAction({type:"feature-action",feature:"repairs",action,now:Date.now()})}/>}
    {state.location === "garden" && <Garden {...shared} presentation={contextual?"controls":"scene"} plantId={target?.kind==="garden"?plantIds.find(id=>id===target.plantId):undefined} state={state.garden} onAction={action => onAction({type:"feature-action",feature:"garden",action,now:Date.now()})}/>}
  </div>;
}


export function NeighbourhoodGifts({ state, onClaim }: { state: NeighbourhoodState; onClaim: (giftId: GiftId) => void }) {
  const gifts = availableGifts(state);
  if (!gifts.length) return null;
  return <aside className="neighbourhood-gifts" aria-label={copy.gifts}><span>{copy.takeHome}</span>{gifts.map(giftId => <button type="button" key={giftId} onClick={() => onClaim(giftId)}>{copy.claim(copy.giftNames[giftId])}</button>)}</aside>;
}
