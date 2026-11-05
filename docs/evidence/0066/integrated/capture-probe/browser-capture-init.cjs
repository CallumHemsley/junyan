module.exports = ()=>{
 const ac=new AudioContext({sampleRate:48000});
 const destination=ac.createMediaStreamDestination();
 const seen=new WeakMap();
 const events=[];
 const original=HTMLMediaElement.prototype.play;
 function tap(media){if(!seen.has(media)){const node=ac.createMediaElementSource(media);node.connect(destination);node.connect(ac.destination);seen.set(media,node);media.addEventListener('ended',()=>events.push({event:'ended',src:media.currentSrc,epochMs:Date.now(),position:media.currentTime}));}}
 window.Audio=new Proxy(window.Audio,{construct(target,args){const media=Reflect.construct(target,args);tap(media);return media;}});
 HTMLMediaElement.prototype.play=function(...args){
  tap(this);
  events.push({event:'play',src:this.currentSrc||this.src,epochMs:Date.now(),muted:this.muted,volume:this.volume});
  ac.resume();
  return original.apply(this,args);
 };
 let recorder,chunks=[];
 window.captureProbe={events,start:async()=>{await ac.resume();recorder=new MediaRecorder(destination.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:128000});recorder.ondataavailable=e=>chunks.push(e.data);const epochMs=Date.now();recorder.start(100);return {epochMs,sampleRate:ac.sampleRate,state:ac.state,mime:recorder.mimeType}},stop:()=>new Promise(resolve=>{recorder.onstop=async()=>{const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let s='';for(const b of bytes)s+=String.fromCharCode(b);resolve({base64:btoa(s),events,stopEpochMs:Date.now()})};recorder.stop()})};
};
