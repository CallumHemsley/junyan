import {expect,it} from 'vitest';
import {shadeAtmosphereCss,createAtmosphereColorShader} from './materials';
import {sampleDayLight,shadeAtmosphereColor} from './index';
it('shades material RGB channels without lifting ink into a warm wash',()=>{
 for(const phase of ['morning','noon','evening','night'] as const) expect(shadeAtmosphereColor([0,0,0],sampleDayLight(phase))).toEqual([0,0,0]);
 expect(shadeAtmosphereColor([80,140,95],sampleDayLight('night'))[1]).toBeGreaterThan(shadeAtmosphereColor([80,140,95],sampleDayLight('night'))[0]);
 expect(shadeAtmosphereCss('#789454',sampleDayLight('morning'))).not.toEqual(shadeAtmosphereCss('#789454',sampleDayLight('evening')));
});
it('preserves authored transparency for short/long hex and rgba material paint',()=>{
 const light=sampleDayLight('evening');
 expect(shadeAtmosphereCss('#abc8',light)).toMatch(/,0\.5333333333333333\)$/);
 expect(shadeAtmosphereCss('#11223380',light)).toMatch(/,0\.5019607843137255\)$/);
 expect(shadeAtmosphereCss('rgba(17,34,51,0.2)',light)).toMatch(/,0\.2\)$/);
 expect(shadeAtmosphereCss('#abc',light)).toEqual(shadeAtmosphereCss('rgb(170,187,204)',light));
 expect(shadeAtmosphereCss('transparent',light)).toBe('transparent');
});

it('keeps base material colour and exposure independent of earlier output values',()=>{
 const light={...sampleDayLight('morning'),ambient:[.5,.5,.5] as const,sunStrength:0};
 const shade=createAtmosphereColorShader(light);
 const first=shade('#404040');
 expect(shade('#808080')).toBe('rgba(64,64,64,1)');
 expect(shade('#404040')).toBe(first);
 expect(shade('rgba(64,64,64,1)')).toBe(first);
 const sun=createAtmosphereColorShader(sampleDayLight('morning'));
 const exposed=sun('#808080',1),unexposed=sun('#808080',0);
 expect(exposed).not.toBe(unexposed);
 expect(sun('#808080',1)).toBe(exposed);
 expect(sun('#808080',0)).toBe(unexposed);
});
