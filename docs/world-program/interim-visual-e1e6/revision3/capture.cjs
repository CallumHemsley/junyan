const {chromium}=require('@playwright/test');
const fs=require('node:fs');const crypto=require('node:crypto');
const hash=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
(async()=>{
 const fixtureSet=JSON.parse(fs.readFileSync('audit/revision3/fixtures.json'));
 const provenance=JSON.parse(fs.readFileSync('audit/provenance.json'));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});
 const report={base:provenance.base,method:fixtureSet.method,trialProvenanceHash:hash('audit/provenance.json'),productionIndexHash:hash('dist/index.html'),sourceHashes:Object.fromEntries(['src/world/WorldViewport.tsx','src/world/camera.ts','src/world/art/restaurant/projection.ts','src/world/characters/artwork.mjs','src/world/art/courtyard/index.ts','src/world/life/model.ts','src/world/art/landscape/index.ts','src/world/art/landscape/foliage.ts','src/world/maps/landscape/park.json','src/world/maps/landscape/riverbank.json','src/world/art/rooftop/index.ts','src/world/art/rooftop/roofscape.ts','src/world/maps/rooftop/map.json'].map(path=>[path,hash(path)])),captureSetupCorrection:'Initial /junyan/ preview URL served HTML for module assets; final captures use verified root5502/. This was an audit URL error, not a product defect.',limitations:['Actual customers use fixed south-facing seated projection. View names describe player positions only.','Workshop active light selector is not consumed by base painter.','Main semantic merge is absent. This revision3 includes compatible life source and the coordinator reports tsc/build pass.'],revision:'revision3',compatibleLife:'93deae997f26de60c419ea17203d39773c17084a',landscape:'400abbf',rooftop:'f5ad803',typecheck:'Coordinator reports current revision2 typecheck and build pass; this capture probe separately validates declared fixtures.',records:[]};
 if(process.env.AUDIT_CANOPY_ONLY==='1'){const previous=JSON.parse(fs.readFileSync('audit/revision3/captures.json'));report.records=previous.records.filter(row=>!row.fixtureId.startsWith('old-ferry-canopy-'));}
 const flush=()=>fs.writeFileSync('audit/revision3/captures.json',JSON.stringify(report,null,2)+'\n');
 for(const [device,width,height] of [['phone',390,844],['desktop',1440,1000]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});const page=await context.newPage();let errors=[],consoleErrors=[],httpFailures=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push({text:message.text(),location:message.location()});});page.on('response',response=>{if(response.status()>=400)httpFailures.push({url:response.url(),status:response.status()});});page.on('requestfailed',request=>httpFailures.push({url:request.url(),failure:request.failure()?.errorText}));
  for(const fixture of fixtureSet.fixtures.filter(fixture=>process.env.AUDIT_CANOPY_ONLY!=='1'||fixture.id.startsWith('old-ferry-canopy-'))){
   errors=[];consoleErrors=[];httpFailures=[];await page.goto('http://127.0.0.1:5502/audio/manifest.json');
   await page.evaluate(async save=>{localStorage.removeItem('junyan-waiter-pending-v1');const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(save,'v1');tx.oncomplete=resolve;tx.onerror=reject});db.close();},fixture.save);
   await page.goto('http://127.0.0.1:5502/');try{await page.getByTestId('world-viewport').waitFor({timeout:8000});}catch(error){await page.screenshot({path:'audit/revision3/capture-start-failure.png'});console.log('STARTFAIL',await page.locator('body').innerText(),errors);throw error;}
   const help=page.getByRole('dialog',{name:'怎么玩',exact:true});if(await help.count())await help.getByRole('button',{name:'关闭',exact:true}).click();
   await page.waitForTimeout(450);
   const capture=async suffix=>{
    const file=`audit/revision3/${device}-${fixture.id}${suffix}.png`;const actualMap=await page.getByTestId('world-viewport').getAttribute('data-map');
    const actual=await page.evaluate(async()=>{const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result)});const result=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result)});db.close();return {...result.world,served:result.served};});
    if(actualMap!==fixture.mapId)throw Error(`fixture map rejected ${fixture.id}: ${actualMap}`);
    if(actual.served!==fixture.served)throw Error(`phase fixture rejected ${fixture.id}: served${actual.served}`);
    const blockingOverlays=await page.locator('.modal-backdrop').count();const contextual=await page.locator('.world-context').count();
    await page.screenshot({path:file});report.records.push({device,viewport:{width,height},fixtureId:fixture.id,subject:fixture.subject,file,sha256:hash(file),actualMap,actualPosition:actual.position,requestedPosition:fixture.position,actualFacing:actual.facing,phase:fixture.phase,actualServed:actual.served,occlusionEvidence:fixture.occlusionEvidence,blockingOverlays,contextual,errors:[...errors],consoleErrors:[...consoleErrors],httpFailures:[...httpFailures],customerSeparation:fixture.customerSeparation,customerPose:fixture.table?'fixed south-facing seated, not rotated by player viewpoint':undefined});flush();console.log(file);
   };
   await capture('');
   if(fixture.id==='kitchen'){
    await page.getByRole('button',{name:'托盘',exact:true}).click();await capture('-tray-modal');await page.getByRole('button',{name:'关闭',exact:true}).click();
   }
  }
  await context.close();
 }
 await browser.close();flush();if(report.records.some(r=>r.errors.length))throw Error('page errors in capture records');
})().catch(error=>{console.error(error);process.exit(1)});
