import type { Word } from '../contracts';
import type { NearbyTarget } from './target-selection';

const placeWordIds: Readonly<Record<string, readonly string[]>> = {
  restaurant: ['shop-name'], courtyard: ['cats.courtyard'], workshop: ['repairs.workshop'],
  apartment: ['apartment.home'], rooftop: ['garden.roof', 'garden.garden'],
};

export function currentPlaceWords(mapId: string, dictionary: readonly Word[]): Word[] {
  const ids = placeWordIds[mapId] ?? ['apartment.here'];
  return ids.flatMap(id => { const word = dictionary.find(word => word.id === id); return word ? [word] : []; });
}

export function targetWords(target: NearbyTarget, dictionary: readonly Word[]): readonly Word[] {
  if (target.source === 'life') return target.affordance.label.tokens;
  const id = target.anchor.featureId === 'restaurant' ? target.anchor.interactionId.startsWith('table-') ? 'customer' : 'kitchen' : 'look';
  const word = dictionary.find(word => word.id === id);
  return word ? [word] : [];
}
