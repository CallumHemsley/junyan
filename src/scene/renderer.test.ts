import {describe, expect, it} from 'vitest';
import {createHash} from 'node:crypto';
import {content} from '../content';
import {TABLES, type GameState, type Phase} from '../contracts';
import {characterFigure, characterTray, COLORS, createRenderer, customerPose, groundPosition, projectPosition, WIDTH, HEIGHT, type ScenePoint} from './renderer.js';

describe('restaurant projection',()=>{
  it('round trips every logical floor coordinate through the overlay projection',()=>{
    for(let x=0;x<=12;x++) for(let y=0;y<=10;y++) {
      const screen=projectPosition({x,y});
      const floor=groundPosition(screen.left,screen.top);
      expect(floor.x).toBeCloseTo(x,10);
      expect(floor.y).toBeCloseTo(y,10);
    }
    expect(projectPosition({x:6,y:5}).left).toBe(50);
    expect(projectPosition({x:6,y:5},1).top).toBeLessThan(projectPosition({x:6,y:5}).top);
  });
  it('bounds off-floor pointer coordinates',()=>{
    for(const left of [-100,0,100,200]) for(const top of [-100,0,100,200]) {
      const p=groundPosition(left,top);
      expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(12);
      expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(10);
    }
  });
});

describe('facing-relative carrying geometry',()=>{
  type Bone={start:ScenePoint;end:ScenePoint;startRadius:number;endRadius:number;color:number[]};
  const geometry=(yaw=0,x=0,y=0)=>{
    const bones:Bone[]=[];
    const rig=characterFigure(x,y,yaw,{carry:true},{},(start,end,startRadius,endRadius,colorOf)=>{
      bones.push({start,end,startRadius,endRadius,color:colorOf(start[2])});
    });
    const body=bones.slice();
    const surfaces:ScenePoint[]=[];
    characterTray(rig,Array(6).fill('bun'),(start,end,color,transform)=>{
      expect(color).toBe(COLORS.wood);
      for(const forward of [start[0],end[0]]) for(const side of [start[1],end[1]]) for(const height of [start[2],end[2]]) surfaces.push(transform(forward,side,height));
    });
    return {body,tray:bones.slice(body.length),bones,surfaces};
  };
  it('rigidly rotates every body, hand, apron, tray and food primitive through eight yaws',()=>{
    const reference=geometry();
    for(let direction=0;direction<8;direction++) {
      const yaw=direction*Math.PI/4,rotated=geometry(yaw,1,3);
      expect(rotated.bones).toHaveLength(reference.bones.length);
      reference.bones.forEach((bone,index)=>{
        for(const endpoint of ['start','end'] as const) {
          const [forward,side,height]=bone[endpoint];
          expect(rotated.bones[index][endpoint][0]).toBeCloseTo(1+Math.cos(yaw)*forward-Math.sin(yaw)*side,10);
          expect(rotated.bones[index][endpoint][1]).toBeCloseTo(3+Math.sin(yaw)*forward+Math.cos(yaw)*side,10);
          expect(rotated.bones[index][endpoint][2]).toBe(height);
        }
        expect(rotated.bones[index].startRadius).toBe(bone.startRadius);
        expect(rotated.bones[index].color).toEqual(bone.color);
      });
      reference.surfaces.forEach(([forward,side,height],index)=>{
        expect(rotated.surfaces[index][0]).toBeCloseTo(1+Math.cos(yaw)*forward-Math.sin(yaw)*side,10);
        expect(rotated.surfaces[index][1]).toBeCloseTo(3+Math.sin(yaw)*forward+Math.cos(yaw)*side,10);
        expect(rotated.surfaces[index][2]).toBe(height);
      });
    }
  });
  it('connects both bent arms to palms supporting the tray, with all six food slots above it',()=>{
    const {body,tray}=geometry();
    const palms=body.filter(bone=>bone.startRadius===.12&&bone.start.every((value,index)=>value===bone.end[index]));
    for(const side of [-1,1]) {
      const forearm=body.find(bone=>bone.end[0]===.57&&bone.end[1]===side*.34&&bone.startRadius===.105)!;
      const upperArm=body.find(bone=>bone.end.every((value,index)=>value===forearm.start[index])&&bone.startRadius===.16)!;
      expect(upperArm).toBeDefined();
      const palm=palms.find(bone=>bone.start.every((value,index)=>value===forearm.end[index]));
      expect(palm).toBeDefined();
      expect(Math.hypot(...forearm.end.map((value,index)=>value-forearm.start[index]))).toBeLessThan(.5);
      expect(forearm.end[2]).toBeLessThan(1.28);
      expect(forearm.end[2]+.12).toBeGreaterThan(1.28);
    }
    const food=tray.filter(bone=>bone.color===COLORS.jade);
    expect(food).toHaveLength(6);
    expect(new Set(food.map(bone=>bone.start.slice(0,2).join(','))).size).toBe(6);
    for(const bowl of food) expect(bowl.start[2]).toBeGreaterThan(1.32);
    expect(Math.max(...body.map(bone=>Math.max(bone.start[2]+bone.startRadius,bone.end[2]+bone.endRadius)))).toBeLessThan(2.6);
  });
  it('places facial features only on the forward face, never on the back of the head',()=>{
    const eyes=geometry().body.filter(bone=>bone.color===COLORS.ink);
    expect(eyes).toHaveLength(2);
    for(const eye of eyes) expect(eye.start[0]).toBeGreaterThan(.3);
  });
  it('raises the eating arm from the ordered pose without relying on a food raster difference',()=>{
    const hands=(phase:Phase,greeting=false)=>{
      const points:ScenePoint[]=[];
      const pose={...customerPose(phase,'backpack'),greeting};
      characterFigure(0,0,0,pose,{accessory:'backpack'},(start,end,radius)=>{
        if(radius===.12*pose.scale&&start.every((value,index)=>value===end[index])) points.push(start);
      });
      return points;
    };
    const ordered=hands('ordered'),eating=hands('checkout'),served=hands('served');
    expect(ordered).toHaveLength(2);
    expect(eating).toHaveLength(2);
    expect(eating[0]).toEqual(ordered[0]);
    expect(eating[1][2]).toBeGreaterThan(ordered[1][2]+.12);
    expect(served[1][2]).toBe(eating[1][2]);
    expect(hands('ordered',true)[0][2]).toBeGreaterThan(ordered[0][2]);
    expect(customerPose('ordered','backpack').greeting).toBe(true);
    expect(customerPose('checkout','backpack').greeting).toBe(false);
  });
  it('overrides the common right-arm chain without adding a third hand',()=>{
    const hands:ScenePoint[]=[];
    const handR:ScenePoint=[.73,.35,1.55],elbowR:ScenePoint=[.33,.45,1.36];
    const ends:ScenePoint[]=[];
    characterFigure(0,0,0,{elbowR,handR},{},(start,end,radius)=>{
      ends.push(end);
      if(radius===.12&&start.every((value,index)=>value===end[index])) hands.push(start);
    });
    expect(hands).toHaveLength(2);
    expect(hands).toContainEqual(handR);
    expect(ends).toContainEqual(elbowR);
  });
});

