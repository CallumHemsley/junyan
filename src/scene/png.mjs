import {deflateSync} from 'node:zlib';
import {WIDTH, HEIGHT} from './renderer.js';

function chunk(kind, bytes) {
  const data=Buffer.concat([Buffer.from(kind),bytes]);
  let checksum=0xffffffff;
  for(const byte of data) {
    checksum^=byte;
    for(let bit=0;bit<8;bit++) checksum=(checksum>>>1)^((checksum&1)?0xedb88320:0);
  }
  const size=Buffer.alloc(4),crc=Buffer.alloc(4);
  size.writeUInt32BE(bytes.length); crc.writeUInt32BE((checksum^0xffffffff)>>>0);
  return Buffer.concat([size,data,crc]);
}
export function png(pixels,width=WIDTH,height=HEIGHT) {
  const header=Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height,4); header[8]=8; header[9]=6;
  const rows=Buffer.alloc(height*(width*4+1));
  for(let row=0;row<height;row++) rows.set(pixels.subarray(row*width*4,(row+1)*width*4),row*(width*4+1)+1);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
