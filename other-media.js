/* Alternate representations of one reported statement. Never changes the account. */
(() => {
  'use strict';
  const VERSION='accounts-of-being/other-media-3';
  const HANDWRITING={path:'assets/breath-handwriting.png',sha256:'05d9ff687ebc03892519291ae22e223f967d68e61ee376ad02b602dcd97f8709',text:'I took a breath',artist:'Avery Lake',crop:[140,520,1320,1320],dimensions:[1536,2040]};
  const mediaBase=typeof document!=='undefined'?new URL('.',document.currentScript?.src||document.baseURI):null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  // Authored vector lettering, not scanned handwriting or a participant's physical trace.
  const letters={
    I:[32,'M12 17 Q14 47 10 83 M2 19 L25 16 M0 85 L25 82'],
    S:[52,'M44 25 C30 3 4 17 10 36 C14 47 41 49 43 65 C47 87 11 94 3 76'],
    a:[46,'M35 49 C19 39 5 54 7 70 C8 89 30 87 37 64 M38 47 Q34 82 43 84'],
    b:[47,'M13 83 Q12 54 18 12 M14 60 C32 36 48 48 41 69 C36 83 24 89 13 80'],
    c:[43,'M36 50 C11 35 0 62 9 77 C16 89 30 84 38 78'],
    d:[48,'M36 50 C13 36 1 64 9 78 C22 97 39 77 39 57 M42 13 Q36 51 42 84'],
    e:[43,'M8 64 Q45 65 35 50 C23 34 0 60 9 77 Q18 94 39 78'],
    f:[35,'M7 102 Q15 45 19 25 Q24 8 36 16 M1 49 L31 45'],
    g:[48,'M38 49 C13 33 1 64 9 78 C23 96 39 76 38 54 M39 48 Q46 123 9 103'],
    h:[48,'M9 84 Q11 44 18 13 M11 66 Q29 38 37 51 Q44 62 39 84'],
    i:[24,'M11 50 Q7 76 13 83 M13 27 L14 28'],
    j:[26,'M17 50 Q16 114 0 100 M19 28 L20 29'],
    k:[45,'M9 84 L16 14 M40 45 L12 69 M22 61 L42 86'],
    l:[25,'M15 14 Q8 62 11 80 Q12 85 19 83'],
    m:[72,'M8 84 L11 48 M10 62 Q28 36 34 53 L33 83 M34 62 Q53 34 60 54 L62 84'],
    n:[48,'M8 84 L12 48 M11 64 Q30 36 38 53 Q43 69 39 84'],
    o:[46,'M24 46 C1 42 0 83 22 86 C48 88 47 42 24 46'],
    p:[47,'M9 109 L13 48 M13 57 C40 32 51 67 35 80 Q24 89 12 78'],
    q:[48,'M38 48 C15 34 0 67 12 80 C29 97 40 73 39 53 M39 48 L40 108'],
    r:[36,'M9 84 L12 48 M11 64 Q19 42 33 49'],
    s:[40,'M34 51 Q13 39 9 54 C4 67 34 61 33 75 Q27 92 6 80'],
    t:[32,'M19 27 Q10 61 14 77 Q18 90 31 81 M1 50 L32 46'],
    u:[48,'M11 48 Q2 83 20 85 Q33 85 39 59 M40 48 Q35 80 44 83'],
    v:[44,'M6 48 Q10 69 20 84 Q34 66 41 47'],
    w:[65,'M6 49 L13 83 L32 52 L39 84 Q54 68 61 48'],
    x:[43,'M6 49 L37 84 M38 48 L7 84'],
    y:[46,'M7 49 Q8 78 25 83 M40 47 Q28 101 10 111'],
    z:[42,'M6 51 L36 47 L6 84 L39 81'],
    '.':[19,'M8 83 L9 84'],
    ',':[19,'M12 81 L6 96'],
    ' ':[26,'']
  };
  function model(record){
    if(typeof record.statement!=='string'||record.tokens.map(t=>t.text).join('')!==record.statement)throw Error('These media need the exact recorded statement.');
    if(record.layers.length!==record.tokens.length||record.layers.some((l,i)=>l.token.id!==record.tokens[i].id))throw Error('The token layers do not match this account.');
    const bytes=new TextEncoder().encode(record.statement);
    return {version:VERSION,statement:record.statement,bytes,bits:Array.from(bytes,b=>b.toString(2).padStart(8,'0')),tokens:record.tokens.map((t,i)=>({...t,pigment:record.layers[i].pigment,colour:record.palette[record.layers[i].paletteIndex].slice(1),layerSeed:record.layers[i].seed,paletteIndex:record.layers[i].paletteIndex,contourParameters:record.layers[i].parameters?.slice()}))};
  }
  function inscription(statement,photoPath){
    if(statement==='I took a breath.')return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="140 520 1320 1320" role="img" aria-label="Avery Lake’s handwritten inscription: I took a breath"><title>I took a breath — ink on paper, Avery Lake</title><image href="'+escape(photoPath||(mediaBase?new URL(HANDWRITING.path,mediaBase).href:HANDWRITING.path))+'" width="1536" height="2040"/></svg>';
    const advance=c=>letters[c]?.[0]||48,lines=[''];let width=0;
    for(const word of statement.split(' ')){
      const w=Array.from(word).reduce((n,c)=>n+advance(c),0);
      if(width&&width+26+w>590){lines.push(word);width=w;}else{lines[lines.length-1]+=(width?' ':'')+word;width+=(width?26:0)+w;}
    }
    const paths=lines.map((line,row)=>{
      const w=Array.from(line).reduce((n,c)=>n+advance(c),0);let x=(760-w)/2;
      return Array.from(line).map((c,i)=>{
        const [a,d]=letters[c]||[48,null],y=(760-lines.length*116)/2+row*116+Math.sin(i*1.7)*1.8;
        const mark=d===null?'<text x="'+x+'" y="'+(y+82)+'" fill="currentColor" stroke="none" font-size="70" font-family="serif">'+escape(c)+'</text>':d?'<path d="'+d+'" transform="translate('+x+' '+y+') rotate('+(.7*Math.sin(i*.9))+' 20 50)" stroke-width="'+(2.2+.3*Math.sin(i*2.3))+'"/>':'';x+=a;return mark;
      }).join('');
    }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 760" role="img" aria-label="Digitally drawn inscription study: '+escape(statement)+'"><title>'+escape(statement)+' — drawn-letter study</title><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+paths+'</g></svg>';
  }
  function printSVG(statement,prefix='press'){
    const id=escape(prefix),size=Math.min(54,610/(Array.from(statement).length*.52));
    // A fixed digital press study: one setting, three unequal ink impressions.
    const impression=(y,angle,opacity,i)=>'<g transform="translate('+(i===1?.8:0)+' '+y+') rotate('+angle+' 380 0)" opacity="'+opacity+'"><text x="380" text-anchor="middle" fill="#25221f" font-family="Baskerville, Georgia, Times New Roman, serif" font-weight="600" font-size="'+size+'" letter-spacing="-.5" filter="url(#'+id+'-ink'+i+')">'+escape(statement)+'</text></g>';
    const ink=[13,29,41].map((seed,i)=>'<filter id="'+id+'-ink'+i+'" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".74" numOctaves="3" seed="'+seed+'" result="grain"/><feColorMatrix in="grain" type="luminanceToAlpha"/><feComponentTransfer><feFuncA type="discrete" tableValues=".05 .25 .7 .96 1"/></feComponentTransfer><feComposite in="SourceGraphic" operator="in"/><feDisplacementMap in2="grain" scale=".65" xChannelSelector="R" yChannelSelector="G"/></filter>').join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 760" role="img" aria-label="Three ink impressions from one setting: '+escape(statement)+'"><title>One setting. Three ink impressions.</title><defs>'+ink+'<filter id="'+id+'-paper"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="9"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="760" height="760" fill="#eee8dd"/><rect width="760" height="760" filter="url(#'+id+'-paper)" opacity=".085"/>'+impression(290,-.13,.97,0)+impression(402,.09,.79,1)+impression(514,-.08,.91,2)+'</svg>';
  }
  function fixedSVG(svg){return svg.replace('<svg ','<svg style="background:#f0efeb;color:#242320" ');}
  function files(record,handwritingBytes,imageBytes=null){
    const m=model(record),directory='through-other-media/',hasHand=record.statement==='I took a breath.';
    if(hasHand&&!handwritingBytes)throw Error('The original handwriting photograph is needed for this archive.');
    const manifest={version:VERSION,sourceAccountSeed:record.seed,encounterId:record.encounterId,accountCreatedAt:record.accountCreatedAt,statement:m.statement,inscription:hasHand?{...HANDWRITING,provenance:'Artist-supplied photograph, unchanged. Square viewport crops the surrounding scene. The handwriting has no final full stop; the canonical typed statement adds one. This is the artist’s inscription, shared across visitor accounts.'}:'Authored digital vector lettering study. Not a participant handwriting sample or a physical breath trace.',print:'A shared digital press study. One setting of type appears in three fixed, uneven ink impressions; this is not a physical print or a per-visitor variation.',binary:'Exact UTF-8 bytes of the reported statement; no added newline or byte-order mark. Different from token IDs written in binary.',tokens:{encoding:record.encoding,items:m.tokens},image:record.image||null,relationship:'All views refer to the same account. Selecting a medium does not alter the seed, acknowledgement, artwork or edition status.'};
    return [...(imageBytes&&record.image?[{name:directory+'shared-image.png',data:imageBytes},{name:directory+'image.svg',data:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+record.image.displayViewport.join(' ')+'"><image href="shared-image.png" width="'+record.image.sourceDimensions[0]+'" height="'+record.image.sourceDimensions[1]+'"/></svg>'}]:[]),...(hasHand?[{name:directory+'inscription-source.png',data:handwritingBytes}]:[]),{name:directory+'inscription.svg',data:fixedSVG(inscription(m.statement,'inscription-source.png'))},{name:directory+'print.svg',data:fixedSVG(printSVG(m.statement))},{name:directory+'statement.utf8.txt',data:m.bytes},{name:directory+'statement-bits.txt',data:m.bits.join(' ')},{name:directory+'media.json',data:JSON.stringify(manifest,null,2)+'\n'},{name:directory+'source-account.json',data:JSON.stringify(record,null,2)+'\n'}];
  }
  function tokenGlyphs(record,{onSelect=null}={}){
    const m=model(record),el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
    const glyphs=el('div','token-glyphs'),buttons=[],bitWidth=Math.max(17,...m.tokens.map(t=>t.id.toString(2).length));
    for(const [i,token] of m.tokens.entries()){
      const b=el(onSelect?'button':'div','token-glyph');if(onSelect)b.type='button';b.style.setProperty('--token-colour','rgb('+token.colour.join(',')+')');
      if(onSelect){b.setAttribute('aria-label','Show layer for '+token.text.trim()+'; token '+token.id+'; '+token.pigment);b.setAttribute('aria-pressed','false');}
      const word=el('span','glyph-word',token.text.startsWith(' ')?'·'+token.text.slice(1):token.text),id=el('span','glyph-id',String(token.id));
      const tape=el('span','bit-tape');tape.setAttribute('aria-hidden','true');const bits=token.id.toString(2).padStart(bitWidth,'0');tape.dataset.bits=bits;
      for(const bit of bits)tape.append(el('i',bit==='1'?'bit-filled':'bit-empty'));
      const sr=el('span','sr-only','ID in binary: '+bits);b.append(word,id,tape,sr);if(onSelect)b.addEventListener('click',()=>onSelect(i));buttons.push(b);glyphs.append(b);
    }
    return {element:glyphs,buttons,bitWidth};
  }
  function tokenLegend(root,record,engine){
    const m=model(record),el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
    root.replaceChildren();root.classList.add('token-legend');root.dataset.accountSeed=record.seed;
    const intro=el('p','legend-intro','A statement becomes '+m.tokens.length+' tokens. The tokens give this account its forms.');
    const shared=el('p','legend-shared','The earlier representations are shared. Your acknowledgement time, the visual rhythm and a random identifier vary the final composition and its fine detail.');
    const flow=el('p','legend-flow','TOKEN → ID & BITS → VISUAL RULE → LAYER');
    const stage=el('div','legend-stage'),controls=el('div','legend-controls');
    const picture=el('div','legend-picture'),canvas=el('canvas'),selectedLabel=el('p','legend-selection');canvas.setAttribute('role','img');picture.append(canvas,selectedLabel);
    const {element:sharedGlyphs,buttons}=tokenGlyphs(record,{onSelect:i=>show(i)});
    const all=el('button','media-all-layers','All layers');all.type='button';all.addEventListener('click',()=>show(-1));
    const key=el('p','glyph-key','● 1   ○ 0 · leading zeros align the columns.');
    controls.append(sharedGlyphs,all,key);stage.append(controls,picture);
    const caption=el('p','legend-arrangement','Select a token to see its layer in place. The moment arranges the layers; the random identifier varies their fine detail.');
    const rule=el('details','media-context legend-rule'),summary=el('summary','','The visual rule'),text=el('p','','Tokens have no inherent colour or shape. Here, each '+record.encoding+' ID is hashed with a fixed rule version. The resulting numbers select a pigment and base contour from this work’s visual language. The bit column is another way of reading that same ID. Time sets rotation; the invitation’s graphic phase sets opening and overlap. No breathing is measured. Exact duplicates are checked in this browser; worldwide uniqueness is not guaranteed.');
    const exact=el('p','legend-formula','ID + rule version → SHA-256 → pigment + contour parameters');rule.append(summary,text,exact);
    function show(index){
      if(index<0)engine.render(canvas,record,720);else engine.renderLayer(canvas,record,720,index);
      root.dataset.selectedLayer=String(index);
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));all.setAttribute('aria-pressed',String(index===-1));
      selectedLabel.textContent=index<0?'THE ACCOUNT · '+m.tokens.length+' LAYERS':m.tokens[index].id+' → '+m.tokens[index].pigment+' + contour';
      canvas.setAttribute('aria-label',index<0?'The artwork assembled from these token layers.':'The '+m.tokens[index].pigment+' layer generated by token '+m.tokens[index].id+'.');
    }
    root.append(intro,shared,flow,stage,caption,rule);show(-1);
    return {show,destroy(){root.replaceChildren();delete root.dataset.accountSeed;delete root.dataset.selectedLayer;}};
  }
  function mount(root,record,engine,{initial='inscription',onSelect=()=>{},tokenView='legend',image=null}={}){
    const m=model(record),prefix=root.id||'other-media';root.replaceChildren();root.dataset.accountSeed=record.seed;
    let selected=['inscription','print','image','binary','tokens'].includes(initial)?initial:'inscription',legend=null,readable=false;
    const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
    const intro=el('p','media-intro',tokenView==='account'?'Shared representations of the same statement.':'One statement. Several ways of holding it.');
    const tabs=el('div','media-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Representations of the same account');
    const definitions=[['inscription','Inscription','A mark becomes a word.',m.statement==='I took a breath.'?'Avery Lake · ink on paper.':'Digitally drawn lettering study.'],['print','Print','A setting becomes many impressions.','One setting of type. Uneven ink impressions.'],['binary','Binary','Words become bytes.','The statement encoded as UTF-8.'],['tokens','Tokens','Pieces become layers.','The token rules behind your artwork.']];
    if(image)definitions.splice(2,0,['image','Image','The shared image.','One illustration, shared across encounters.']);
    const panels=new Map(),buttons=new Map();
    const group=el('div','media-panels');
    for(const [key,name,title,note] of definitions){
      const tab=el('button','media-tab',name);tab.type='button';tab.id=prefix+'-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',prefix+'-panel-'+key);tabs.append(tab);buttons.set(key,tab);
      const panel=el('section','media-panel');panel.id=prefix+'-panel-'+key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;
      const stage=el('div','media-stage media-'+key),caption=el('div','media-caption'),heading=el('h3','',title),description=el('p','',note);caption.append(heading,description);panel.append(stage,caption);group.append(panel);panels.set(key,{panel,stage,caption});
      tab.addEventListener('click',()=>select(key));
      tab.addEventListener('keydown',event=>{
        let i=definitions.findIndex(d=>d[0]===key);
        if(event.key==='ArrowRight')i=(i+1)%definitions.length;else if(event.key==='ArrowLeft')i=(i+definitions.length-1)%definitions.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=definitions.length-1;else return;
        event.preventDefault();select(definitions[i][0]);buttons.get(definitions[i][0]).focus({preventScroll:true});
      });
    }
    panels.get('inscription').stage.innerHTML=inscription(m.statement);
    panels.get('print').stage.innerHTML=printSVG(m.statement,prefix+'-print');
    if(image){
      const stage=panels.get('image').stage;
      stage.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+image.displayViewport.join(' ')+'" role="img" aria-label="Breath: the shared illustration"><image href="'+escape(new URL(image.path,mediaBase).href)+'" width="'+image.sourceDimensions[0]+'" height="'+image.sourceDimensions[1]+'"/></svg>';
    }
    const byteGrid=el('div','byte-grid');
    m.bits.forEach((bits,i)=>{const cell=el('span','byte-cell');cell.setAttribute('aria-label','Byte '+(i+1)+': '+bits);for(const bit of bits){const span=el('span',bit==='1'?'bit-one':'bit-zero',bit);span.setAttribute('aria-hidden','true');cell.append(span);}byteGrid.append(cell);});
    const decoded=el('p','decoded-statement',new TextDecoder('utf-8',{fatal:true}).decode(m.bytes));decoded.hidden=true;
    const binary=panels.get('binary');binary.stage.append(byteGrid,decoded);
    const byteMeta=el('span','byte-meta',m.bytes.length+' bytes · '+m.bytes.length*8+' bits');binary.stage.append(byteMeta);
    const decode=el('button','quiet-button media-decode','Read as words');decode.type='button';decode.setAttribute('aria-pressed','false');decode.addEventListener('click',()=>{readable=!readable;decoded.hidden=!readable;byteGrid.hidden=readable;decode.textContent=readable?'Return to bits':'Read as words';decode.setAttribute('aria-pressed',String(readable));});binary.caption.append(decode);
    const tokenPanel=panels.get('tokens');
    if(tokenView==='legend'){tokenPanel.stage.className='media-token-legend';tokenPanel.caption.hidden=true;}
    else{tokenPanel.stage.className='media-stage media-encoded-square';tokenPanel.stage.append(el('p','token-statement',record.statement),tokenGlyphs(record).element,el('p','glyph-key','TOKENS / '+record.encoding+' · ● 1 ○ 0'));tokenPanel.caption.querySelector('h3').textContent='The encoded statement.';tokenPanel.caption.querySelector('p').textContent='The same words give the same token IDs.';}
    function select(key){
      if(!buttons.has(key))return;
      selected=key;for(const [k,b] of buttons){b.setAttribute('aria-selected',String(k===key));b.tabIndex=k===key?0:-1;panels.get(k).panel.hidden=k!==key;}
      if(key==='tokens'&&tokenView==='legend'&&!legend)legend=tokenLegend(tokenPanel.stage,record,engine);root.dataset.medium=key;onSelect(key);
    }
    const foot=el('div','media-foot'),line=el('p','','The media change. The moment exceeds its accounts.');
    const context=el('details','media-context'),summary=el('summary','','About these representations'),body=el('p','','For Breath, the inscription is the artist’s photographed handwriting, shared across accounts. Its full stop is supplied in the typed statement. Other inscriptions remain drawn-letter studies. Print is a digital study of uneven ink impressions from one setting of type. Binary shows the sentence’s UTF-8 bytes. Tokens use '+record.encoding+'; their IDs in the encoded account have a different binary representation. These technologies overlap: this entire page is digital.');context.append(summary,body);
    const download=el('button','quiet-button media-download','Keep these representations (.zip)');download.type='button';const status=el('p','sr-only');status.setAttribute('role','status');download.addEventListener('click',async()=>{download.disabled=true;try{const handwriting=record.statement==='I took a breath.'?await engine.load(HANDWRITING.path,HANDWRITING.sha256):null;AccountEngine.save(AccountArchive.zip(files(record,handwriting,image?await engine.load(image.path,image.sha256):null)),'accounts-of-being-'+record.encounter+'-'+record.encounterId+'-media.zip','application/zip');status.textContent='Representation archive download requested.';}catch(error){status.classList.remove('sr-only');status.textContent=error.message;}finally{download.disabled=false;}});
    foot.append(line,context,download,status);root.append(intro,tabs,group,foot);if(!buttons.has(selected))selected='inscription';select(selected);
    return {select,destroy(){root.replaceChildren();delete root.dataset.accountSeed;delete root.dataset.medium;}};
  }
  globalThis.AccountMedia={VERSION,HANDWRITING,model,inscription,printSVG,files,mount,tokenLegend,tokenGlyphs};
})();
