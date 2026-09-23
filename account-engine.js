/* Shared by the public Breath encounter and the private five-work preview. */
(() => {
  'use strict';
  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const hash = async input => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', typeof input === 'string' ? new TextEncoder().encode(input) : input)));
  const newId = () => hex(crypto.getRandomValues(new Uint8Array(16)));
  const files = ['index.html','mint-client.js','account.html','account-viewer.js','style.css','theme.js','script.js','account-engine.js','accounts-data.js','image-data.js','breath-rules.js','account-registry.js','archive.js','encounter-journey.js','encounter-journey.css','assets/breath-handwriting.png','other-media.js','other-media.css','account-motion.js','motion-export.js','vendor/mediabunny-1.59.0.min.mjs','vendor/mediabunny-LICENSE.txt','vendor/README.md','compare/encoded-rules.js','compare/encoded-renderer.js','compare/token-material.js'];
  async function create(base = './') {
    if (!globalThis.crypto?.subtle) throw Error('This encounter needs a secure HTTPS connection.');
    const load = async (path, expected) => {
      const response = await fetch(base + path, {cache:'no-cache'});
      if (!response.ok) throw Error('A source file could not load. Please try again.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (expected && await hash(bytes) !== expected) throw Error('A source asset has changed. Reload before continuing.');
      return bytes;
    };
    const textureBytes = await load(BreathRules.TEXTURE.path, BreathRules.TEXTURE.sha256);
    const fileCache=new Map();
    const sourceFile=async name=>{if(!fileCache.has(name))fileCache.set(name,await load(name));return {name:'source/'+name,data:fileCache.get(name)};};
    const ruleFiles=await Promise.all(files.filter(name=>/(^|\/)(breath-rules|encoded-rules|encoded-renderer|token-material|account-motion)\.js$/.test(name)).map(sourceFile));
    const sourceHashes = await Promise.all(ruleFiles.map(async f => ({path:f.name, sha256:await hash(f.data)})));
    const getSourceFiles=()=>Promise.all(files.map(sourceFile));
    const rendererSHA256 = await hash(JSON.stringify(sourceHashes));
    const url = URL.createObjectURL(new Blob([textureBytes], {type:'image/png'}));
    let renderer;
    try { renderer = await EncodedRenderer.create(url); } finally { URL.revokeObjectURL(url); }
    const layerCache = new Map();
    async function recipe(study, capture, attempt = 0, status = 'visitor_account_unminted') {
      const layers = await Promise.all(study.tokens.map(async token => {
        if (!layerCache.has(token.id)) layerCache.set(token.id, await hash(EncodedRules.tokenInput(token.id)));
        return EncodedRules.tokenLayer({...token}, layerCache.get(token.id));
      }));
      const result = {
        version:'accounts-of-being/account-6', rendererVersion:EncodedRules.VERSION, rendererSHA256, rendererSources:sourceHashes,
        status, title:'Accounts of Being / ' + study.name, encounter:study.key, statement:study.claim,
        encoding:'cl100k_base', tokens:study.tokens.map(t => ({...t})), layers,
        encounterId:capture.encounterId, accountCreatedAt:capture.accountCreatedAt, visual:{...capture.visual}, collisionAttempt:attempt,
        identitySeed:await hash(EncodedRules.identityInput(capture.encounterId, attempt)),
        texture:{...BreathRules.TEXTURE}, textureSHA256:BreathRules.TEXTURE.sha256,
        palette:EncodedRules.PALETTE.map(p => p.slice()), dimensions:{width:2400,height:2400},
        timeRule:'The UTC fraction of the day rotates the field. The graphic phase at acknowledgement sets expansion and relative overlap.',
        tokenRule:'A versioned hash of each token ID selects its contour parameters and a pigment from the authored Hors-Série palette. Token order sets layer order.',
        identityRule:'An independent random identifier varies fine grain and filaments. It does not measure or verify the encounter.',
        timeSource:'Device clock at acknowledgement; graphic phase is not measured breathing.',
        reconstruction:'The saved PNG is authoritative. GPU reconstruction can differ between devices.',
        motion:{version:AccountMotion.VERSION,periodSeconds:AccountMotion.PERIOD,restingFrameSeconds:0,rule:'Token-specific drift, opening and internal flow move the same layers in a closed loop. No new seed or measured breathing.'},
        signature:null, chainRecord:null, rarity:null
      };
      result.seedInput = EncodedRules.seedInput(result); result.seed = await hash(result.seedInput);
      return result;
    }
    async function output(record, size = 2400) {
      const canvas = document.createElement('canvas'); renderer.render(canvas, record, size);
      const pixelSHA256 = await hash(canvas.getContext('2d').getImageData(0,0,size,size).data);
      const blob = await new Promise((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(Error('The image could not be prepared.')), 'image/png'));
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return {canvas, blob, bytes, pixelSHA256, artworkSHA256:await hash(bytes)};
    }
    return {recipe, output, render:renderer.render, renderLayer:renderer.renderLayer, renderMotion:renderer.renderMotion, load, textureBytes, getSourceFiles, sourceHashes};
  }
  function save(data, name, type) {
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], {type}));
    const a = document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function freeze(value) { for (const item of Object.values(value)) if (item && typeof item === 'object') freeze(item); return Object.freeze(value); }
  globalThis.AccountEngine = {create, hash, newId, save, freeze};
})();
