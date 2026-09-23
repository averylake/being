(() => {
  'use strict';
  const VERSION='accounts-of-being/encoded-breath-1',TAU=Math.PI*2;
  // Existing Hors-Série pigments, from the Signals Circles renderer.
  const PALETTE=[['Terracotta',211,113,96],['Rose',235,157,135],['Gold',222,185,112],['Seafoam',143,197,180],['Turquoise',66,185,198],['Jade',0,169,126],['Teal',0,126,145],['Blue',39,126,166],['Cobalt',16,64,232],['Ultramarine',25,75,214],['Violet',86,40,218],['Magenta',190,50,170],['Ivory',226,226,213]];
  function tokenInput(id){if(!Number.isInteger(id)||id<0)throw Error('Invalid token ID.');return JSON.stringify([VERSION,'cl100k_base',id]);}
  function tokenLayer(token,seed){
    if(!/^[a-f0-9]{64}$/.test(seed))throw Error('Invalid token seed.');
    const bytes=Array.from({length:32},(_,i)=>parseInt(seed.slice(i*2,i*2+2),16)),p=bytes.map(b=>b/255);
    p[3]=.48+p[3]*.30;p[4]=.48+p[4]*.30;p[9]=.22+p[9]*.56;
    const paletteIndex=parseInt(seed.slice(0,8),16)%PALETTE.length,accentIndex=(paletteIndex+2)%PALETTE.length;
    return {token:{...token},seed,parameters:p,paletteIndex,accentIndex,pigment:PALETTE[paletteIndex][0]};
  }
  function identityInput(id,attempt=0){return JSON.stringify([VERSION,'fine-detail',id,attempt]);}
  function seedInput(recipe){return JSON.stringify([VERSION,recipe.encounter,recipe.encounterId,recipe.accountCreatedAt,recipe.visual,recipe.identitySeed,recipe.layers.map(l=>[l.token.id,l.seed]),recipe.textureSHA256,recipe.rendererSHA256]);}
  function frame(recipe,size,isolated=-1){
    if(recipe.rendererVersion!==VERSION||!recipe.layers.length||!Number.isFinite(Date.parse(recipe.accountCreatedAt)))throw Error('Invalid encoded recipe.');
    if(!/^[a-f0-9]{64}$/.test(recipe.identitySeed))throw Error('Invalid detail seed.');
    const visual=BreathRules.stateAt(recipe.visual.surfaceSeconds,recipe.visual.paused);
    if(Math.abs(visual.phase-recipe.visual.phase)>1e-12)throw Error('Invalid recorded phase.');
    const day=((Date.parse(recipe.accountCreatedAt)%86400000)+86400000)%86400000;
    const rotation=day/86400000*TAU,e=visual.expansion,count=recipe.layers.length;
    const entries=[],forms=[];
    recipe.layers.forEach((layer,i)=>{
      if(isolated>=0&&isolated!==i)return;
      const detail=parseInt(recipe.identitySeed.slice((i%8)*8,(i%8)*8+8),16)/4294967295;
      const p=layer.parameters.slice();
      // Identity changes only fine filaments and grain, not token contours or pigments.
      p[29]=p[29]*.94+detail*.06;p[30]=p[30]*.97+detail*.03;
      const pigment=PALETTE[layer.paletteIndex].slice(1).map(v=>v/255),accent=PALETTE[layer.accentIndex].slice(1).map(v=>v/255);
      entries.push({p,voice:{features:[...pigment,...accent,rotation+.16*Math.sin(TAU*visual.phase+i*.8),detail]}});
      const angle=rotation+TAU*i/count+.24*Math.sin(TAU*visual.phase+i*.9),radius=.026+.027*e;
      const diameter=(.86-i*.105)*(.88+.12*e);
      forms.push({x:size*(isolated>=0?.5:.5+Math.cos(angle)*radius),y:size*(isolated>=0?.5:.5+Math.sin(angle)*radius),size:size*(isolated>=0?.8:diameter),opacity:isolated>=0?.95:.57+i*.055,side:i%2?-1:1,strength:0});
    });
    return {entries,forms,time:visual.surfaceSeconds,breathing:e*2-1};
  }
  globalThis.EncodedRules={VERSION,PALETTE,tokenInput,tokenLayer,identityInput,seedInput,frame};
})();
