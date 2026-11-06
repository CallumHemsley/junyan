export const W = 28, H = 40;
const ink = [48,43,42], skin = [232,183,143], cream = [245,232,202];
const jade = [111,154,134], wood = [115,86,58], brass = [190,157,97];
const shade = (color, amount) => color.map(value => Math.max(0,Math.min(255,Math.round(value*amount))));

export function frame({appearance={},direction=0,phase=0,action='idle',reducedMotion=false,carrying=false,blink=false,heldObject,acting=false,body,role,seatHeight,handRestHeight,pixelsPerWorldUnit=18}={}) {
  const attachedSeat=action==='sit'&&seatHeight!==undefined;
  const seatLift=attachedSeat?Math.round(seatHeight*pixelsPerWorldUnit)-9:0;
  const padding=attachedSeat?Math.max(0,seatLift)+2:0;
  const frameHeight=H+padding;
  const pixels = new Uint8ClampedArray(W*frameHeight*4);
  const shirt = appearance.shirt || cream, hair = appearance.hair || [54,43,34];
  const trousers = appearance.legs || [63,78,74], kind = appearance.accessory || 'player';
  const turn = Math.min(direction,8-direction), mirror = direction>4;
  const rear = turn>=3, quarter = turn===1 || turn===3, profile = turn===2;
  const older = kind==='glasses', fuller = kind==='bun', tall = kind==='tie' || kind==='backpack';
  const seated = action==='sit', crouched = action==='crouch';
  const walking = action==='walk' && !reducedMotion;
  const stride = walking ? [-2,-1,1,2,1,-1][phase%6] : 0;
  const lowering = attachedSeat?-seatLift:crouched?8:seated?5:0;
  const shoulder = 18 + lowering + (older?2:tall?-1:0)+(body?.heightOffset??0);
  const hip = attachedSeat?29-seatLift:29+(seated?2:crouched?3:0);
  const faceX = 14 + (profile?2:quarter?1:0) + (older?1:0)+(body?.lean??0);
  const headY = 4 + lowering + (older?2:tall?-1:0)+(body?.heightOffset??0);
  const transformX = x => mirror ? W-1-x : x;
  let behind = false;

  function rect(x,y,width,height,color) {
    const left=Math.round(x),top=Math.round(y),right=Math.round(x+width),bottom=Math.round(y+height);
    for(let py=top;py<bottom;py++)for(let px=left;px<right;px++) {
      const tx=transformX(px);
      const row=py+padding;
      if(tx>=0&&tx<W&&row>=0&&row<frameHeight) {
        const offset=(row*W+tx)*4;
        if(!behind||!pixels[offset+3])pixels.set([...color,255],offset);
      }
    }
  }
  function polygon(points,color) {
    const minY=Math.floor(Math.min(...points.map(p=>p[1]))),maxY=Math.ceil(Math.max(...points.map(p=>p[1])));
    for(let y=minY;y<maxY;y++) {
      const intersections=[];
      for(let i=0;i<points.length;i++) {
        const a=points[i],b=points[(i+1)%points.length];
        if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))intersections.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      intersections.sort((a,b)=>a-b);
      for(let i=0;i<intersections.length;i+=2)rect(Math.ceil(intersections[i]),y,Math.floor(intersections[i+1])-Math.ceil(intersections[i])+1,1,color);
    }
  }
  function stroke(from,to,width,color) {
    const steps=Math.max(Math.abs(to[0]-from[0]),Math.abs(to[1]-from[1]),1);
    for(let i=0;i<=steps;i++)rect(from[0]+(to[0]-from[0])*i/steps-width/2,from[1]+(to[1]-from[1])*i/steps,width,1,color);
  }

  const feet=[];
  function leg(near) {
    const side=near?1:-1;
    const originX=profile?(near?14:12):quarter?(near?17:11):near?17:10;
    const along=profile?stride*side:quarter?Math.round(stride*side*(role?1:.7)):Math.round(stride*side*.2);
    const lift=walking&&stride*side>0?2:0;
    const contactY=37-lift+(quarter&&!near?-1:0);
    const footX=originX+along+(seated?2:0);
    const knee=[originX+Math.round(along*.5),attachedSeat?hip+1:seated?34:crouched?35:33-lift];
    const color=shade(trousers,near?1:.72);
    stroke([originX,hip],knee,body?.legWidth??4,color);
    stroke(knee,[footX,contactY-2],3,color);
    const shoeWidth=profile?6:quarter?5:4;
    rect(footX-2,contactY-1,shoeWidth,2,ink);
    rect(footX-1,contactY-1,shoeWidth-1,1,shade(trousers,1.15));
    feet.push({x:transformX(footX),y:contactY+1+padding,planted:lift===0});
  }
  const bodyWidth=(profile?8:quarter?11:fuller?16:kind==='backpack'?12:14)+(body?.widthOffset??0);
  const bodyX=14-bodyWidth/2+(quarter?0:profile?1:0);
  const nearShoulder=[bodyX+bodyWidth,shoulder+(quarter?2:1)];
  const farShoulder=[bodyX,shoulder+(quarter?0:1)];
  let held={x:22,y:shoulder+9};
  function arm(near) {
    const root=near?nearShoulder:farShoulder;
    const swing=walking?stride*(near?-1:1):0;
    const working=(action==='interact'||action==='react')&&near;
    const occupied=carrying||heldObject;
    const elbow=working?[root[0]+1,root[1]+5]:occupied?[root[0]+1,root[1]+5]:[root[0]+swing*.5,root[1]+5];
    const hand=working?[root[0]+3,root[1]+3+(reducedMotion?0:phase%3)]:occupied?[root[0]+2,root[1]+7]:[root[0]+swing,root[1]+9+(near?0:-1)];
    if(role==='reader'||role==='courier'||role==='laundry') {
      const center=profile?18:quarter?16:14;
      elbow[0]=root[0];elbow[1]=root[1]+5;
      hand[0]=center+(near?3:-3);hand[1]=shoulder+(role==='reader'?8:9)+(walking?Math.abs(stride)===2?1:0:0);
      if(role==='courier'&&action==='interact'&&!reducedMotion)hand[1]+=phase%2;
    }
    if(role==='groundskeeper'&&near&&working){hand[0]-=reducedMotion?0:phase%3;hand[1]+=3;}
    if(attachedSeat) {
      const center=profile?18:quarter?16:14;
      elbow[0]=root[0];elbow[1]=shoulder+6;
      hand[0]=center+(near?4:-4);hand[1]=handRestHeight===undefined?shoulder+3:38-Math.round(handRestHeight*pixelsPerWorldUnit);
    }
    if(!attachedSeat&&handRestHeight!==undefined&&action==='interact') {
      elbow[1]=shoulder+4;hand[1]=38-Math.round(handRestHeight*pixelsPerWorldUnit);
    }
    if(acting&&!walking&&role)hand[1]-=1;
    if(action==='react'&&near){elbow[1]-=3;hand[1]-=7;}
    if(acting&&!walking&&!occupied&&!working&&near){hand[0]-=3;hand[1]-=4;}
    stroke(root,elbow,near?4:3,shade(shirt,near?.86:.64));
    stroke(elbow,hand,3,shade(skin,near?1:.82));
    rect(elbow[0]-1,elbow[1],3,1,cream);
    rect(hand[0]-1,hand[1],3,2,skin);
    if(near)held={x:hand[0]+1,y:hand[1]};
  }

  leg(false);
  arm(false);
  if(kind==='backpack'&&!rear)rect(bodyX-2,shoulder+3,3,9,brass);
  polygon([[bodyX+2,shoulder],[bodyX+bodyWidth-2,shoulder+(quarter?1:0)],[bodyX+bodyWidth,shoulder+4],[bodyX+bodyWidth-1,hip+1],[bodyX,hip+1],[bodyX-1,shoulder+4]],shade(shirt,.65));
  polygon([[bodyX+2,shoulder+1],[bodyX+bodyWidth-3,shoulder+1],[bodyX+bodyWidth-1,shoulder+4],[bodyX+bodyWidth-2,hip],[bodyX+1,hip],[bodyX,shoulder+4]],shirt);
  rect(bodyX+2,shoulder+3,2,Math.max(2,hip-shoulder-4),shade(shirt,1.08));
  leg(true);
  if(!rear) {
    if(kind==='player') {
      rect(bodyX+2,shoulder+4,bodyWidth-4,hip-shoulder-3,jade);
      rect(bodyX+3,shoulder+1,1,4,jade);
      rect(bodyX+bodyWidth-4,shoulder+1,1,4,jade);
      rect(bodyX+4,hip-3,Math.max(2,bodyWidth-8),1,shade(jade,.75));
    } else if(kind==='aunt') {
      polygon([[bodyX+3,shoulder+4],[bodyX+bodyWidth-3,shoulder+5],[bodyX+bodyWidth-2,hip+2],[bodyX+2,hip+2]],cream);
      stroke([bodyX+1,shoulder+1],[bodyX+bodyWidth-2,hip],1,wood);
      rect(bodyX+4,hip-3,3,1,shade(cream,.78));
    } else if(kind==='tie') {
      polygon([[bodyX+2,shoulder+1],[bodyX+6,shoulder+2],[bodyX+4,shoulder+4]],cream);
      rect(bodyX+6,shoulder+3,2,6,wood);
    } else if(fuller || older) {
      rect(bodyX+4,shoulder+1,3,2,cream);
      rect(bodyX+7,shoulder+4,1,1,shade(shirt,.7));
      rect(bodyX+7,shoulder+7,1,1,shade(shirt,.7));
    }
  } else {
    rect(bodyX+2,shoulder+3,bodyWidth-4,1,shade(shirt,.9));
    if(kind==='backpack') {
      rect(bodyX+1,shoulder+2,bodyWidth-1,10,shade(brass,.75));
      rect(bodyX+2,shoulder+2,bodyWidth-3,8,brass);
      rect(bodyX+3,shoulder+8,bodyWidth-5,3,shade(brass,1.1));
      rect(bodyX+bodyWidth-3,shoulder+5,1,1,cream);
    }
    if(kind==='player')rect(bodyX+2,hip-3,bodyWidth-4,1,jade);
    if(kind==='aunt'){rect(bodyX,hip-3,bodyWidth,1,cream);rect(bodyX+3,hip-2,2,3,shade(cream,.9));}
  }
  if(role==='reader') {
    rect(bodyX+1,shoulder+2,2,hip-shoulder-1,shade(shirt,.8));
    rect(bodyX+bodyWidth-3,shoulder+2,2,hip-shoulder-1,shade(shirt,.8));
    rect(bodyX+bodyWidth-4,hip-3,2,2,wood);
  } else if(role==='courier') {
    stroke([bodyX+2,shoulder+1],[bodyX+bodyWidth-2,hip],2,wood);
    rect(bodyX-2,hip-6,5,7,wood);rect(bodyX-1,hip-5,3,2,brass);
  } else if(role==='groundskeeper') {
    rect(bodyX+2,shoulder+5,bodyWidth-4,hip-shoulder-4,shade(shirt,.8));
    rect(bodyX+3,shoulder+6,3,3,shade(shirt,1.12));
  } else if(role==='laundry') {
    polygon([[bodyX+2,hip-4],[bodyX+bodyWidth-2,hip-4],[bodyX+bodyWidth+1,35],[bodyX-2,35]],shade(shirt,.74));
    for(let x=bodyX+1;x<bodyX+bodyWidth;x+=3)rect(x,hip-2,1,5,shade(shirt,.9));
    rect(bodyX+2,shoulder+2,bodyWidth-4,2,cream);
  } else if(role==='river-walker') {
    polygon([[bodyX+1,shoulder+2],[bodyX+bodyWidth-1,shoulder+2],[bodyX+bodyWidth,34],[bodyX+1,34],[bodyX,hip]],shirt);
    rect(bodyX+bodyWidth-3,shoulder+3,1,14,shade(shirt,.7));
    rect(bodyX+2,shoulder+1,3,7,cream);rect(bodyX+3,shoulder+7,2,4,shade(cream,.85));
  }
  arm(true);

  const headWidth=(profile?11:quarter?13:older?13:14)+(body?.headWidthOffset??0);
  const left=faceX-headWidth/2;
  rect(faceX-2,shoulder-3,4,4,shade(skin,.85));
  polygon([[left+3,headY],[left+headWidth-3,headY],[left+headWidth,headY+3],[left+headWidth,headY+10],[left+headWidth-3,headY+13],[left+3,headY+13],[left,headY+9],[left,headY+3]],shade(skin,.77));
  polygon([[left+2,headY+3],[left+headWidth-1,headY+3],[left+headWidth-1,headY+9],[left+headWidth-3,headY+12],[left+3,headY+12],[left+1,headY+8]],skin);
  rect(left+3,headY+4,Math.max(3,headWidth-6),3,shade(skin,1.05));
  polygon([[left+2,headY-1],[left+headWidth-3,headY-1],[left+headWidth-1,headY+1],[left+headWidth,headY+5],[left+headWidth-2,headY+5],[left+headWidth-3,headY+3],[left+2,headY+3],[left+1,headY+8],[left-1,headY+7],[left-1,headY+2]],hair);
  rect(left+3,headY,Math.max(3,headWidth-7),1,shade(hair,1.22));
  if(rear) {
    polygon([[left,headY+3],[left+headWidth-1,headY+2],[left+headWidth,headY+8],[left+headWidth-3,headY+11],[left+2,headY+11],[left,headY+8]],hair);
    if(quarter) {
      rect(left+headWidth,headY+6,1,4,skin);
      rect(left+headWidth-1,headY+6,1,2,shade(skin,.8));
    }
  } else {
    const nearEye=left+headWidth-3,farEye=left+(quarter?4:3);
    if(!profile)rect(farEye,headY+6,1,blink?1:2,ink);
    rect(nearEye,headY+6,blink?2:1,blink?1:2,ink);
    rect(left+headWidth-1,headY+8,profile?2:1,1,shade(skin,.85));
    rect(profile?nearEye-1:faceX-1+(quarter?1:0),headY+10,profile?2:3,1,[176,119,88]);
    if(older) {
      for(const eye of profile?[nearEye]:[farEye,nearEye]) {
        rect(eye-1,headY+5,3,1,wood);rect(eye-1,headY+8,3,1,wood);
        rect(eye-2,headY+6,1,2,wood);rect(eye+2,headY+6,1,2,wood);
      }
      if(!profile)rect(farEye+2,headY+6,Math.max(1,nearEye-farEye-3),1,wood);
    }
  }
  if(fuller) {
    const bunX=rear?(quarter?left+2:faceX-2):left;
    polygon([[bunX,headY-3],[bunX+4,headY-4],[bunX+6,headY-2],[bunX+5,headY+1],[bunX,headY+1],[bunX-1,headY-1]],hair);
    rect(bunX+4,headY-2,2,1,jade);
  }
  if(kind==='backpack') {
    const ponyX=rear?left-2:left;
    polygon([[ponyX,headY+5],[ponyX+3,headY+5],[ponyX+4,headY+11],[ponyX+2,headY+16],[ponyX,headY+15],[ponyX+1,headY+10]],hair);
    rect(ponyX,headY+8,3,1,brass);
  }
  if(kind==='aunt') {
    rect(left-1,headY+4,2,9,hair);rect(left+headWidth-1,headY+4,2,9,hair);
    if(rear)polygon([[left,headY+7],[left+headWidth,headY+7],[left+headWidth-1,headY+14],[left+2,headY+14],[left,headY+12]],hair);
    rect(left+1,headY+11,2,3,hair);
  }
  if(role==='reader') {
    rect(left-1,headY+5,2,7,hair);rect(left+headWidth-1,headY+5,2,6,hair);
    rect(left+1,headY+10,2,2,hair);
  } else if(role==='courier') {
    polygon([[left,headY+2],[left+2,headY-2],[left+headWidth-3,headY-2],[left+headWidth,headY+2]],shade(shirt,.78));
    rect(left-1,headY+2,headWidth+4,2,shade(shirt,.68));
  } else if(role==='groundskeeper') {
    rect(left+2,headY-2,headWidth-4,4,brass);rect(left-4,headY+2,headWidth+8,2,shade(brass,.85));
    rect(left+3,headY-1,headWidth-7,1,cream);
  } else if(role==='laundry') {
    polygon([[left-1,headY+5],[left+1,headY-1],[left+headWidth-2,headY-1],[left+headWidth+1,headY+5],[left+headWidth-1,headY+4],[left+headWidth-3,headY+1],[left+2,headY+2]],cream);
    polygon([[left-2,headY+4],[left,headY+4],[left+1,headY+10],[left-3,headY+8]],shade(cream,.82));
  } else if(role==='river-walker') {
    rect(left-1,headY+5,2,8,hair);rect(left,headY+11,3,3,hair);
    polygon([[left+1,headY+1],[left+3,headY-2],[left+headWidth-3,headY-2],[left+headWidth-1,headY+1]],shade(cream,.78));
    rect(left-1,headY+1,headWidth+2,1,shade(cream,.67));
  }
  behind=rear;
  const object=heldObject || (carrying?'tray':undefined);
  if(object==='tray') {
    const ox=profile?held.x-4:quarter?held.x-9:7,oy=held.y;
    rect(ox,oy,profile?9:16,2,wood);rect(ox+1,oy-1,profile?7:14,1,brass);
    if(!rear){rect(ox+2,oy-4,4,3,cream);rect(ox+3,oy-5,2,1,shade(cream,.8));}
  } else if(object==='watering-can') {
    rect(held.x-3,held.y-2,5,5,jade);rect(held.x+2,held.y,3,1,shade(jade,.7));
    rect(held.x-5,held.y-1,2,3,shade(jade,.8));rect(held.x-4,held.y-2,2,1,jade);
  } else if(object==='tool') {
    rect(held.x,held.y-4,1,5,wood);rect(held.x-1,held.y-5,3,2,[166,174,168]);
  }
  if(object==='book'||object==='parcel'||object==='laundry-basket') {
    const center=profile?18:quarter?16:14,oy=held.y;
    if(object==='book') {
      polygon([[center-5,oy-3],[center,oy-2],[center+5,oy-4],[center+5,oy+2],[center,oy+3],[center-5,oy+2]],wood);
      rect(center-4,oy-2,4,3,cream);rect(center+1,oy-3,3,4,shade(cream,.93));
      rect(center,oy-2,1,4,shade(cream,.7));
      if(!reducedMotion&&action==='interact')rect(center+1+(phase%3),oy-2,1,3,shade(cream,.8));
    } else if(object==='parcel') {
      rect(center-5,oy-3,11,6,brass);rect(center-5,oy+2,11,1,wood);
      rect(center-1,oy-3,2,6,cream);rect(center-5,oy-2,11,1,shade(brass,1.12));
    } else {
      polygon([[center-6,oy-1],[center+6,oy-1],[center+5,oy+5],[center-5,oy+5]],brass);
      rect(center-6,oy-2,13,2,wood);
      const fold=!reducedMotion&&action==='interact'?phase%3-1:0;
      rect(center-4+fold,oy-5,5,3,cream);rect(center,oy-4,5,2,[158,175,188]);
      for(let x=center-4;x<center+5;x+=3)rect(x,oy+1,1,3,shade(brass,.75));
    }
    if(!rear){rect(center-6,oy-1,2,2,skin);rect(center+5,oy-1,2,2,skin);}
  } else if(object==='broom') {
    const bx=Math.min(24,held.x),sweep=!reducedMotion&&action==='interact'?phase%3-1:0;
    stroke([bx,held.y-7],[bx-2+sweep,36],1,wood);
    polygon([[bx-3+sweep,33],[bx+sweep,33],[bx+2+sweep,38],[bx-5+sweep,38]],brass);
    rect(bx-3+sweep,33,4,1,wood);
  } else if(object==='folded-umbrella') {
    const ux=Math.min(24,held.x);
    rect(ux,held.y-2,1,4,wood);
    polygon([[ux-1,held.y+2],[ux+2,held.y+2],[ux+1,36],[ux,38],[ux-1,36]],shade(jade,.75));
    rect(ux-1,held.y+7,3,1,cream);
  }
  return {width:W,height:frameHeight,pixels,anchor:{x:14,y:38+padding},held:{x:transformX(held.x),y:held.y+padding},pelvis:{x:14,y:hip+padding},feet,...(attachedSeat?{seatContact:{x:14,y:hip+padding,height:seatHeight}}:{})};
}
