import type { NativeObjectRecipe } from './native-object';

/** Joined oak case: broad inset doors, a recessed foot and restrained paired pulls. */
export function wardrobeRecipe(x:number, y:number, endX:number, endY:number):NativeObjectRecipe {
  const commands:NativeObjectRecipe['commands'] = [];
  const add = (part:string, left:number, back:number, bottom:number, right:number, front:number, top:number, color:[number,number,number]) =>
    commands.push({part,surface:{kind:'wood'},box:[left,back,bottom,right,front,top,color]});
  const mid=(x+endX)/2, front=endY-.08;
  add('recessed-foot',x+.12,y+.12,0,endX-.12,endY-.12,.22,[112,83,56]);
  add('case',x+.04,y+.04,.2,endX-.04,endY-.12,2.4,[159,119,77]);
  add('plinth',x,y,.2,endX,endY,.36,[164,124,80]);
  add('cornice',x,y,2.32,endX,endY,2.5,[193,153,101]);
  add('cornice-lip',x,y,2.28,endX,endY-.01,2.34,[139,102,66]);
  // The door plane sits behind its stiles; the dark center is a recess, not an ink outline.
  add('door-recess',x+.13,front-.04,.4,endX-.13,front,2.24,[112,83,56]);
  for(const [left,right] of [[x+.16,mid-.045],[mid+.045,endX-.16]]) {
    add('door',left,front-.025,.43,right,front+.025,2.21,[178,137,89]);
    add('inset-panel',left+.08,front+.026,.62,right-.08,front+.045,2.02,[164,124,80]);
    add('panel-lower-rail',left+.06,front+.035,.56,right-.06,front+.065,.64,[186,145,95]);
  }
  for(const left of [x+.02,endX-.14]) add('stile',left,y+.04,.34,left+.12,endY-.015,2.3,[180,139,90]);
  for(const left of [mid-.16,mid+.09]) add('pull',left,front+.05,1.12,left+.07,endY-.01,1.39,[215,194,143]);
  return {commands,pivot:{x:mid,y:(y+endY)/2}};
}
