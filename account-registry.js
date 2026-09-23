/* A local uniqueness boundary only. One atomic transaction covers ID and pixel hash. */
(() => {
  'use strict';
  function open(name='accounts-of-being-local-1'){
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(name,1);
      request.onupgradeneeded=()=>{
        const store=request.result.createObjectStore('accounts',{keyPath:'encounterId'});
        store.createIndex('pixels','pixelSHA256',{unique:true});
      };
      request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
      request.onerror=()=>reject(Error('The local duplicate check is unavailable. Enable browser storage and try again.'));
      request.onblocked=()=>reject(Error('Close older copies of this encounter and try again.'));
    });
  }
  function reserve(db,record){
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('accounts','readwrite');
      let duplicate=false;
      // No image, statement, timestamp or location is retained by the index.
      const request=tx.objectStore('accounts').add({encounterId:record.encounterId,pixelSHA256:record.pixelSHA256});
      request.onerror=()=>{duplicate=request.error?.name==='ConstraintError';};
      tx.oncomplete=()=>resolve(true);
      tx.onabort=()=>duplicate?resolve(false):reject(Error('The local duplicate check could not be saved. Please try again.'));
      tx.onerror=()=>{};
    });
  }
  globalThis.AccountRegistry={open,reserve};
})();
