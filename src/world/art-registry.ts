import type {WorldArtModule} from "./render-contract";
const ownership:Record<string,readonly string[]>={"reading-room":["reading-room"],town:["town"],courtyard:["courtyard"],residential:["residential-hall","residential-stairs","apartment"],workshop:["workshop"],rooftop:["rooftop"],landscape:["park","riverbank"],restaurant:["restaurant"]};
export function selectArtModules(modules:Record<string,WorldArtModule>,mapId:string):WorldArtModule[] {
 return Object.entries(modules).filter(([path])=>{const owner=path.split("/").at(-2)!;return ownership[owner]?.includes(mapId);}).map(([,module])=>module);
}
export const artModules=import.meta.glob<WorldArtModule>("./art/*/index.ts",{eager:true});
export function artCoverage() {return Object.fromEntries(Object.values(ownership).flat().map(id=>[id,selectArtModules(artModules,id).length]));}
