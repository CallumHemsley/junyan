import type { FramePoint } from '../../camera';

// The painted floor/apron and the two full-height wall tops in index.ts/paint.ts.
export const workshopFrame: readonly FramePoint[] = [
  {x:2,y:2,z:0},{x:28,y:2,z:0},{x:28,y:27,z:0},{x:2,y:27,z:0},
  {x:2,y:1.6,z:3.85},{x:28,y:1.6,z:3.85},
  {x:1.6,y:2,z:3.85},{x:1.6,y:21,z:3.85},
];