describe('four-character hair and eyes',()=>{
  const geometry=(accessory?:string,pose={})=>{
    const bones:{start:ScenePoint;end:ScenePoint;startRadius:number;endRadius:number;color:number[]}[]=[];
    characterFigure(0,0,0,pose,{accessory,hair:[17,19,23]},(start,end,startRadius,endRadius,colorOf)=>{
      bones.push({start,end,startRadius,endRadius,color:colorOf(start[2])});
    });
    return bones;
  };
  it('authors distinct connected crowns with coverage down both temples',()=>{
    const silhouettes=[];
    for(const accessory of [undefined,'bun','tie','backpack']) {
      const hair=geometry(accessory).filter(bone=>bone.color.join(',')==='17,19,23'&&bone.startRadius>.075);
      silhouettes.push(JSON.stringify(hair));
      for(const side of [-1,1]) expect(hair.some(bone=>bone.end[1]*side>.30&&bone.end[2]<2.09)).toBe(true);
      const connected=new Set([0]);
      for(let pass=0;pass<hair.length;pass++) hair.forEach((bone,index)=>{
        if([...connected].some(other=>{
          const neighbour=hair[other];
          return [bone.start,bone.end].some(point=>[neighbour.start,neighbour.end].some(target=>
            Math.hypot(...point.map((value,axis)=>value-target[axis]))<bone.startRadius+neighbour.startRadius));
        })) connected.add(index);
      });
      expect(connected.size).toBe(hair.length);
    }
    expect(new Set(silhouettes).size).toBe(4);
  });
  it('enlarges eyes vertically while keeping their depth close to the cheek plane',()=>{
    for(const accessory of [undefined,'bun','tie','backpack']) {
      const bones=geometry(accessory);
      const whites=bones.filter(bone=>bone.startRadius===.065&&bone.color===COLORS.cream);
      const pupils=bones.filter(bone=>bone.startRadius===.04);
      expect(whites).toHaveLength(2);
      expect(pupils).toHaveLength(2);
      for(const eye of whites) {
        expect(eye.end[2]-eye.start[2]+2*eye.startRadius).toBeGreaterThan(.038*2);
        expect(eye.start[0]+eye.startRadius).toBeLessThan(.48);
      }
      expect(pupils[1].start[1]-pupils[0].start[1]).toBeCloseTo(.24);
    }
  });
  it('keeps all elder primitives byte-identical to eeeb18d at eight angles and five poses',()=>{
    const elder=content.characters.find(character=>character.appearance.accessory==='glasses')!;
    const hashes=[];
    const poses=[{carry:false,stance:.05},customerPose('ordered','glasses'),customerPose('served','glasses'),
      {carry:false,stance:Math.sin(.1*12)*.17},{carry:false,stance:Math.sin(.35*12)*.17}];
    for(const pose of poses) for(let direction=0;direction<8;direction++) {
      const bones:unknown[]=[];
      characterFigure(0,0,direction*Math.PI/4,pose,elder.appearance,(start,end,startRadius,endRadius,colorOf)=>{
        bones.push({start,end,startRadius,endRadius,color:colorOf(start[2])});
      });
      hashes.push(createHash('sha256').update(JSON.stringify(bones)).digest('hex'));
    }
    expect(createHash('sha256').update(hashes.join('\n')).digest('hex')).toBe('824e30c925418d53769643f021066e081d42a8c185364fa448fa40722bd7ad21');
  });
});

