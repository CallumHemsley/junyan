import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import * as head from './renderer.js';
import {portraitScene} from './portrait-scene.js';
import {png} from './png.mjs';

const directory=resolve(process.argv[2] || 'output/playwright/0029');
const baseline=process.argv[3] || 'eeeb18d';
await mkdir(directory,{recursive:true});
const content=JSON.parse(await readFile(new URL('../content/content.json',import.meta.url),'utf8'));
const cast=[{id:'waiter',appearance:{shirt:[245,232,202],legs:[63,78,74],hair:[54,43,34],skin:[228,177,132]}},...content.characters];
const poses=['standing','seated','served','walk-a','walk-b'];
const sources={before:execFileSync('git',['show',`${baseline}:src/scene/renderer.js`],{encoding:'utf8'}),after:await readFile(new URL('./renderer.js',import.meta.url),'utf8')};
const hash=value=>createHash('sha256').update(value).digest('hex');
const images={before:[],after:[]},geometry={before:[],after:[]},eyeEvidence=[];
const poseFor=(name,accessory)=>name==='seated'||name==='served'
  ? {crouch:1.05,scale:.88,armR:name==='served'?.85:.35,armL:.3,greeting:name!=='served',lean:name==='served'?.1:accessory==='glasses'?.08:0}
  : {carry:!accessory,stance:name==='walk-a'?Math.sin(.1*12)*.17:name==='walk-b'?Math.sin(.35*12)*.17:.05};
