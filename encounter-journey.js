/* Presentation only. The account's time, seed and artwork are fixed before this runs. */
(() => {
  'use strict';
  function create({root,steps,controls,status,reduced,onComplete=()=>{},transitionMs=700,holdMs=950}){
    let index=-1,phase='idle',automatic=false,timer=null,waiting=null,scrollFrame=null;
    const toggle=controls.querySelector('[data-journey-toggle]');
    const next=controls.querySelector('[data-journey-next]');
    const skip=controls.querySelector('[data-journey-skip]');
    const count=controls.querySelector('[data-journey-count]');
    const clean=()=>{clearTimeout(timer);timer=null;};
    const stopScroll=()=>{cancelAnimationFrame(scrollFrame);scrollFrame=null;};
    function travel(step,animate=!reduced.matches){
      stopScroll();
      if(document.hidden)return;
      const from=window.scrollY;
      const margin=parseFloat(getComputedStyle(step).scrollMarginTop)||0;
      const to=Math.max(0,Math.min(from+step.getBoundingClientRect().top-margin,document.documentElement.scrollHeight-window.innerHeight));
      if(!animate||Math.abs(to-from)<1){window.scrollTo({top:to,behavior:'instant'});return;}
      // A measured scroll gives mobile browsers the same visible downward passage.
      const start=performance.now();
      function frame(now){
        const progress=Math.min(1,(now-start)/transitionMs);
        const eased=(1-Math.cos(Math.PI*progress))/2;
        window.scrollTo({top:from+(to-from)*eased,behavior:'instant'});
        scrollFrame=progress<1?requestAnimationFrame(frame):null;
      }
      scrollFrame=requestAnimationFrame(frame);
    }
    function sync(){
      root.dataset.phase=phase;root.dataset.automatic=String(automatic);root.dataset.step=String(index);
      toggle.textContent=automatic?'Pause':'Continue';toggle.setAttribute('aria-label',automatic?'Pause the sequence':'Continue automatically');
      toggle.setAttribute('aria-pressed',String(automatic));
      next.textContent='Next ↓';
      count.textContent=Math.max(1,index+1)+' / '+steps.length;
      controls.classList.toggle('is-running',automatic);
    }
    function schedule(fn,ms){
      clean();waiting={fn,ms};
      if(automatic&&!document.hidden)timer=setTimeout(()=>{timer=null;waiting=null;fn();},ms);
    }
    function complete(){
      clean();stopScroll();waiting=null;phase='complete';automatic=false;controls.hidden=true;sync();onComplete();
    }
    function reveal(){
      if(index<0||phase==='complete')return;
      const step=steps[index];step.classList.remove('is-arriving','is-travelling');step.removeAttribute('aria-busy');
      step.querySelector('.journey-content').inert=false;phase='view';
      status.textContent=step.dataset.announcement||step.dataset.label;
      if(index===steps.length-1){complete();return;}
      sync();schedule(advance,holdMs);
    }
    function arrive(){travel(steps[index],false);reveal();}
    function advance(){
      if(index>=steps.length-1)return;
      clean();stopScroll();waiting=null;index++;phase='transition';
      const step=steps[index];step.hidden=false;step.classList.add('is-arriving');step.setAttribute('aria-busy','true');
      // Controls follow the visible account in normal flow, never over its caption.
      const focused=controls.contains(document.activeElement)?document.activeElement:null;
      let slot=step.querySelector('.journey-controls-slot');
      if(!slot){slot=document.createElement('div');slot.className='journey-controls-slot';step.append(slot);}
      slot.append(controls);focused?.focus({preventScroll:true});
      step.querySelector('.journey-content').inert=true;
      status.textContent='Next: '+step.dataset.label;
      if(!reduced.matches)step.classList.add('is-travelling');
      sync();travel(step);
      if(reduced.matches){reveal();}else if(!automatic){reveal();travel(step);}else schedule(arrive,transitionMs);
    }
    function pause(){
      if(phase==='idle'||phase==='complete')return;
      clean();stopScroll();automatic=false;
      // Pausing must leave an account to look at, not an indefinitely hidden panel.
      if(phase==='transition')reveal();else sync();
    }
    function resume(){
      if(phase==='idle'||phase==='complete')return;
      automatic=true;sync();
      travel(steps[index]);
      if(waiting)schedule(waiting.fn,waiting.ms);else schedule(phase==='transition'?arrive:advance,phase==='transition'?transitionMs:holdMs);
    }
    function skipToEnd(){
      if(phase==='idle'||phase==='complete')return;
      clean();stopScroll();waiting=null;
      for(const step of steps){step.hidden=false;step.classList.remove('is-arriving','is-travelling');step.removeAttribute('aria-busy');step.querySelector('.journey-content').inert=false;}
      index=steps.length-1;complete();
      travel(steps[index]);
      status.textContent='Your personal account is revealed. Earlier representations remain above.';
    }
    function reset(){
      clean();stopScroll();waiting=null;index=-1;phase='idle';automatic=false;controls.hidden=true;
      for(const step of steps){step.hidden=true;step.classList.remove('is-arriving','is-travelling');step.removeAttribute('aria-busy');step.querySelector('.journey-content').inert=false;}
      sync();
    }
    toggle.addEventListener('click',()=>automatic?pause():resume());
    next.addEventListener('click',()=>{pause();advance();});
    skip.addEventListener('click',skipToEnd);
    // Touching or scrolling a phone must not silently cancel the sequence.
    // Pause/Next remain explicit controls; keyboard navigation keeps its reading pause.
    document.addEventListener('keydown',event=>{if(['Tab','Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)&&!controls.contains(event.target))pause();});
    document.addEventListener('visibilitychange',()=>{
      // Suspend timers in the background without changing the visitor's play/pause choice.
      if(document.hidden){clean();stopScroll();}else if(automatic&&waiting){if(phase==='transition')travel(steps[index]);schedule(waiting.fn,waiting.ms);}
    });
    reduced.addEventListener('change',event=>{if(event.matches){stopScroll();if(phase==='transition')arrive();}});
    reset();
    // Reduced motion changes how frames appear, not whether the chosen journey continues.
    return {start(){reset();automatic=true;controls.hidden=false;advance();},reset,pause,skip:skipToEnd};
  }
  globalThis.EncounterJourney={create};
})();
