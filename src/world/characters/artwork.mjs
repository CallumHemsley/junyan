export const W=28,H=40;
const ink=[48,43,42],skin=[232,183,143],cream=[245,232,202],jade=[111,154,134];
const shade=(c,n)=>c.map(v=>Math.max(0,Math.min(255,Math.round(v*n))));
export function frame({appearance={},direction=0,phase=0,action='idle',reducedMotion=false,carrying=false,blink=false}={}) {
 const data=new Uint8ClampedArray(W*H*4), shirt=appearance.shirt||cream,hair=appearance.hair||[54,43,34],kind=appearance.accessory||'player';
 const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&i<W&&j>=0&&j<H)data.set([...c,255],(j*W+i)*4);};
 const rows=(y,rs,c)=>rs.forEach(([x,w],i)=>rect(x,y+i,w,1,c));
 const rear=direction>=3&&direction<=5, side=direction===2||direction===6, diagonal=direction%2===1, flip=direction>4;
 const p=reducedMotion?0:phase%6, stride=action==='walk'?[0,2,3,0,-2,-3][p]:0;
 const sit=action==='sit'||action==='crouch', dy=action==='crouch'?8:sit?6:0, bob=!sit&&action==='walk'&&!reducedMotion&&(p===1||p===4)?-1:0;
 // Shoes and separate trouser hems retain a clear grounded gap.
 const legs=appearance.legs||[63,78,74];
 const screenStride=side?Math.round(stride):Math.round(stride*.5);
 const feet=[];
 for(const [x,s] of [[9,-1],[16,1]]) {
  const step=screenStride*s, lift=stride*s<0?2:0, footX=x+step;
  rect(x,28+dy/3,4,4,shade(legs,.78));
  rect(footX,31,4,5-lift,legs);
  rect(footX-1,35-lift,side?7:5,3,ink);
  rect(footX,35-lift,side?5:4,1,shade(legs,1.25));
  feet.push({x:footX+2,y:38-lift,planted:lift===0});
 }
 const top=18+dy+bob,bottom=30+dy/3;
 rows(top,[[9,10],[8,12],[7,14]],shade(shirt,.65));rect(7,top+3,14,bottom-top-3,shade(shirt,.7));rect(8,top+1,11,bottom-top-2,shirt);rect(9,top+2,3,bottom-top-3,shade(shirt,1.08));
 if(kind==='player'&&!rear){rect(10,top+3,8,bottom-top-3,jade);rect(11,top+1,1,4,jade);rect(17,top+1,1,4,jade);rect(12,top+7,4,2,shade(jade,.8));}
 if(kind==='tie'&&!rear){rect(10,top+1,3,2,cream);rect(15,top+1,3,2,cream);rect(13,top+3,2,6,[115,86,58]);}
 if(kind==='bun'&&!rear){rect(9,top+2,2,2,cream);rect(17,top+2,2,2,cream);}
 if(kind==='backpack'&&rear){rect(9,top+1,11,11,[190,157,97]);rect(10,top+2,9,7,[207,177,116]);rect(11,top+9,7,2,[150,124,77]);}
 for(const s of [-1,1]){const swing=action==='walk'&&!reducedMotion?Math.sign(stride)*s:0; const armX=s<0?5:20;rect(armX,top+3,3,7+swing,shade(shirt,s<0?1:.8));rect(armX,top+9+swing,3,3,skin);rect(armX,top+8+swing,3,1,cream);}
 // Contoured head with a coherent dark rim; no sphere highlights.
 const hy=5+dy+bob, faceShift=diagonal?(flip?-1:1):0;
 rows(hy,[[10,8],[8,12],[7,14],[7,14],[7,14],[7,14],[7,14],[8,12],[8,12],[9,10],[10,8],[11,6]],shade(skin,.72));
 rect(8,hy+3,12,5,skin);rect(9,hy+8,10,2,skin);rect(10,hy+10,8,1,skin);rect(10,hy+3,7,4,shade(skin,1.06));
 rows(hy-2,[[10,8],[8,12],[7,14],[7,14],[7,14],[7,14]],hair);rect(7,hy+2,2,6,hair);rect(19,hy+2,2,6,hair);rect(9,hy-1,7,1,shade(hair,1.22));
 if(rear){rect(8,hy+2,12,6,hair);rows(hy+8,[[9,10],[10,8]],hair);}else {
 rect(9,hy+2,4,1,hair);rect(17,hy+2,2,2,hair);
 const ex=side?(flip?9:17):10+faceShift;rect(ex,hy+5,blink?2:1,blink?1:2,ink);if(!side)rect(17+faceShift,hy+5,blink?2:1,blink?1:2,ink);rect(side?(flip?7:20):13,hy+7,2,1,shade(skin,.8));rect(side?(flip?10:17):12,hy+9,side?2:4,1,[176,119,88]);
 if(kind==='glasses'){rect(9,hy+4,4,1,ink);rect(9,hy+7,4,1,ink);rect(8,hy+5,1,2,ink);rect(13,hy+5,1,2,ink);if(!side){rect(15,hy+4,4,1,ink);rect(15,hy+7,4,1,ink);rect(14,hy+5,1,2,ink);rect(19,hy+5,1,2,ink);}}
 }
 if(diagonal){rect(flip?19:7,hy+3,2,6,hair);}
 if(kind==='bun'){rect(10,hy-5,7,4,hair);rect(11,hy-6,5,1,hair);rect(17,hy-4,2,1,jade);}
 if(kind==='backpack'){rect(flip?6:20,hy+5,3,9,hair);rect(flip?6:20,hy+8,3,1,[190,157,97]);}
 if(carrying&&rear&&diagonal){rect(flip?3:22,top+9,3,2,[115,86,58]);}
 if(carrying&&!rear){rect(side?(flip?0:18):5,top+10,side?10:18,2,[115,86,58]);rect(side?(flip?1:19):6,top+9,side?8:16,1,[190,157,97]);rect(side?(flip?2:20):8,top+6,5,3,cream);}
 if(action==='interact'&&!reducedMotion){const reach=phase%2;rect(flip?3:22,top+5-reach,3,4,skin);}
 return {width:W,height:H,pixels:data,anchor:{x:14,y:38},held:{x:side?(flip?5:23):14,y:top+10},feet};
}