const baselinePath=resolve(directory,'before-renderer.mjs');
await writeFile(baselinePath,sources.before);
const figures={before:await import(pathToFileURL(baselinePath).href+`?v=${Date.now()}`),after:head};
for(const [version,module] of Object.entries(figures)) {
  let frame;
  const renderer=head.createRenderer({getContext:()=>({createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)}),putImageData:image=>{frame=image.data.slice();}})},portraitScene(module));
  for(const poseName of poses) for(let direction=0;direction<8;direction++) for(const character of cast) {
    const yaw=direction*Math.PI/4,pose=poseFor(poseName,character.appearance.accessory),bones=[];
    module.characterFigure(0,0,yaw,pose,character.appearance,(start,end,startRadius,endRadius,colorOf)=>bones.push({start,end,startRadius,endRadius,color:colorOf(start[2])}));
    renderer.draw(character.appearance,yaw,pose,Array(6).fill('bun'));
    images[version].push({pose:poseName,direction,id:character.id,pixels:frame});
    geometry[version].push({pose:poseName,direction,id:character.id,bones});
    if(character.appearance.accessory!=='glasses'&&[1,4,5,6].includes(direction)) {
      const withEyes=frame;
      renderer.draw(character.appearance,yaw,pose,Array(6).fill('bun'),true);
      let changedPixels=0;
      for(let offset=0;offset<frame.length;offset+=4) if(frame.subarray(offset,offset+4).some((value,index)=>value!==withEyes[offset+index])) changedPixels++;
      if(direction===5||(version==='after'&&direction!==1)) assert.equal(changedPixels,0,`${version} ${character.id} ${poseName} ${direction*45}°: rear eyes must be naturally hidden`);
      eyeEvidence.push({version,id:character.id,pose:poseName,direction,changedPixels});
    }
  }
  for(let direction=0;direction<8;direction++) {
    renderer.draw(cast[0].appearance,direction*Math.PI/4,poseFor('standing'),[]);
    images[version].push({pose:'empty-tray',direction,id:'waiter',pixels:frame});
  }
}
const elder=cast.find(character=>character.appearance.accessory==='glasses').id;
const proof=[];
for(const after of eyeEvidence.filter(item=>item.version==='after'&&item.direction===1)) {
  const before=eyeEvidence.find(item=>item.version==='before'&&item.id===after.id&&item.pose===after.pose&&item.direction===1);
  assert(after.changedPixels>before.changedPixels,`${after.id} ${after.pose}: enlarged eyes must affect more native pixels`);
}
for(let index=0;index<geometry.before.length;index++) {
  const before=geometry.before[index],after=geometry.after[index];
  if(before.id===elder) {
    assert.deepEqual(after,before);
    assert.deepEqual(images.after[index].pixels,images.before[index].pixels);
    proof.push({pose:before.pose,direction:before.direction,geometry:hash(JSON.stringify(before.bones)),portrait:hash(images.before[index].pixels)});
  } else {
    const palette=cast.find(character=>character.id===before.id).appearance;
    const unchanged=bones=>bones.filter(bone=>{
      const head=bone.start[2]>(before.pose==='seated'||before.pose==='served'?1.7:2);
      const editedColors=[palette.hair,[48,43,42],...(head?[[111,154,134],[190,157,97],[245,232,202]]:[])];
      return !editedColors.some(color=>JSON.stringify(color)===JSON.stringify(bone.color));
    });
    assert.deepEqual(unchanged(after.bones),unchanged(before.bones));
  }
}
function crop(pixels,left,top,width,height) {
  const result=new Uint8ClampedArray(width*height*4);
  for(let row=0;row<height;row++) result.set(pixels.subarray(((top+row)*360+left)*4,((top+row)*360+left+width)*4),row*width*4);
  return result;
}
function enlarge(pixels,width,height,scale) {
  const result=new Uint8ClampedArray(width*height*scale*scale*4);
  for(let row=0;row<height*scale;row++) for(let column=0;column<width*scale;column++) {
    const offset=(Math.floor(row/scale)*width+Math.floor(column/scale))*4;
    result.set(pixels.subarray(offset,offset+4),(row*width*scale+column)*4);
  }
  return result;
}
const browser=await chromium.launch({args:['--mute-audio']});
try {
  const page=await browser.newPage();
  for(const pose of [...poses,'empty-tray']) {
    const cards=[];
    for(let direction=0;direction<8;direction++) for(const character of pose==='empty-tray'?[cast[0]]:cast) for(const version of ['before','after']) {
      const item=images[version].find(item=>item.pose===pose&&item.direction===direction&&item.id===character.id);
      const bytes=png(crop(item.pixels,148,98,68,62),68,62);
      const name=`${version}-${pose}-${direction}-${character.id}.png`;
      await writeFile(resolve(directory,name),bytes);
      if(pose==='standing'&&direction===1) await writeFile(resolve(directory,`${version}-${character.id}-native-360x280.png`),png(item.pixels));
      cards.push(`<figure><figcaption>${character.id} ${direction*45}° ${version}</figcaption><img src="data:image/png;base64,${bytes.toString('base64')}" /></figure>`);
    }
    for(const scale of [1,3]) {
      const columns=pose==='empty-tray'?2:10;
      const html=`<!doctype html><meta charset="utf-8"><style>body{margin:8px;background:#ebe1cf;color:#302b2a;font:10px system-ui}main{display:grid;grid-template-columns:repeat(${columns},${68*scale+8}px);gap:4px}figure{margin:0}img{width:${68*scale}px;height:${62*scale}px;image-rendering:pixelated}figcaption{height:26px;overflow:hidden}</style><main>${cards.join('')}</main>`;
      await writeFile(resolve(directory,`${pose}-${scale}x.html`),html);
      await page.setViewportSize({width:columns*(68*scale+12)+16,height:800});
      await page.setContent(html);
      await page.screenshot({path:resolve(directory,`${pose}-${scale}x.png`),fullPage:true});
    }
  }
  const cards=[];
  for(let direction=0;direction<8;direction++) for(const character of cast) for(const version of ['before','after']) {
    const item=images[version].find(item=>item.pose==='standing'&&item.direction===direction&&item.id===character.id);
    const bytes=png(crop(item.pixels,166,103,30,29),30,29);
    cards.push(`<figure><figcaption>${character.id} ${direction*45}° ${version}</figcaption><img src="data:image/png;base64,${bytes.toString('base64')}" /></figure>`);
  }
  for(const scale of [1,4]) {
    await page.setViewportSize({width:1320,height:900});
    await page.setContent(`<!doctype html><style>body{background:#ebe1cf;font:11px system-ui}main{display:grid;grid-template-columns:repeat(10,126px);gap:4px}figure{margin:0}img{width:${30*scale}px;height:${29*scale}px;image-rendering:pixelated}figcaption{height:30px}</style><main>${cards.join('')}</main>`);
    await page.screenshot({path:resolve(directory,`head-closeups-${scale}x.png`),fullPage:true});
  }
} finally {await browser.close();}
await mkdir(resolve(directory,'turntable'),{recursive:true});
for(let frame=0;frame<40;frame++) {
  const pose=poses[Math.floor(frame/8)],direction=frame%8,montage=new Uint8ClampedArray(340*62*4);
  cast.forEach((character,index)=>{
    const item=images.after.find(item=>item.pose===pose&&item.direction===direction&&item.id===character.id);
    const pixels=crop(item.pixels,148,98,68,62);
    for(let row=0;row<62;row++) montage.set(pixels.subarray(row*68*4,(row+1)*68*4),(row*340+index*68)*4);
  });
  await writeFile(resolve(directory,`turntable/${String(frame).padStart(3,'0')}.png`),png(enlarge(montage,340,62,4),1360,248));
}
execFileSync('ffmpeg',['-y','-framerate','4','-i',resolve(directory,'turntable/%03d.png'),'-an','-c:v','libx264','-pix_fmt','yuv420p',resolve(directory,'all-five-silent-turntable.mp4')],{stdio:'pipe'});
const streams=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_streams','-of','json',resolve(directory,'all-five-silent-turntable.mp4')],{encoding:'utf8'}));
assert(streams.streams.every(stream=>stream.codec_type!=='audio'));
await writeFile(resolve(directory,'elder-proof.json'),JSON.stringify({baseline,sourceHashes:{before:hash(sources.before),after:hash(sources.after)},elder,comparisons:proof.length,exactGeometry:true,exactPortraitPixels:true,otherCastNonHairAndEyeGeometryUnchanged:true,proof,eyeEvidence,videoStreams:streams.streams.map(stream=>({type:stream.codec_type,codec:stream.codec_name})),castOrder:cast.map(character=>character.id),poseOrder:poses},null,2));
console.log(`${directory}: ${geometry.after.length} paired cast portraits, 8 paired empty trays; ${proof.length} exact elder geometry + pixel comparisons; video has no audio stream`);
