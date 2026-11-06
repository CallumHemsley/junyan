const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ts=require('typescript');
const head='23be251185d989f7b97d36391a8f6478344b1a3b';
const dir=__dirname;
for(const [source,out] of [['src/world/lighting.ts','lighting'],['src/world/atmosphere/index.ts','atmosphere'],['src/world/atmosphere/canvas.ts','canvas']]){
 const text=execFileSync('git',['show',`${head}:${source}`],{encoding:'utf8'});
 fs.writeFileSync(path.join(dir,out+'.source.ts'),text);
 const js=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace('from "./atmosphere"','from "./atmosphere.mjs"');
 fs.writeFileSync(path.join(dir,out+'.mjs'),js);
}
(async()=>{
 const {colorShader}=await import('./lighting.mjs');
 const {sampleDayLight,sampleAtmosphere}=await import('./atmosphere.mjs');
 const {drawAtmosphereLayer}=await import('./canvas.mjs');
 const light={...sampleDayLight('morning'),ambient:[.5,.5,.5],sunStrength:0};
 const shade=colorShader(light);
 const repeated=[shade('#404040'),shade('#808080'),shade('#404040')];
 const exposureLight={...light,sunStrength:.5,sun:[255,255,255]};
 const exposed=colorShader(exposureLight);
 const first=exposed('#404040',1);
 const expectedNoExposure='#484848';
 const after=exposed(first,0);
 const phases={};
 for(const phase of ['morning','evening','night']){
  const frame=sampleAtmosphere({mapId:'review',day:1,timeOfDay:phase,elapsedMs:1000,seed:42,reducedMotion:false},{lights:[{id:'lamp',position:{x:1,y:1},radius:2,kind:'lamp'}],foliage:[{id:'grass',position:{x:2,y:2},radius:1,kind:'grass'}]});
  const captured=[];
  const raw={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){captured.push(this.fillStyle)}};
  const ctx=raw;
  drawAtmosphereLayer(ctx,frame.commands,'objects',p=>p);
  const lamp=frame.commands.find(c=>c.layer==='objects');
  const capturedGrass=[];
  raw.fill=function(){capturedGrass.push(this.fillStyle)};
  drawAtmosphereLayer(ctx,frame.commands,'ground',p=>p);
  phases[phase]={lampPreserved:captured[0]===`rgb(${lamp.color.join(',')})`,grassPreserved:capturedGrass[0]===`rgb(${frame.commands.find(c=>c.layer==='ground').color.join(',')})`,lampAuthoredRGB:lamp.color,lampWrittenStyle:captured[0],grassAlreadyShadedRGB:frame.commands.find(c=>c.layer==='ground').color,grassWrittenStyle:capturedGrass[0],material404040:colorShader(frame.light)('#404040')};
 }
 const equivalent={hex:shade('#404040'),rgb:shade([64,64,64]),css:shade('rgb(64,64,64)')};
 const results={equivalent,head,evidenceType:'Node execution of exact git-source functions with recording context; no browser screenshot claim',orderIndependence:{input:['#404040','#808080','#404040'],actual:repeated,expected:['#202020','#404040','#202020'],pass:repeated[0]===repeated[2]},exposure:{firstInput:'#404040',firstExposure:1,firstOutput:first,nextInput:first,nextExposure:0,expected:expectedNoExposure,actual:after,pass:after===expectedNoExposure},phases};
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));if(!results.orderIndependence.pass||!results.exposure.pass||Object.values(phases).some(p=>!p.lampPreserved||!p.grassPreserved)||new Set(Object.values(equivalent)).size!==1)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
