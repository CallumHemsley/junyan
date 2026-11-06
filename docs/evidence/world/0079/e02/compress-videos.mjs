import { execFileSync } from 'node:child_process';
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const out=resolve('docs/evidence/world/0079/e02');
const proof=JSON.parse(await readFile(resolve(out,'approaches/approach-proof.json'),'utf8'));
const videos=[];
for(const journey of proof.results) {
 const destination=resolve(out,`approaches-${journey.device}.mp4`);
 execFileSync('/usr/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-i',journey.rawVideo,'-an','-vf','fps=20','-c:v','libx264','-crf','28','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',destination]);
 const file=await readFile(destination);
 videos.push({device:journey.device,sourceHead:proof.sourceHead,filename:destination.split('/').at(-1),sha256:createHash('sha256').update(file).digest('hex'),bytes:file.length,rawVideo:journey.rawVideo,transform:'20fps H264 CRF28; original input sequence unchanged; no audio'});
}
await writeFile(resolve(out,'videos.json'),JSON.stringify({videos},null,2)+'\n');
