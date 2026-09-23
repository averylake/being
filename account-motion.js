/* A periodic movement of the saved account, never a new encounter or measurement. */
(() => {
  'use strict';
  const VERSION='accounts-of-being/motion-1',PERIOD=12,TAU=Math.PI*2;
  function frame(recipe,size,seconds){
    if(!Number.isFinite(seconds))throw Error('Invalid motion time.');
    const f=EncodedRules.frame(recipe,size),t=((seconds%PERIOD)+PERIOD)%PERIOD;
    if(t===0)return f; // The resting frame and loop boundary are exactly the PNG composition.
    const phase=t/PERIOD*TAU,opening=1-Math.cos(phase);
    f.forms.forEach((form,i)=>{
      const offset=recipe.layers[i].parameters[10]*TAU;
      form.size*=1+.016*opening;
      form.x+=size*.006*(Math.sin(phase+offset)-Math.sin(offset));
      form.y+=size*.004*(Math.cos(phase+offset)-Math.cos(offset));
      f.entries[i].voice.features[6]+=.025*(Math.sin(phase+offset)-Math.sin(offset));
    });
    // Advancing shader time linearly would not loop: its internal frequencies differ.
    f.time+=.65*Math.sin(phase);
    f.breathing+=.06*opening;
    return f;
  }
  globalThis.AccountMotion={VERSION,PERIOD,frame};
})();
