import {it,expect} from "vitest";
import {selectArtModules,artCoverage} from "./art-registry";
it("dispatches each map only to its leased art module",()=>{
 const courtyard={drawMap:()=>{}},roof={drawMap:()=>{}},residential={drawMap:()=>{}};
 const modules={"./art/courtyard/index.ts":courtyard,"./art/rooftop/index.ts":roof,"./art/residential/index.ts":residential};
 expect(selectArtModules(modules,"courtyard")).toEqual([courtyard]);expect(selectArtModules(modules,"rooftop")).toEqual([roof]);expect(selectArtModules(modules,"apartment")).toEqual([residential]);expect(selectArtModules(modules,"town")).toEqual([]);
});
it("has exactly one authored art module for every registered destination",()=>{expect(Object.values(artCoverage()).every(count=>count===1)).toBe(true);expect(Object.keys(artCoverage())).toHaveLength(10);});
