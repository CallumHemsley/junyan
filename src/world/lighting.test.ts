import {it,expect} from "vitest";
import {colorShader} from "./lighting";
import {sampleDayLight,shadeAtmosphereColor} from "./atmosphere";
it("shades identical base material independently of earlier outputs",()=>{
 const shade=colorShader({...sampleDayLight("morning"),ambient:[.5,.5,.5],sunStrength:0});
 expect(shade("#404040")).toBe("#202020");expect(shade("#808080")).toBe("#404040");expect(shade("#404040")).toBe("#202020");
});
it("preserves exposure and material alpha without a context colour proxy",()=>{
 const light=sampleDayLight("evening"),shade=colorShader(light);
 const expected=shadeAtmosphereColor([128,128,128],light,0).map(v=>v.toString(16).padStart(2,"0")).join("");
 expect(shade("#80808080",0)).toBe(`#${expected}80`);
 expect(shade("#808080",1)).not.toBe(shade("#808080",0));
});
