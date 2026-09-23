(() => {
  'use strict';
  function create(texturePath){return new Promise((resolve,reject)=>{
    let gpu;
    function draw(canvas,f,size){
        if(!gpu.ready)throw Error('The graphics context was interrupted. Reload this study.');
        gpu.setEntries(f.entries);gpu.draw(size,size,f.time,f.forms,f.breathing);
        if(canvas.width!==size||canvas.height!==size){canvas.width=size;canvas.height=size;}
        canvas.getContext('2d',{willReadFrequently:true}).drawImage(gpu.canvas,0,0,size,size);
    }
    gpu=createTokenMaterialRenderer(()=>resolve({
      render(canvas,recipe,size,isolated=-1){draw(canvas,EncodedRules.frame(recipe,size,isolated),size);},
      renderLayer(canvas,recipe,size,index){
        const f=EncodedRules.frame(recipe,size);
        if(!Number.isInteger(index)||index<0||index>=f.entries.length)throw Error('Invalid token layer.');
        f.entries=[f.entries[index]];f.forms=[f.forms[index]];
        draw(canvas,f,size);
      },
      renderMotion(canvas,recipe,size,seconds){draw(canvas,AccountMotion.frame(recipe,size,seconds),size);}
    }),message=>reject(Error(message)),{texturePath});
  });}
  globalThis.EncodedRenderer={create};
})();
