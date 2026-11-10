import { deflateSync } from "node:zlib";

function chunk(kind: string, bytes: Buffer): Buffer {
  const data = Buffer.concat([Buffer.from(kind), bytes]);
  let checksum = 0xffffffff;
  for (const byte of data) {
    checksum ^= byte;
    for (let bit = 0; bit < 8; bit++) checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0);
  }
  const size = Buffer.alloc(4), crc = Buffer.alloc(4);
  size.writeUInt32BE(bytes.length);
  crc.writeUInt32BE((checksum ^ 0xffffffff) >>> 0);
  return Buffer.concat([size, data, crc]);
}

/** Encode straight RGBA pixels as a PNG. */
export function encodePng(rgba: Uint8Array | Uint8ClampedArray, width: number, height: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = Buffer.alloc(height * (width * 4 + 1));
  for (let row = 0; row < height; row++) rows.set(rgba.subarray(row * width * 4, (row + 1) * width * 4), row * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0))]);
}

/** Nearest-neighbour upscale by a whole factor. */
export function upscale(rgba: Uint8Array | Uint8ClampedArray, width: number, height: number, factor: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * factor * height * factor * 4);
  for (let y = 0; y < height * factor; y++) for (let x = 0; x < width * factor; x++) {
    const from = (Math.floor(y / factor) * width + Math.floor(x / factor)) * 4, to = (y * width * factor + x) * 4;
    out[to] = rgba[from];
    out[to + 1] = rgba[from + 1];
    out[to + 2] = rgba[from + 2];
    out[to + 3] = rgba[from + 3];
  }
  return out;
}
