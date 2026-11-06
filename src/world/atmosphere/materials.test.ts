import {expect,it} from 'vitest';
import {shadeAtmosphereCss} from './materials';
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
