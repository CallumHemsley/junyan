import { language, type LanguagePolicy } from '../language';
import type { Word } from '../contracts';
import type { NearbyTarget } from './target-selection';

const placeWordIds: Readonly<Record<string, readonly string[]>> = {
  restaurant: ['shop-name'], courtyard: ['cats.courtyard'], workshop: ['repairs.workshop'],
  'reading-room': ['table', 'apartment.chair'], apartment: ['apartment.home'], rooftop: ['garden.roof', 'garden.garden'],
};

export function currentPlaceWords(mapId: string, dictionary: readonly Word[]): Word[] {
  const ids = placeWordIds[mapId] ?? [];
  return ids.flatMap(id => { const word = dictionary.find(word => word.id === id); return word ? [word] : []; });
}

export function targetWords(target: NearbyTarget, dictionary: readonly Word[]): readonly Word[] {
  if (target.source === 'life') return target.affordance.label.tokens;
  const id = target.anchor.featureId === 'restaurant' ? target.anchor.interactionId.startsWith('table-') ? 'customer' : 'kitchen' : 'look';
  const word = dictionary.find(word => word.id === id);
  return word ? [word] : [];
}

const placeNames: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'zh-CN': { restaurant: '早安小馆', town: '早市街', courtyard: '院子', workshop: '修理间', rooftop: '屋顶花园', apartment: '家', 'reading-room': '共用书房', 'residential-hall': '楼下', 'residential-stairs': '楼梯', park: '河畔公园', riverbank: '河岸' },
};
const regionHints: Readonly<Record<string, string>> = { 'zh-CN': '方向键走动，点地面走过去' };
const badgePaths: Readonly<Record<string, readonly string[]>> = {
  restaurant: ['M3 10h18v11H3zM2 5h20l-2 5H4zM7 13h4v8m4-8h3v4h-3'],
  town: ['M2 4h6v13H2zM16 7h6v14h-6zM10 2l4 20M4 7h2m-2 4h2m12-1h2m-2 4h2'],
  courtyard: ['M3 3v18h18V3M3 6h4m10 0h4M12 18v-7m-4 0a4 4 0 1 1 8 0z'],
  workshop: ['M3 13h18v3H3zM5 16v6m14-6v6M7 4l6 7m-2-9 3 3-3 3-3-3zM18 4v7m-2-5h4'],
  'reading-room': ['M2 3q5-2 10 1 5-3 10-1v17q-5-2-10 1-5-3-10-1zM12 4v17M5 7l4 1M5 11l4 1m6-4 4-1m-4 5 4-1'],
  apartment: ['M2 11 12 2l10 9M5 9v13h14V9M10 22v-7h4v7M8 11h2m4 0h2'],
  rooftop: ['M2 19h20v3H2zM5 19v-7h6v7m-3-7V7m-3 2 3-3 3 3M15 19V8h4v11M14 8h6'],
  'residential-hall': ['M3 2h18v20H3zM6 5h6v17M15 5h3v3h-3zM15 11h3v3h-3zM15 17h3v3h-3zM10 13h1'],
  'residential-stairs': ['M2 22h5v-5h5v-5h5V7h5M3 15 16 2m-8 8v4m5-9v4'],
  park: ['M8 22v-7M3 15h10L8 3zM15 17h7m-6-3h5m-5 3v5m5-5v5'],
  riverbank: ['M2 14q3-3 6 0t6 0 6 0M2 20q3-3 6 0t6 0 6 0M5 12V2m0 5L2 4m3 5 4-4M18 11V4m0 3 3-3'],
};

export function placeBadgePaths(mapId: string): readonly string[] { return badgePaths[mapId] ?? []; }
export function worldPlaceName(mapId: string, policy: Pick<LanguagePolicy, 'id'> = language): string | undefined {
  return placeNames[policy.id]?.[mapId];
}
export function worldRegionName(mapId: string, policy: Pick<LanguagePolicy, 'id'> = language): string | undefined {
  const place = worldPlaceName(mapId, policy), hint = regionHints[policy.id];
  return place && hint ? `${place}，${hint}` : place;
}
