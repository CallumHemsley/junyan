/** Original landscape art. The caller supplies the shared camera projection. */
export type LandscapePoint = { x: number; y: number };
export type LandscapeProp = {
  kind: string; position: LandscapePoint; width: number; height: number; variant: number | string;
};
export type LandscapeProject = (x: number, y: number, z?: number) => { x: number; y: number };

const colors: Record<string, string> = {
  grass: '#869d62', moss: '#637f60', 'orchard-floor': '#a1aa70', ridge: '#abb39a',
  water: '#639aa3', sand: '#d3c397', path: '#c6b78b', 'stone-path': '#a8b0a0',
  boardwalk: '#ac9066', bridge: '#b6a079',
};
export function landscapeMaterialColor(material: string): string | undefined {
  return colors[material];
}

export function drawLandscapeProp(
  ctx: CanvasRenderingContext2D, prop: LandscapeProp, project: LandscapeProject,
  unit = 18, elapsedMs = 0, reducedMotion = false,
  shadeColor: (base: string) => string = base => base,
): boolean {
  const p = project(prop.position.x, prop.position.y, 0);
  const scale = unit / 18;
  ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.scale(scale, scale);
  const block = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = shadeColor(color); ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const polygon = (points: number[][], color: string) => {
    ctx.fillStyle = shadeColor(color); ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y)));
    ctx.closePath(); ctx.fill();
  };
  const shadow = (w: number) => {
    ctx.save(); ctx.globalAlpha *= .4;
    polygon([[-w,0],[0,-w*.32],[w,0],[0,w*.32]], '#526b52');
    ctx.restore();
  };
  const crown = (x: number, y: number, w: number, h: number, dark: string, mid: string, light: string) => {
    polygon([[x-w,y],[x-w+3,y-h*.5],[x-w*.6,y-h*.5],[x-w*.6,y-h*.85],[x-3,y-h*.85],[x-3,y-h],[x+w*.5,y-h],[x+w*.5,y-h*.76],[x+w-2,y-h*.76],[x+w-2,y-h*.4],[x+w,y-h*.4],[x+w,y],[x+w*.6,y+4],[x-w*.5,y+4]],dark);
    polygon([[x-w+4,y-3],[x-w+4,y-h*.4],[x-w*.5,y-h*.4],[x-w*.5,y-h*.8],[x+w*.35,y-h*.8],[x+w*.35,y-h*.6],[x+w-5,y-h*.6],[x+w-5,y-h*.2],[x+w*.3,y-1]],mid);
    block(x-w*.5,y-h*.77,w*.65,3,light); block(x-w*.75,y-h*.4,w*.5,3,light); block(x+w*.2,y-h*.5,5,2,light);
  };
  const v = Number(prop.variant) || 0;
  let painted = true;
  switch (prop.kind) {
    case 'mature-tree': {
      const w=prop.width*7,h=108+v*7;
      shadow(w*.8);
      polygon([[-5,0],[-12,3],[-7,-6],[-5,-44],[-9,-58],[1,-66],[7,-51],[7,-8],[15,2],[6,-1]],'#61563d');
      polygon([[-3,-3],[-2,-46],[-4,-58],[1,-62],[3,-48],[3,-7]],'#a18d5b');
      polygon([[-3,-36],[-34,-63],[-37,-74],[-26,-67],[2,-47],[34,-82],[38,-78],[6,-34]],'#756647');
      crown(-w*.5,-45,w*.65,h*.44,'#355b43','#64844f','#92a565');
      crown(w*.49,-51,w*.72,h*.43,'#3d6245','#789252','#a8b56d');
      crown(-w*.12,-69,w*.82,h*.47,'#3e6546',v===1?'#9fa45e':'#789751',v===1?'#d1c27b':'#afbc75');
      crown(-w*.67,-36,w*.47,29,'#3b6348','#77935b','#a4b873');
      for(const [x,y] of [[-15,-67],[10,-86],[25,-55],[-30,-41]])block(x,y,4,2,v===2?'#d4c282':'#b4c07c');
      break;
    }
    case 'fern':
      for(let i=-3;i<=3;i++){const x=i*4;polygon([[0,0],[x-3,-9-Math.abs(i)*2],[x+1,-13-Math.abs(i)*2]],i%2?'#607e54':'#9caf6a');block(x/2,-5-Math.abs(i),2,2,'#bdd08b');}break;
    case 'tree': case 'willow': {
      const willow = prop.kind === 'willow';
      const w = prop.width * 7, h = 35 + v * 3;
      shadow(w); polygon([[-3,0],[-2,-27],[4,-31],[5,-6],[9,-2]],'#695b41');
      block(-1,-27,2,24,'#9b8357');
      polygon([[0,-20],[-13,-30],[-12,-33],[2,-26],[15,-35],[17,-33],[3,-18]],'#756642');
      if(willow || v===0) {
        crown(0,-22,w,h,willow?'#486f58':'#42694d',willow?'#75966a':'#6c8e58',willow?'#a1b57b':'#a6b875');
        crown(-w*.55,-17,w*.55,20,'#486f50','#7a9c64','#a1b57b');
      } else if(v===1) {
        polygon([[-w,-30],[-w*.85,-44],[-w*.35,-57],[0,-61],[w*.75,-53],[w,-36],[w*.5,-24],[-w*.45,-23]],'#6e844d');
        polygon([[-w*.85,-40],[-w*.35,-57],[0,-61],[w*.75,-53],[w*.4,-36],[-w*.4,-31]],'#a6ac65');
        for(let i=-2;i<3;i++) polygon([[0,-28],[i*8-2,-50-Math.abs(i)*2],[i*8+1,-51-Math.abs(i)*2]],'#bdc17d');
      } else if(v===2) {
        crown(-w*.5,-22,w*.65,25,'#4f7450','#8d9d65','#c3bd7c');
        crown(w*.45,-25,w*.7,29,'#547a54','#8ba36d','#c2ca8a');
        crown(0,-36,w*.65,25,'#5b7e53','#a2af70','#d0cf90');
      } else {
        crown(0,-38,w*.46,40,'#3f6550','#678b68','#99b386');
        crown(-w*.12,-21,w*.7,31,'#416a52','#6c916b','#a7b980');
        block(-3,-68,2,8,'#b1be8a');
      }
      if (willow) for (let i=-3;i<=3;i++) {
        const sway = reducedMotion ? 0 : Math.round(Math.sin(elapsedMs/1200+i)*1.2);
        block(i*6+sway,-35+(i%2)*3,2,22+((i+3)%3)*4,'#8eaa74');
        block(i*6+sway+1,-18+(i%2)*3,2,8,'#668b61');
      }
      if (!willow && v===2) for (const [x,y] of [[-8,-34],[6,-43],[12,-28],[-15,-25]]) block(x,y,3,3,'#c9b06c');
      break;
    }
    case 'bamboo':
      shadow(15);
      for(let i=-2;i<=2;i++) {
        const x=i*5, top=-40-((i+3)%3)*6;
        block(x,top,3,-top,'#638761'); block(x,top,1,-top,'#aec18b');
        for(let y=top+5;y<-4;y+=9) {block(x-1,y,5,1,'#405f4b'); polygon([[x,y],[x-12,y-7],[x-6,y-8]],'#8ca671');polygon([[x+2,y-3],[x+14,y-10],[x+8,y-3]],'#60845c');}
      }
      break;
    case 'rock': {
      const w=prop.width*6, h=prop.height*5;
      shadow(w); polygon([[-w,0],[-w*.8,-h],[-w*.2,-h*1.5],[w*.65,-h*1.3],[w,-h*.3],[w*.5,3]],'#75857d');
      polygon([[-w*.8,-h],[-w*.2,-h*1.5],[w*.65,-h*1.3],[w*.4,-h*.6],[-w*.3,-h*.3]],'#b6bba5');
      polygon([[w*.4,-h*.6],[w*.65,-h*1.3],[w,-h*.3],[w*.5,3]],'#5e756e');block(-w*.3,-h*.6,5,2,'#8d9e7b');break;
    }
    case 'reeds':
      for(let i=0;i<9;i++) {const x=(i%5)*3-6,y=-4-(i%3)*3;block(x,y-11-i%4,1,13+i%4,'#71855c'); block(x-1,y-15-i%4,3,5,'#a69c68');}break;
    case 'lilies':
      for(const [x,y] of [[-5,0],[4,-3],[5,3]]) {polygon([[x-4,y],[x,y-2],[x+5,y],[x,y+2]],'#819b6a');block(x,y-3,2,2,'#f2e4be');}break;
    case 'shrub':
      shadow(8);crown(0,-3,10,10,'#557851','#83985f','#afba7c');break;
    case 'flowers':
      for(let i=0;i<5;i++){let x=(i*7)%15-7,y=(i*3)%8-4;block(x,y-4,1,6,'#668457');block(x-1,y-6,3,3,i%2?'#e8d49a':'#d0d8b5');}break;
    case 'pavilion':
      shadow(42);polygon([[-34,0],[0,-18],[36,0],[0,18]],'#b1ae94');
      for(const [x,y] of [[-26,-1],[0,-14],[26,-1],[0,12]]) {block(x-2,y-35,4,35,'#7e6d4e');block(x-1,y-35,1,35,'#b79a67');}
      polygon([[-43,-35],[0,-59],[43,-35],[0,-12]],'#526b65');
      polygon([[-43,-35],[0,-59],[0,-49],[-34,-31]],'#82958a');
      polygon([[0,-59],[43,-35],[33,-31],[0,-49]],'#617c75');
      polygon([[-46,-35],[0,-15],[46,-35],[43,-30],[0,-10],[-43,-30]],'#3e574f');
      for(let i=-3;i<=3;i++) {block(i*7,-35+Math.abs(i)*2,3,2,'#a1b2a0');}
      block(-2,-63,4,8,'#c4b18b');break;
    case 'bench':
      shadow(20);for(const x of [-15,14]) {block(x,-10,3,12,'#655f49');block(x,-23,2,18,'#655f49');}
      for(let i=0;i<3;i++)block(-18,-23+i*4,39,3,i===0?'#b8a06b':'#9c895e');
      polygon([[-21,-10],[0,-16],[22,-9],[1,-3]],'#c2aa76');break;
    case 'cart':
      shadow(20);for(const x of [-14,13]){block(x-3,-4,6,7,'#4c584d');block(x-1,-3,2,5,'#a5a78c');}
      polygon([[-18,-13],[0,-21],[19,-13],[0,-4]],'#bba371');block(-18,-17,36,4,'#80694b');
      for(let i=0;i<7;i++)block(-13+i*4,-22+(i%2)*3,4,4,i%2?'#d2bd79':'#a9b875');break;
    case 'steps':
      for(let i=0;i<6;i++)polygon([[-17,-i*4],[0,-8-i*4],[17,-i*4],[0,8-i*4]],i%2?'#9ba58f':'#bbc0a4');break;
    case 'shrine':
      shadow(25);block(-17,-6,34,7,'#b4b6a0');block(-13,-26,26,21,'#8f927d');block(-6,-20,12,14,'#50675b');
      polygon([[-24,-28],[0,-43],[24,-28],[0,-17]],'#58736a');block(-23,-28,46,3,'#364f48');block(-2,-44,4,5,'#bdb18a');break;
    case 'boat':
      shadow(27);polygon([[-29,-1],[-17,-10],[21,-5],[30,2],[13,10],[-17,6]],'#6b6b52');polygon([[-23,-1],[-15,-7],[19,-2],[23,2],[11,6],[-15,3]],'#bca475');
      for(let i=-2;i<3;i++)block(i*7,-5+i,2,10,'#8c7958');block(-3,-14,2,19,'#d1bd91');break;
    case 'mooring': block(-3,-16,6,17,'#7c6d4c');block(-5,-17,10,3,'#b8a376');break;
    case 'stool': block(-6,-8,3,9,'#756647');block(4,-8,3,9,'#756647');block(-8,-11,17,4,'#b7a06d');break;
    case 'laundry':
      block(-29,-30,3,31,'#807152');block(27,-30,3,31,'#807152');block(-29,-29,59,1,'#d3c59e');
      for(let i=-2;i<=2;i++){block(i*10-4,-28,8,14+i%2*4,i%2?'#b8ccbe':'#e3dcc1');block(i*10-3,-27,2,11,'#c5cdb8');}break;
    case 'picnic':
      polygon([[-22,-3],[0,-14],[23,-3],[0,10]],'#c4ba8a');for(let i=-1;i<=1;i++)block(i*8-1,-4,3,3,'#8e9a78');block(-3,-12,8,5,'#b39560');break;
    default: painted=false;
  }
  ctx.restore();
  return painted;
}
