(() => {
  'use strict';
  const $=id=>document.getElementById(id),study=ACCOUNT_STUDIES[0],A=AccountEngine,R=BreathRules;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let engine,db,photoBytes,handwritingBytes,ready=false,busy=false,initializing=false,identity,capture=null,record=null,output=null,artURL=null;
  let mediaView=null,legendView=null;
  let motionCanvas=null,artMoving=!reduced.matches,artSeconds=0,artVisible=false,exporting=false,exportAbort=null,movie=null;
  let paused=reduced.matches,seconds=Date.now()%352000/1000,last=performance.now(),lastDraw=0,visual=R.stateAt(seconds,paused);
  const journey=EncounterJourney.create({root:$('journey'),steps:[...$('journey').querySelectorAll('.journey-step'),$('outcome')],controls:$('journey-controls'),status:$('live-status'),reduced,onComplete(){
    $('account-link').hidden=false;$('after-encounter').hidden=false;$('outcome-title').focus({preventScroll:true});
  }});
  const fail=error=>{$('action-error').textContent=error.message||'The account could not be made. Please try again.';$('action-error').hidden=false;};
  function paint(){
    visual=capture?.visual||R.stateAt(seconds,paused);
    const scale=.72+.28*visual.expansion;
    $('neutral-rings').setAttribute('transform','translate(100 100) scale('+scale+') translate(-100 -100)');
    $('neutral-rings').setAttribute('opacity',String(.55+.45*visual.expansion));
    $('neutral-rings').dataset.phase=String(visual.phase);
  }
  function motionLabel(){
    $('motion').disabled=!!capture;$('motion').setAttribute('aria-pressed',String(paused||!!capture));
    $('motion').setAttribute('aria-label',capture?'Acknowledged visual rhythm':paused?'Resume the visual rhythm':'Pause the visual rhythm');
  }
  function fresh(){
    if(exporting||globalThis.AccountMint?.isBusy())return;
    globalThis.AccountMint?.reset();
    journey.reset();$('after-encounter').hidden=true;$('after-encounter').querySelectorAll('details').forEach(d=>d.open=false);
    if(artURL)URL.revokeObjectURL(artURL);
    mediaView?.destroy();mediaView=null;$('through-other-media').open=false;
    legendView?.destroy();legendView=null;$('from-tokens').open=false;
    record=null;output=null;artURL=null;capture=null;identity=A.newId();$('live-status').textContent='';
    paused=reduced.matches;seconds=Date.now()%352000/1000;last=performance.now();
    motionCanvas=null;movie=null;artSeconds=0;artMoving=!reduced.matches;
    $('export-status').hidden=true;$('cancel-export').hidden=true;$('download-motion').disabled=false;
    $('outcome').hidden=true;$('artwork').replaceChildren();$('account-details').open=false;
    for(const name of ['account-link','action-error'])$(name).hidden=true;
    document.body.classList.remove('made');$('acknowledge').textContent='I took a breath';$('acknowledge').disabled=false;
    motionLabel();paint();
  }
  async function initialize(){
    if(initializing)return;initializing=true;$('acknowledge').disabled=true;$('action-error').hidden=true;
    try{
      [engine,db]=await Promise.all([A.create(),AccountRegistry.open('accounts-of-being-histories-local-1')]);
      [photoBytes,handwritingBytes]=await Promise.all([engine.load(ACCOUNT_IMAGE.path,ACCOUNT_IMAGE.sha256),engine.load(AccountMedia.HANDWRITING.path,AccountMedia.HANDWRITING.sha256)]);
      ready=true;fresh();
    }catch(error){fail(error);$('acknowledge').textContent='Try again';$('acknowledge').disabled=false;}
    finally{initializing=false;}
  }
  function reveal(){
    const media=AccountMedia.model(record);
    $('inscription-made').innerHTML=AccountMedia.inscription(record.statement);
    $('print-made').innerHTML=AccountMedia.printSVG(record.statement,'journey-print');
    $('token-field').replaceChildren(AccountMedia.tokenGlyphs(record).element);
    const grid=document.createElement('div');grid.className='byte-grid';
    media.bits.forEach((bits,i)=>{const cell=document.createElement('span');cell.className='byte-cell';cell.setAttribute('aria-label','Byte '+(i+1)+': '+bits);for(const bit of bits){const mark=document.createElement('span');mark.className=bit==='1'?'bit-one':'bit-zero';mark.textContent=bit;mark.setAttribute('aria-hidden','true');cell.append(mark);}grid.append(cell);});
    const decoded=document.createElement('p');decoded.className='decoded-statement';decoded.textContent=new TextDecoder().decode(media.bytes);decoded.hidden=true;
    const meta=document.createElement('span');meta.className='byte-meta';meta.textContent=media.bytes.length+' bytes · '+media.bytes.length*8+' bits';
    $('binary-made').replaceChildren(grid,decoded,meta);$('read-binary').textContent='Read as words';$('read-binary').setAttribute('aria-pressed','false');
    const img=new Image();img.width=2400;img.height=2400;img.alt='Breath: five coloured token layers arranged at your acknowledgement.';img.src=artURL;
    globalThis.HistoryReading?.set(record,engine);$('artwork').replaceChildren(img);$('artwork').dataset.seed=record.seed;
    motionCanvas=document.createElement('canvas');motionCanvas.setAttribute('role','img');motionCanvas.setAttribute('aria-label','A gentle movement of the same five token layers.');$('artwork').append(motionCanvas);
    setArtMotion(!reduced.matches);
    globalThis.AccountMint?.setAccount(record,output,async onProgress=>{if(movie)return movie;movie=await AccountVideo.create(engine,record,{onProgress});return movie;});
    const currentId=record.encounterId;
    AccountVideo.supported().then(ok=>{if(record?.encounterId!==currentId)return;$('download-motion').disabled=!ok;if(!ok){$('export-status').textContent='MP4 export is unavailable in this browser. The PNG is available.';$('export-status').hidden=false;}});
    $('account-time').dateTime=record.accountCreatedAt;$('account-time').textContent=record.accountCreatedAt.replace('T',' · ').replace('Z',' UTC');
    $('encounter-id').textContent=record.encounterId;$('artwork-hash').textContent=record.artworkSHA256;$('pixel-hash').textContent=record.pixelSHA256;
    mediaView=AccountMedia.mount($('media-account'),record,engine,{tokenView:'account',image:ACCOUNT_IMAGE});
    $('acknowledge').textContent='Acknowledged';document.body.classList.add('made');journey.start();
  }
  $('read-binary').addEventListener('click',()=>{journey.pause();const readable=$('read-binary').getAttribute('aria-pressed')!=='true';$('binary-made').querySelector('.byte-grid').hidden=readable;$('binary-made').querySelector('.decoded-statement').hidden=!readable;$('read-binary').textContent=readable?'Return to bits':'Read as words';$('read-binary').setAttribute('aria-pressed',String(readable));});
  const seriesMenu=document.querySelector('.series-menu');
  document.addEventListener('pointerdown',event=>{if(seriesMenu.open&&!seriesMenu.contains(event.target))seriesMenu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&seriesMenu.open){seriesMenu.open=false;seriesMenu.querySelector('summary').focus();}});
  document.querySelectorAll('.series-list a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('.series-menu').open=false;}));
  $('motion').addEventListener('click',()=>{if(capture)return;paused=!paused;last=performance.now();motionLabel();paint();});
  $('acknowledge').addEventListener('click',async()=>{
    if(busy||record)return;if(!ready){await initialize();return;}
    busy=true;$('acknowledge').disabled=true;$('action-error').hidden=true;
    // Snapshot the displayed cue before any asynchronous work.
    if(!capture)capture={accountCreatedAt:new Date().toISOString(),encounterId:identity,visual:{...visual}};
    motionLabel();paint();$('acknowledge').textContent='Making an account…';
    try{
      let accepted=false;
      for(let attempt=0;attempt<8;attempt++){
        const next=await engine.recipe(study,{...capture,encounterId:attempt===0?capture.encounterId:A.newId()},attempt);
        const rendered=await engine.output(next);
        next.pixelSHA256=rendered.pixelSHA256;next.artworkSHA256=rendered.artworkSHA256;next.artworkFile='artwork.png';
        next.image={...ACCOUNT_IMAGE};next.inscription={...AccountMedia.HANDWRITING,provenance:'Artist-supplied handwriting photograph. The image has no final full stop; the canonical typed statement adds one.'};
        next.uniqueness={scope:'this_browser_and_origin',status:'accepted_after_atomic_duplicate_check',comparison:'SHA-256 of 2400 × 2400 RGBA pixels',limits:'Other devices, browsers and cleared storage are outside this check. No global uniqueness or mint enforcement is claimed.'};
        if(!await AccountRegistry.reserve(db,next))continue;
        record=A.freeze(next);output=rendered;artURL=URL.createObjectURL(rendered.blob);accepted=true;reveal();break;
      }
      if(!accepted)throw Error('A distinct local account could not be reserved. Please try again.');
    }catch(error){fail(error);$('acknowledge').textContent='Try again';$('acknowledge').disabled=false;}
    finally{busy=false;}
  });
  let mixRevision=0;
  globalThis.canAdjustHistory=()=>!!record&&!exporting&&!globalThis.AccountMint?.isBusy()&&!globalThis.AccountMint?.getReceipt();
  globalThis.previewHistoryMix=mix=>{
    if(!record||exporting||globalThis.AccountMint?.isBusy()||globalThis.AccountMint?.getReceipt())return;
    mixRevision++;setArtMotion(false);
    const draft=JSON.parse(JSON.stringify(record));draft.histories.mix=mix;
    if(motionCanvas){motionCanvas.hidden=false;engine.render(motionCanvas,draft,720);}
    ['download-artwork','download-motion','mint-open','download-record','another-breath'].forEach(id=>$(id).disabled=true);
    $('rendering-status').textContent='Adjusting your artwork…';
  };
  globalThis.selectHistoryRendering=async mix=>{
    if(!record||exporting||globalThis.AccountMint?.isBusy())return;
    if(globalThis.AccountMint?.getReceipt())return;
    const revision=mixRevision;
    const controls=[$('download-artwork'),$('download-motion'),$('mint-open'),$('download-record'),$('another-breath')];controls.forEach(b=>b.disabled=true);
    $('rendering-status').textContent='Preparing your rendering…';
    try{
      const next=JSON.parse(JSON.stringify(record));next.histories.mix={...mix};next.histories.composition='Participant mix';
      next.seed=await A.hash(JSON.stringify([next.encounterId,next.histories,next.layers]));
      const rendered=await engine.output(next);
      if(revision!==mixRevision)return;
      next.pixelSHA256=rendered.pixelSHA256;next.artworkSHA256=rendered.artworkSHA256;
      next.uniqueness={scope:'not_checked_after_rendering_choice',status:'unminted_rendering',limits:'This rendering has not been globally registered or checked for duplicates.'};
      record=A.freeze(next);output=rendered;movie=null;artSeconds=0;
      if(artURL)URL.revokeObjectURL(artURL);artURL=URL.createObjectURL(output.blob);$('artwork').querySelector('img').src=artURL;if(motionCanvas)motionCanvas.hidden=true;
      $('artwork-hash').textContent=record.artworkSHA256;$('pixel-hash').textContent=record.pixelSHA256;

      globalThis.AccountMint?.setAccount(record,output,async onProgress=>{if(!movie)movie=await AccountVideo.create(engine,record,{onProgress});return movie;});
      $('rendering-status').textContent='Your choice is included in the PNG, motion and account record.';
    }catch(error){if(revision===mixRevision){if(motionCanvas)motionCanvas.hidden=true;HistoryReading.set(record);$('rendering-status').textContent='Could not apply this rendering. Your previous choice is preserved.';}}
    finally{if(revision===mixRevision)controls.forEach(b=>b.disabled=false);}
  };
  $('from-tokens').addEventListener('toggle',()=>{if($('from-tokens').open&&record&&!legendView)legendView=AccountMedia.tokenLegend($('token-legend'),record,engine);});
  const stem=()=> 'accounts-of-being-breath-'+record.encounterId;
  const recordJSON=()=>JSON.stringify({...record,...(globalThis.AccountMint?.getReceipt()?{mintReceipt:AccountMint.getReceipt()}: {})},null,2)+'\n';
  const save=(data,name,type)=>{A.save(data,name,type);$('live-status').textContent='Download requested.';};
  $('download-artwork').addEventListener('click',()=>{if(record)save(output.bytes,stem()+'.png','image/png');});
  function setArtMotion(moving){
    artMoving=moving;artSeconds=0;last=performance.now();
    $('view-still').setAttribute('aria-pressed',String(!moving));$('view-motion').setAttribute('aria-pressed',String(moving));
    const still=$('artwork').querySelector('img');if(still)still.setAttribute('aria-hidden',String(moving));
    if(motionCanvas){motionCanvas.hidden=!moving;if(moving)engine.renderMotion(motionCanvas,record,960,0);}
  }
  $('view-still').addEventListener('click',()=>setArtMotion(false));
  $('view-motion').addEventListener('click',()=>setArtMotion(true));
  $('cancel-export').addEventListener('click',()=>exportAbort?.abort());
  $('download-motion').addEventListener('click',async()=>{
    if(!record||exporting||globalThis.AccountMint?.isBusy())return;
    if(movie){save(movie.bytes,stem()+'.mp4','video/mp4');return;}
    exporting=true;exportAbort=new AbortController();$('download-motion').disabled=true;$('another-breath').disabled=true;$('cancel-export').hidden=false;$('export-status').hidden=false;
    $('export-status').textContent='Preparing the moving account…';
    try{
      movie=await AccountVideo.create(engine,record,{signal:exportAbort.signal,onProgress:p=>{$('export-status').textContent='Making the MP4 on your device · '+Math.round(p*100)+'%';}});
      save(movie.bytes,stem()+'.mp4','video/mp4');$('export-status').textContent='Your MP4 is ready. The archive now includes it.';
    }catch(error){$('export-status').textContent=error.name==='AbortError'?'Export cancelled.':error.message;}
    finally{exporting=false;exportAbort=null;$('download-motion').disabled=false;$('another-breath').disabled=false;$('cancel-export').hidden=true;last=performance.now();}
  });
  $('download-record').addEventListener('click',()=>{if(record)save(recordJSON(),stem()+'.json','application/json');});
  $('another-breath').addEventListener('click',()=>{if(busy||exporting||globalThis.AccountMint?.isBusy())return;fresh();history.replaceState(null,'','#breath');$('breath').scrollIntoView({behavior:'instant',block:'start'});$('acknowledge').focus({preventScroll:true});});
  $('download-bundle').addEventListener('click',async()=>{
    if(!record||exporting||globalThis.AccountMint?.isBusy())return;
    exporting=true;$('another-breath').disabled=true;
    const button=$('download-bundle');button.disabled=true;
    try{
    const sourceFiles=await engine.getSourceFiles();
    const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Accounts of Being / Breath</title><style>html{background:#000}body{margin:0;display:grid;min-height:100vh;place-items:center}img{display:block;width:min(100vw,100vh);height:auto}</style><img alt="Accounts of Being / Breath" src="'+output.canvas.toDataURL('image/png')+'"></html>';
    const readme='ACCOUNTS OF BEING / BREATH\nAvery Lake\n\nartwork.png is the authoritative 2400 × 2400 image. artwork.html displays that same image offline. account.json records the acknowledgement, token-layer seeds, palette, rules, source and image hashes. This visitor account has not been minted.\n\nTokens determine contours and pigments. Token order sets layer order. UTC day fraction sets rotation. The graphic phase at acknowledgement sets expansion and overlap. The random identifier varies fine detail. No breathing, location, microphone or camera is measured.\n\nThe duplicate check covers this browser and origin only. GPU reconstruction can differ between devices. Keep the exact PNG.\n\nTo reconstruct, serve source/ locally, load its rule and renderer scripts, create EncodedRenderer with the saved texture, and call render(canvas, account, 2400). Theme changes only the site, never the PNG.\n';
    const motionFiles=movie?[{name:'artwork.mp4',data:movie.bytes},{name:'motion.json',data:JSON.stringify({...movie,bytes:undefined,blob:undefined},null,2)+'\n'}]:[];
    const zip=AccountArchive.zip([{name:'artwork.png',data:output.bytes},{name:'artwork.html',data:html},{name:'account.json',data:recordJSON()},{name:'README.txt',data:readme.replace('This visitor account has not been minted.',globalThis.AccountMint?.getReceipt()?'A mint receipt is included in account.json. Local test receipts are not public NFTs.':'This visitor account has not been minted.')+'\nMotion uses account-motion.js and the same record. Its resting composition matches the PNG; the MP4 is 1080 square, 30 fps, 12 seconds, silent. The archive includes artwork.mp4 and motion.json only after a successful MP4 export.\n\nthrough-other-media/ contains the photographed handwritten inscription and a digital print study, the exact UTF-8 statement and its byte encoding, and a manifest linking these representations to this same account. The inscription is Avery Lake’s original ink on paper, shared across accounts. Its photograph is included unchanged; an SVG viewport crops the surroundings. The handwritten sentence omits the final full stop present in the typed statement. Media choices do not change the artwork or seed.\n'},...motionFiles,...AccountMedia.files(record,handwritingBytes,photoBytes),...sourceFiles,{name:'source/'+R.TEXTURE.path,data:engine.textureBytes},{name:'source/'+ACCOUNT_IMAGE.path,data:photoBytes}]);
    save(zip,stem()+'.zip','application/zip');
    }catch(error){$('live-status').textContent='The archive could not be prepared. Please try again.';}
    finally{button.disabled=false;exporting=false;$('another-breath').disabled=false;}
  });
  $('download-bits').addEventListener('click',async()=>{
    const button=$('download-bits');button.disabled=true;
    try{
      if(!photoBytes){if(!engine)throw Error('Let the encounter finish loading, then try again.');photoBytes=await engine.load(ACCOUNT_IMAGE.path,ACCOUNT_IMAGE.sha256);}
      const chunks=[],lookup=Array.from({length:256},(_,i)=>i.toString(2).padStart(8,'0'));
      for(let start=0;start<photoBytes.length;start+=8192){let text='';for(let i=start;i<Math.min(start+8192,photoBytes.length);i++)text+=lookup[photoBytes[i]]+((i+1)%8?' ':'\n');chunks.push(text);}
      save(new Blob(chunks,{type:'text/plain'}),'breath-source-image-bits.txt','text/plain');
    }catch(error){$('live-status').textContent=error.message;}finally{button.disabled=false;}
  });
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
  reduced.addEventListener('change',event=>{if(event.matches){if(!capture){paused=true;motionLabel();paint();}if(record)setArtMotion(false);}});
  new IntersectionObserver(entries=>{artVisible=entries[0].isIntersecting;},{threshold:0}).observe($('artwork'));
  function tick(now){
    if(ready&&!paused&&!capture&&!document.hidden){seconds+=(now-last)/1000;if(now-lastDraw>40){paint();lastDraw=now;}}
    if(record&&artMoving&&artVisible&&!exporting&&!document.hidden){
      artSeconds+=(now-last)/1000;
      if(now-lastDraw>1000/30){try{engine.renderMotion(motionCanvas,record,960,artSeconds);lastDraw=now;}catch(error){setArtMotion(false);$('live-status').textContent=error.message;}}
    }
    last=now;requestAnimationFrame(tick);
  }
  motionLabel();paint();initialize();requestAnimationFrame(tick);
})();
