/* A small dependency-free ZIP writer. STORE only; all filenames are UTF-8.
   Fixed archive dates keep the same set of files byte-reproducible. */
(() => {
  'use strict';
  const encode = value => typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const b of bytes) crc = table[(crc ^ b) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const parts = [], directory = [];
    let offset = 0;
    files.forEach(file => {
      const name = encode(file.name), bytes = encode(file.data), crc = crc32(bytes);
      const header = new Uint8Array(30 + name.length), v = new DataView(header.buffer);
      v.setUint32(0, 0x04034b50, true);v.setUint16(4, 20, true);v.setUint16(6, 0x800, true);
      v.setUint16(12, 33, true);v.setUint32(14, crc, true);v.setUint32(18, bytes.length, true);
      v.setUint32(22, bytes.length, true);v.setUint16(26, name.length, true);header.set(name, 30);
      const central = new Uint8Array(46 + name.length), c = new DataView(central.buffer);
      c.setUint32(0, 0x02014b50, true);c.setUint16(4, 20, true);c.setUint16(6, 20, true);
      c.setUint16(8, 0x800, true);c.setUint16(14, 33, true);c.setUint32(16, crc, true);
      c.setUint32(20, bytes.length, true);c.setUint32(24, bytes.length, true);
      c.setUint16(28, name.length, true);c.setUint32(42, offset, true);central.set(name, 46);
      parts.push(header, bytes);directory.push(central);offset += header.length + bytes.length;
    });
    const directoryLength = directory.reduce((sum, p) => sum + p.length, 0);
    const end = new Uint8Array(22), e = new DataView(end.buffer);
    e.setUint32(0, 0x06054b50, true);e.setUint16(8, files.length, true);e.setUint16(10, files.length, true);
    e.setUint32(12, directoryLength, true);e.setUint32(16, offset, true);
    return new Blob([...parts, ...directory, end], {type:'application/zip'});
  }
  globalThis.AccountArchive = { zip };
})();
