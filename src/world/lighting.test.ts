import {it,expect} from "vitest";
import {colorShader} from "./lighting";
import {sampleDayLight,shadeAtmosphereColor} from "./atmosphere";
it("shades identical base material independently of earlier outputs",()=>{
 const shade=colorShader({...sampleDayLight("morning"),ambient:[.5,.5,.5],sunStrength:0});
 expect(shade("#404040")).toBe("#202020");expect(shade("#808080")).toBe("#404040");expect(shade("#404040")).toBe("#202020");
});
it("preserves material brightness and alpha without changing atmospheric solar exposure",()=>{
 const light=sampleDayLight("evening"),shade=colorShader(light);
 const expected=shadeAtmosphereColor([64,64,64],light).map(v=>v.toString(16).padStart(2,"0")).join("");
 expect(shade("#80808080",.5)).toBe(`#${expected}80`);
 expect(shade("#808080",1)).toBe(colorShader(light)([128,128,128]));
 expect(shade("#808080",0)).toBe("#000000");
 expect(shadeAtmosphereColor([128,128,128],light,0)).not.toEqual([0,0,0]);
});
it("retains the residential and town side-face values when ambient light dominates",()=>{
 const shade=colorShader({...sampleDayLight("night"),ambient:[1,1,1],sunStrength:0});
 expect(shade("#808080",.65)).toBe("#535353");
 expect(shade([128,128,128],.78)).toBe("#646464");
});
it("retains material-plane separation through every interior day phase",()=>{
 for(const phase of ["morning","noon","evening","night"] as const){
  const shade=colorShader({...sampleDayLight(phase),ambient:[.92,.89,.83],sunStrength:.04});
  const top=shade("#a08060"),side=shade("#a08060",.65);
  for(const at of [1,3,5])expect(parseInt(side.slice(at,at+2),16)).toBeLessThan(parseInt(top.slice(at,at+2),16)*.75);
 }
});
