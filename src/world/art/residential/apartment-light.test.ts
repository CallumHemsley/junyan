import {describe,expect,it} from 'vitest';
import {apartmentReceiver} from './apartment-light';
const lamp={id:'apartment.reading-lamp',kind:'lamp',position:{x:18.4,y:15.5},width:1,height:1};
const map={id:'apartment',terrain:[],props:[lamp]};
const face={x:18.9,y:16,z:.08,normal:[0,0,1] as const};
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));

describe('physical apartment receiving surfaces',()=>{
 it('leaves morning/noon once-graded materials byte-identical and unsupported colors safe',()=>{
  for(const strength of [0,.04,.22])for(const color of ['#ac9072','#ac907280','rgb(12,20,30)','transparent']){
   expect(apartmentReceiver(map,strength)(color,[200,180,160],1,face)).toBe(color);
  }
  expect(apartmentReceiver(map,1)('rgba(12,20,30,.5)',[200,180,160],1,face)).toBe('rgba(12,20,30,.5)');
  expect(apartmentReceiver({...map,id:'residential-hall'},1)('#806040',[200,180,160],1,face)).toBe('#806040');
 });
 it('adds warm light to real nearby upper faces while leaving backs, distant surfaces and shade-above faces quiet',()=>{
  const shade=apartmentReceiver(map,1),ambient='#605044',base=[180,145,101] as const;
  const added=rgb(shade(ambient,base,1,face)).map((n,i)=>n-rgb(ambient)[i]);
  expect(added[0]).toBeGreaterThan(added[1]);expect(added[1]).toBeGreaterThan(added[2]);expect(added[2]).toBeGreaterThan(0);
  for(const sample of [{...face,x:2},{...face,z:2.1},{...face,normal:[0,0,-1] as const}])expect(shade(ambient,base,1,sample)).toBe(ambient);
  const darker=rgb(shade(ambient,base,.65,face)).map((n,i)=>n-rgb(ambient)[i]);
  expect(darker.every((n,i)=>n<=added[i])).toBe(true);
 });
 it('tracks the actual fixture and samples height, with bounded channels and preserved opacity bytes',()=>{
  const shade=apartmentReceiver(map,1),moved=apartmentReceiver({...map,props:[{...lamp,position:{x:8.4,y:5.5}}]},1);
  expect(moved('#605044',[180,145,101],1,face)).toBe('#605044');
  const low=rgb(shade('#605044',[180,145,101],1,face));
  const high=rgb(shade('#605044',[180,145,101],1,{...face,z:1.1}));
  expect(high.every((n,i)=>n>=low[i])).toBe(true);
  const bright=shade('#f8f0e8a0',[255,255,255],2,face);
  expect(rgb(bright).every(n=>n<=255)).toBe(true);expect(bright.slice(7)).toBe('a0');

 });
 it('receives cool window light only into the room from actual pane heights',()=>{
  const window={id:'apartment.window-one',kind:'window',position:{x:5,y:2},width:5,height:.25};
  const shade=apartmentReceiver({...map,props:[window]},1),base=[180,180,180] as const;
  const sample={x:7,y:3.5,z:.05,normal:[0,0,1] as const};
  const added=rgb(shade('#404040',base,1,sample)).map(value=>value-64);
  expect(added[2]).toBeGreaterThan(added[0]);expect(added[0]).toBeGreaterThan(0);
  expect(shade('#404040',base,1,{...sample,y:1})).toBe('#404040');
 });
});
