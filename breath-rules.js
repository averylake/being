/* Pure rules for the invitation and its frozen account. No clock or random calls here. */
(() => {
  'use strict';
  const VERSION='accounts-of-being/breath-signals-1',CYCLE=11,TAU=Math.PI*2;
  const TEXTURE={path:'material-studies/assets/contact-palette.png',sha256:'6111a6378216e23d1c0e8ba531012f3eebc7ee9864e0c6988e4d1aa43493aad4'};
  const hex=value=>/^[a-f0-9]{64}$/.test(value);
  function identityInput(id,attempt=0){
    if(!/^[a-f0-9]{32}$/.test(id)||!Number.isInteger(attempt)||attempt<0)throw Error('Invalid encounter identity.');
    return JSON.stringify([VERSION,'breath',id,attempt]);
  }
  function stateAt(seconds,paused=false){
    if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid visual clock.');
    const phase=(seconds%CYCLE)/CYCLE;
    return {cycleSeconds:CYCLE,surfaceSeconds:seconds,phase,expansion:(1-Math.cos(phase*TAU))/2,paused};
  }
  function parameters(identitySeed){
    if(!hex(identitySeed))throw Error('Invalid material seed.');
    const p=Array.from({length:32},(_,i)=>parseInt(identitySeed.slice(i*2,i*2+2),16)/255);
    p[3]=.46+p[3]*.34;p[4]=.48+p[4]*.32;p[9]=.30+p[9]*.40;p[14]=.43;
    return p;
  }
  function frame(identitySeed,visual,size){
    const expected=stateAt(visual.surfaceSeconds,visual.paused);
    if(Math.abs(expected.phase-visual.phase)>1e-12||Math.abs(expected.expansion-visual.expansion)>1e-12||visual.cycleSeconds!==CYCLE)throw Error('The captured phase does not match its clock.');
    const p=parameters(identitySeed),e=visual.expansion;
    return {entries:[{p}],time:visual.surfaceSeconds,breathing:e*2-1,
      forms:[{x:size*.5,y:size*.5,size:size*(.54+.20*e),opacity:.99,side:1,strength:0}]};
  }
  function seedInput(record){
    return JSON.stringify([VERSION,record.encounter,record.statement,record.encounterId,
      record.accountCreatedAt,record.identitySeed,record.collisionAttempt,record.visual,
      record.texture.sha256,record.image.sha256,record.tokens.map(t=>t.id),record.rendererSHA256]);
  }
  globalThis.BreathRules={VERSION,CYCLE,TEXTURE,identityInput,stateAt,parameters,frame,seedInput};
})();
