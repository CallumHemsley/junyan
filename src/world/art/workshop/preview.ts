import { createRenderer } from '../../../scene/renderer.js';
import { initialState, type State } from '../../../features/repairs/rules';
import { workshopPreviewScene } from './preview-scene';

const canvas=document.querySelector('canvas')!;
const views: Record<string,{focus:{x:number;y:number};player:{x:number;y:number}}>={
  '台灯':{focus:{x:9,y:9},player:{x:10.9,y:11}},
  '玩具':{focus:{x:21,y:9},player:{x:17,y:11}},
  '架子':{focus:{x:20,y:4},player:{x:18,y:6}},
  '木头':{focus:{x:11,y:17},player:{x:12,y:18}},
  '门口':{focus:{x:15,y:23},player:{x:15,y:24.5}},
};
let repair:State=initialState(), current=views['台灯'];
let renderer=createRenderer(canvas,workshopPreviewScene(current.focus));
let frame=0;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
function draw(now:number){frame=0;renderer.draw({repairs:repair,elapsedSeconds:preference.matches?0:now/1000},current.player);if(!document.hidden&&!preference.matches) frame=requestAnimationFrame(draw);}
function refresh(){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}
for(const [label,view] of Object.entries(views)) {
 const button=document.createElement('button');button.textContent=label;
 button.onclick=()=>{current=view;renderer=createRenderer(canvas,workshopPreviewScene(view.focus));document.querySelector('#coordinates')!.textContent=`${view.focus.x}, ${view.focus.y}`;refresh();};
 document.querySelector('#views')!.append(button);
}
document.querySelector('#finished')!.addEventListener('click',()=>{repair={...repair,completed:['lamp','toy'],jobs:{lamp:null,toy:null}};refresh();});
document.querySelector('#reset')!.addEventListener('click',()=>{repair=initialState();refresh();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else refresh();});
preference.addEventListener('change',refresh);
refresh();
