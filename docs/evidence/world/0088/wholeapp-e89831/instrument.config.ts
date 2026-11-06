import original from '/workspace/junyan-wholeapp-e89831/vite.config';
import ts from 'typescript';
const out='/workspace/junyan/docs/evidence/world/0088/wholeapp-e89831';
const wanted:Record<string,string[]>={
'/src/App.tsx':['App'], '/src/world/WorldViewport.tsx':['WorldViewport'],
'/src/opening.ts':['reduceSession'],'/src/neighbourhood/transitions.ts':['reduceNeighbourhoodGame'],
'/src/world/state.ts':['restoreWorld','reduceWorld'],'/src/world/dynamic.ts':['mapsForNeighbourhood'],
'/src/world/exit-safety.ts':['safeExitPosition','isExitConnected','exitComponent'],
'/src/save.ts':['validateSavedGame','saveGame'],'/src/world/life-bridge.ts':['actorsFor','planFor'],
'/src/world/painter.ts':['paintWorld'], '/src/world/characters/index.ts':['sampleActor'],
'/src/world/characters/adapter.ts':['drawActor','paintActorCanvas','actorCommands'],
'/src/world/characters/artwork.mjs':['frame'],
'/src/world/art/residential/index.ts':['drawMap','renderObjects','drawResidentialFloor','drawResidentialProps','drawResidentialProp','drawFurniture','drawApartmentFurniture','paintResidential'],
'/src/world/art/landscape/index.ts':['drawMap','renderObjects'],
'/src/world/art/landscape/draw.ts':['drawLandscapeProp'],
'/src/world/art/town/index.ts':['drawMap','renderObjects','drawProp'],
'/src/world/art/restaurant/index.ts':['drawMap','renderObjects','restaurantObjects'],
'/src/world/atmosphere/canvas.ts':['drawAtmosphere','renderAtmosphereObjects']};
export default {...original,build:{...original.build,outDir:out+'/diagnostic-dist',sourcemap:true,emptyOutDir:true},plugins:[{name:'review-timing',enforce:'pre' as const,transform(code:string,id:string){const file=Object.keys(wanted).find(k=>id.endsWith(k));if(!file)return;
if(file==='/src/world/art/residential/index.ts')code=code.replace('draw(api);','globalThis.__wpSpan("residential.queue",()=>draw(api));').replace('paints.sort((a, b) => a.depth - b.depth).forEach(p => p.draw());','globalThis.__wpSpan("residential.flush",()=>paints.sort((a, b) => a.depth - b.depth).forEach(p => p.draw()));');
if(file==='/src/world/WorldViewport.tsx')code=code.replace('const tick=(now:number)=>{','const tick=(now:number)=>{if(globalThis.__wp?.active)globalThis.__wp.appRafTimes.push(now);');
if(file==='/src/App.tsx')code=code.replace('localStorage.setItem(checkpointKey, JSON.stringify(next.game));','globalThis.__wpSpan("checkpoint",()=>localStorage.setItem(checkpointKey, JSON.stringify(next.game)));');
if(file==='/src/world/state.ts')code=code.replace('savedSchema.safeParse(value)','globalThis.__wpSpan("worldSchema.safeParse",()=>savedSchema.safeParse(value))');
if(file==='/src/world/painter.ts'){
code=code.replace('for(const actor of actors)objects.push', 'if((globalThis as any).__wp?.active && !(globalThis as any).__wp.workload)(globalThis as any).__wp.workload={mapId:map.id,props:map.props.length,custom:custom.length,restaurantCustomers:restaurant?.customers.length??0,actors:actors.map(a=>({id:a.id,characterId:a.characterId,position:a.position,screen:view.project(a.position)})),player:view.playerPosition}; for(const actor of actors)objects.push');
code=code.replace('for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"ground"});','globalThis.__wpSpan("ground",()=>{for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"ground"});});');
code=code.replace('objects.sort((a,b)=>a.depth-b.depth).forEach(object=>object.draw());','globalThis.__wpSpan("sortedObjects",()=>{objects.sort((a,b)=>a.depth-b.depth).forEach(object=>object.draw());});');
code=code.replace('for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"foreground"});','globalThis.__wpSpan("foreground",()=>{for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"foreground"});});');
}
const source=ts.createSourceFile(id,code,ts.ScriptTarget.Latest,true,id.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),edits:any[]=[];
const wrap=(name:string,body:ts.Block)=>{const start=body.getStart(source)+1,end=body.end-1;let label=JSON.stringify(file.slice(5)+':'+name);if(name==='drawMap')label+='+":"+(typeof view!=="undefined"?view.pass:v.pass)';if(name==='drawProp'||name==='drawLandscapeProp')label+='+":"+prop.kind';edits.push({start,end,text:`const __rp=globalThis.__wp; const __rt=performance.now(); ${name==='paintWorld'?'if(__rp?.active)__rp.paintStarts.push(__rt);':''} try {${code.slice(start,end)}} finally {${name==='paintWorld'?'if(__rp?.active)__rp.paintEnds.push(performance.now());':''}if(__rp?.active)__rp.add(${label},performance.now()-__rt);}`});};
for(const node of source.statements){if(ts.isFunctionDeclaration(node)&&node.name&&wanted[file].includes(node.name.text)&&node.body)wrap(node.name.text,node.body);if(ts.isVariableStatement(node))for(const d of node.declarationList.declarations){if(ts.isIdentifier(d.name)&&wanted[file].includes(d.name.text)&&d.initializer&&ts.isArrowFunction(d.initializer)&&ts.isBlock(d.initializer.body))wrap(d.name.text,d.initializer.body);}}
for(const e of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,e.start)+e.text+code.slice(e.end);return {code,map:null}}},...(original.plugins??[])]};
