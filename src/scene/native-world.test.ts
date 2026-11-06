import {expect,it} from 'vitest';
import {createRenderer,type SceneApi} from './renderer.js';
import {captureCanvas} from './scene-frame-hashes.mjs';

function native(ppu:number,originX=180,originY=150,draw:(api:SceneApi)=>void=()=>{}) {
  const canvas=captureCanvas();let api!:SceneApi;
  const renderer=createRenderer(canvas as unknown as HTMLCanvasElement,{
    bake(a){api=a;a.pix.fill(0);a.zb.fill(-1e9);a.groundZ.fill(-1e9);},draw,
  },{nativeWorld:{pixelsPerWorldUnit:ppu,originX,originY}});
  renderer.draw();return {api,pixels:canvas.frame};
}
it('matches the native camera and inverse with orthonormal world depth across scales and fractional/offscreen origins',()=>{
  for(const ppu of [11,15,18])for(const [ox,oy] of [[180,150],[180.25,150.75],[-12.125,24.5]]) {
    const {api}=native(ppu,ox,oy);
    for(const x of [-2,0,1.5])for(const y of [-1,0,2.25])for(const z of [0,.09,.13,.77,1.44,2.6]) {
      const p=api.project(x,y,z);
      expect(p.sx).toBeCloseTo(ox+(x-y)*ppu,10);expect(p.sy).toBeCloseTo(oy+(.5*(x+y)-z)*ppu,10);
      expect(p.d).toBeCloseTo((x+y+z)/Math.sqrt(3),10);
      if(z===0) {expect(api.unproject(p.sx,p.sy).x).toBeCloseTo(x,10);expect(api.unproject(p.sx,p.sy).y).toBeCloseTo(y,10);}
    }
  }
});
it('keeps native sphere coverage and nearest depth analytical under anisotropic screen scale',()=>{
  for(const ppu of [11,15,18])for(const [ox,oy] of [[180,150],[180.25,150.75]]) {
    const spheres=[{p:[0,0,.13],r:.13},{p:[.08,.08,.16],r:.13}];
    const {api,pixels}=native(ppu,ox,oy,a=>{for(const {p,r} of spheres)a.sphere(p[0],p[1],p[2],r,[200,150,100],'solid');});
    let coverageErrors=0,maxDepthError=0;
    for(let y=0;y<280;y++)for(let x=0;x<360;x++) {
      let expected=-1e9;
      for(const {p,r} of spheres) {
        const q=api.project(p[0],p[1],p[2]),dx=(x+.5-q.sx)/(r*ppu*Math.SQRT2),dy=(y+.5-q.sy)/(r*ppu*Math.sqrt(3/2));
        if(dx*dx+dy*dy<=1)expected=Math.max(expected,q.d+r*Math.sqrt(1-dx*dx-dy*dy));
      }
      const i=y*360+x;
      if((pixels[i*4+3]>0)!==(expected>-1e8))coverageErrors++;
      if(expected>-1e8)maxDepthError=Math.max(maxDepthError,Math.abs(api.zb[i]-expected));
    }
    expect(coverageErrors).toBe(0);expect(maxDepthError).toBeLessThan(1e-6);
  }
});
it('prints cloth on existing samples without changing coverage or internal depth',()=>{
  for(const ppu of [11,15,18]) {
    const paint=(printed:boolean)=>native(ppu,180,150,api=>api.box(-1,-1,0,1,1,.13,[132,158,127],0,null,{kind:'cloth',bands:printed?[{center:0,width:.14,color:[151,175,137]}]:[]}));
    const before=paint(false),after=paint(true);let changed=0;
    expect(after.api.zb).toEqual(before.api.zb);
    let alphaErrors=0;
    for(let i=0;i<before.pixels.length;i+=4) {
      if(after.pixels[i+3]!==before.pixels[i+3])alphaErrors++;
      if(after.pixels[i]!==before.pixels[i])changed++;
    }
    expect(alphaErrors).toBe(0);expect(changed).toBeGreaterThan(0);
  }
});
it('rejects nonpositive/nonfinite native scales and invalid origins',()=>{
  for(const ppu of [0,-1,NaN,Infinity])expect(()=>native(ppu)).toThrow(RangeError);
  expect(()=>native(11,NaN)).toThrow(RangeError);
});
