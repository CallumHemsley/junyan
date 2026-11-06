import type {WorldMapDefinition,WorldState} from "./schema";
import type {InteractionTarget} from "./ui";
import {targets} from "../features/cats/rules";
export function activityTarget(world:WorldState,map:WorldMapDefinition):InteractionTarget|null {
 const anchor=map.anchors.find(a=>a.id===world.activeAnchorId);
 if(!anchor||anchor.featureId!==world.activeActivity)return null;
 if(anchor.featureId==="restaurant") {
  if(anchor.interactionId==="kitchen")return {kind:"kitchen"};
  const match=anchor.interactionId.match(/^table-([1-4])$/);return match?{kind:"table",table:Number(match[1])}:null;
 }
 if(anchor.featureId==="repairs")return {kind:"repair",job:anchor.interactionId==="repair-toy"?"toy":"lamp"};
 if(anchor.featureId==="cats") {const target=anchor.interactionId.replace(/^cats\./,"");return {kind:"cat",target:targets.find(id=>id===target)??"aunt"};}
 if(anchor.featureId==="garden")return {kind:"garden",plantId:anchor.interactionId.startsWith("garden.")?anchor.interactionId.slice(7):null};
 if(anchor.featureId==="apartment")return {kind:"apartment",itemId:null};
 return null;
}
