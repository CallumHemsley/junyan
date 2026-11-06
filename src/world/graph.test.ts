import {it,expect} from "vitest";
import {worldMaps} from "./registry";
import {validateWorldGraph} from "./validation";
it("connects every registered spawn, activity and exit",()=>{expect(validateWorldGraph(worldMaps)).toEqual([]);});
