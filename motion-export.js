/* Silent MP4, rendered on the visitor's device. No recording permission or server. */
(() => {
  'use strict';
  const SIZE=1080,FPS=30,VERSION='accounts-of-being/mp4-1';
  let library;
  const load=()=>library||(library=import('./vendor/mediabunny-1.59.0.min.mjs'));
  async function supported(){
    if(!globalThis.VideoEncoder||!globalThis.VideoFrame)return false;
    try{const M=await load();return await M.canEncodeVideo('avc',{width:SIZE,height:SIZE,frameRate:FPS,quality:new M.Quality('high')});}catch{return false;}
  }
  async function create(engine,record,{onProgress=()=>{},signal}={}){
    if(!await supported())throw Error('MP4 export is unavailable in this browser. You can still keep the PNG.');
    const M=await load(),canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE;
    const target=new M.BufferTarget(),output=new M.Output({format:new M.Mp4OutputFormat({fastStart:'in-memory'}),target});
    const source=new M.CanvasSource(canvas,{codec:'avc',quality:new M.Quality('high'),keyFrameInterval:2});
    output.addVideoTrack(source,{frameRate:FPS});
    output.setMetadataTags({title:record.title,artist:'Avery Lake',comment:'Account '+record.encounterId+'; '+AccountMotion.VERSION+'; a movement of the account, not measured breathing.'});
    const frames=AccountMotion.PERIOD*FPS;
    try{
      await output.start();
      for(let i=0;i<frames;i++){
        if(signal?.aborted)throw new DOMException('Export cancelled.','AbortError');
        engine.renderMotion(canvas,record,SIZE,i/FPS);
        await source.add(i/FPS,1/FPS);
        if(i%6===0){onProgress((i+1)/frames);await new Promise(resolve=>setTimeout(resolve,0));}
      }
      await output.finalize();onProgress(1);
      const bytes=new Uint8Array(target.buffer);
      return {bytes,blob:new Blob([bytes],{type:'video/mp4'}),sha256:await AccountEngine.hash(bytes),version:VERSION,motionVersion:AccountMotion.VERSION,width:SIZE,height:SIZE,fps:FPS,frames,duration:AccountMotion.PERIOD,accountSeed:record.seed};
    }catch(error){await output.cancel().catch(()=>{});throw error;}
  }
  globalThis.AccountVideo={VERSION,SIZE,FPS,supported,create};
})();