describe('actual raster depth and walking',()=>{
  const renderHarness=()=>{
    let pixels=new Uint8ClampedArray();
    const canvas={getContext:()=>({
      createImageData:(width:number,height:number)=>({data:new Uint8ClampedArray(width*height*4)}),
      putImageData:(image:ImageData)=>{pixels=image.data.slice();},
    })} as unknown as HTMLCanvasElement;
    const renderer=createRenderer(canvas,[]);
    const state:GameState={seed:42,day:1,level:1,player:{x:6,y:6},customers:[],tray:[],served:0,earnings:0,mistakes:0,activeTable:null,feedback:'none',receipt:null,journal:{},ended:false};
    return (yaw:number,tray:string[]=[],time=0,moving=false)=>{
      renderer.draw({...state,tray},{...state.player,yaw},time,moving);
      return pixels;
    };
  };
  it('partially occludes rear-facing food with the body without hiding the whole tray',()=>{
    const render=renderHarness();
    const changedPixels=(yaw:number)=>{
      const empty=render(yaw),full=render(yaw,Array(6).fill('bun'));
      let count=0;
      for(let index=0;index<full.length;index+=4) {
        if(full[index]!==empty[index]||full[index+1]!==empty[index+1]||full[index+2]!==empty[index+2]) count++;
      }
      return count;
    };
    const front=changedPixels(Math.PI/4),rear=changedPixels(Math.PI*1.25);
    expect(front).toBeGreaterThan(30);
    expect(rear).toBeGreaterThan(0);
    expect(rear).toBeLessThan(front*.85);
    expect(render(Math.PI*1.25,['bun','bun'])).toEqual(render(Math.PI*1.25,['bun']));
    expect(render(Math.PI/4,['bun','bun'])).not.toEqual(render(Math.PI/4,['bun']));
  });
  it('walks deterministically from supplied time and freezes at reduced-motion inputs',()=>{
    const render=renderHarness();
    const feet=(image:Uint8ClampedArray)=>{
      const pixels=[];
      for(let row=150;row<180;row++) for(let column=165;column<200;column++) {
        const start=(row*WIDTH+column)*4;
        pixels.push(...image.subarray(start,start+4));
      }
      return pixels;
    };
    const first=render(Math.PI/2,[],.1,true);
    expect(feet(render(Math.PI/2,[],.35,true))).not.toEqual(feet(first));
    expect(render(Math.PI/2,[],.1,true)).toEqual(first);
    const still=render(Math.PI/2,[],0,false);
    render(Math.PI,Array(6).fill('bun'),1,true);
    expect(render(Math.PI/2,[],0,false)).toEqual(still);
  });
});

it('renders independently without DOM globals and reflects customer/tray state',()=>{
  const snapshots:Uint8ClampedArray[]=[];
  const canvas=()=>({getContext:()=>({
    createImageData:(w:number,h:number)=>({data:new Uint8ClampedArray(w*h*4)}),
    putImageData:(data:ImageData)=>snapshots.push(data.data.slice()),
  })}) as unknown as HTMLCanvasElement;
  const firstCanvas=canvas(), secondCanvas=canvas();
  const first=createRenderer(firstCanvas,TABLES),second=createRenderer(secondCanvas,TABLES);
  const state:GameState={seed:42,day:1,level:1,player:{x:6,y:6},customers:[
    {table:1,orderId:'one',phase:'ordered'}, {table:2,orderId:'two',phase:'checkout'},
  ],tray:[],served:0,earnings:0,mistakes:0,activeTable:null,feedback:'none',receipt:null,journal:{},ended:false};
  const player={...state.player,yaw:Math.PI/2};
  first.draw(state,player,0,false);
  second.draw(state,player,0,false);
  expect(firstCanvas.width).toBe(WIDTH); expect(firstCanvas.height).toBe(HEIGHT);
  expect(snapshots[0]).toEqual(snapshots[1]);
  first.draw({...state,tray:['bun'],customers:[{table:1,orderId:'one',phase:'served'}]},player,0,false);
  expect(snapshots[2]).not.toEqual(snapshots[0]);
  second.draw(state,player,0,false);
  expect(snapshots[3]).toEqual(snapshots[0]);
});
