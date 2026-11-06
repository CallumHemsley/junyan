import {content} from '../../content';
import {backgroundResidents,type BackgroundResidentDefinition} from './background';
import type {RGB} from './artwork.mjs';

export type ActorCatalogEntry = {
  id:string;
  source:'player'|'regular'|'courtyard'|'background';
  appearance:{shirt:RGB;hair:RGB;legs?:RGB;accessory:string};
  cadenceMs:number;
  body?:BackgroundResidentDefinition['body'];
  role?:BackgroundResidentDefinition['role'];
  heldObject?:BackgroundResidentDefinition['heldObject'];
};
export const actorCatalog:readonly ActorCatalogEntry[] = [
  {id:'player',source:'player',appearance:{shirt:[82,104,125],hair:[54,43,34],legs:[70,57,49],accessory:'player'},cadenceMs:110},
  ...content.characters.map(character=>({id:character.id,source:'regular' as const,appearance:character.appearance,cadenceMs:character.id==='zhang-laoshi'?155:character.id==='xiao-li'?90:110})),
  {id:'aunt',source:'courtyard',appearance:{shirt:[145,151,132],hair:[82,70,59],legs:[66,68,65],accessory:'aunt'},cadenceMs:130,body:{heightOffset:0,widthOffset:1,headWidthOffset:0,lean:0,legWidth:3}},
  ...backgroundResidents.map(resident=>({...resident,source:'background' as const})),
];
const byId=new Map(actorCatalog.map(actor=>[actor.id,actor]));
export const supportedActorIds:readonly string[] = actorCatalog.map(actor=>actor.id);
export function supportsActor(characterId:string):boolean {return byId.has(characterId);}
export function getActorDefinition(characterId:string):ActorCatalogEntry|undefined {return byId.get(characterId);}
export type ActorDiagnostic = {code:'unsupported-human-actor';characterId:string;message:string};
function unsupportedIdentity(characterId:string):ActorDiagnostic {
  return {code:'unsupported-human-actor',characterId,message:`Unsupported human actor "${characterId}". Register an explicit identity before sampling.`};
}
export function diagnoseActorIds(characterIds:Iterable<string>):ActorDiagnostic[] {
  return [...new Set(characterIds)].filter(id=>!supportsActor(id)).map(unsupportedIdentity);
}
export class UnsupportedActorError extends Error {
  readonly diagnostic:ActorDiagnostic;
  constructor(characterId:string) {
    const diagnostic=unsupportedIdentity(characterId);
    super(diagnostic.message);this.name='UnsupportedActorError';this.diagnostic=diagnostic;
  }
}
