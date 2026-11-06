import { defineConfig } from '../../../../node_modules/vite/dist/node/index.js';
import react from '../../../../node_modules/@vitejs/plugin-react/dist/index.js';
import path from 'node:path';
const proof = '/workspace/scratch/residential-0081-proof';
const owner = '/workspace/junyan';
export default defineConfig({
 root: proof,
 plugins: [{name:'residential-owner-art-only',enforce:'pre',resolveId(source,importer){
  const resolved=source.startsWith('.')&&importer?path.resolve(path.dirname(importer),source):source;
  for(const domain of ['art','maps']){
   const prefix=`${proof}/src/world/${domain}/residential`;
   if(resolved===prefix||resolved.startsWith(prefix+'/'))return this.resolve(resolved.replace(proof,owner),undefined,{skipSelf:true});
  }
 }},react()],
 server:{host:'0.0.0.0',port:5483,strictPort:true,fs:{allow:[proof,owner]}},
});
