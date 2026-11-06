import type { Point, Rect, WorldMapDefinition } from "./schema";

export const PLAYER_RADIUS = .22;
export function contains(rect: Rect, p: Point): boolean {
  return p.x >= rect.x && p.y >= rect.y && p.x <= rect.x + rect.width && p.y <= rect.y + rect.height;
}
export function canStand(map: WorldMapDefinition, p: Point, radius = PLAYER_RADIUS): boolean {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < radius || p.y < radius || p.x > map.bounds.width-radius || p.y > map.bounds.height-radius) return false;
  const left=p.x-radius,right=p.x+radius,top=p.y-radius,bottom=p.y+radius;
  const cuts=[left,right,...map.walkable.flatMap(r=>[r.x,r.x+r.width]).filter(x=>x>left&&x<right)].sort((a,b)=>a-b);
  for(let i=1;i<cuts.length;i++) {
    if(cuts[i]===cuts[i-1])continue;
    const x=(cuts[i]+cuts[i-1])/2;
    const spans=map.walkable.filter(r=>x>=r.x&&x<=r.x+r.width).map(r=>[r.y,r.y+r.height]).sort((a,b)=>a[0]-b[0]);
    let covered=top;
    for(const [start,end] of spans){if(start>covered)break;if(end>covered)covered=end;if(covered>=bottom)break;}
    if(covered<bottom)return false;
  }
  return map.colliders.every(({rect}) => {
    const x = Math.max(rect.x, Math.min(p.x, rect.x+rect.width));
    const y = Math.max(rect.y, Math.min(p.y, rect.y+rect.height));
    return Math.hypot(p.x-x,p.y-y) > radius;
  });
}
export function canWalk(map: WorldMapDefinition, from: Point, to: Point): boolean {
  if(!canStand(map,from)||!canStand(map,to))return false;
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/.1));
  for(let i=0;i<=steps;i++) if(!canStand(map,{x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps})) return false;
  return true;
}
export function movePlayer(map: WorldMapDefinition, from: Point, delta: Point): Point {
  const length=Math.hypot(delta.x,delta.y), steps=Math.max(1,Math.ceil(length/.1));
  let p=from;
  for(let i=0;i<steps;i++) {
    const next={x:p.x+delta.x/steps,y:p.y+delta.y/steps};
    if(canWalk(map,p,next)) p=next;
    else {
      const x={x:next.x,y:p.y},y={x:p.x,y:next.y};
      if(canWalk(map,p,x)) p=x;
      else if(canWalk(map,p,y)) p=y;
    }
  }
  return p;
}
export function findPath(map: WorldMapDefinition, from: Point, to: Point): Point[] {
  if(!canStand(map,from)||!canStand(map,to)) return [];
  if(canWalk(map,from,to)) return [to];
  const key=(p:Point)=>`${p.x},${p.y}`;
  const connect=(p:Point)=>{
    const found:Point[]=[];
    for(let x=Math.floor(p.x*2)/2-.5;x<=Math.ceil(p.x*2)/2+.5;x+=.5)
      for(let y=Math.floor(p.y*2)/2-.5;y<=Math.ceil(p.y*2)/2+.5;y+=.5)
        if(canWalk(map,p,{x,y})) found.push({x,y});
    return found;
  };
  const starts=connect(from),ends=new Set(connect(to).map(key));
  const parents=new Map<string,Point|null>(starts.map(p=>[key(p),null]));
  const costs=new Map<string,number>();
  type Node={p:Point;cost:number;score:number};
  const heap:Node[]=[];
  const push=(node:Node)=>{let i=heap.length;heap.push(node);while(i>0){const parent=(i-1)>>1;if(heap[parent].score<=node.score)break;heap[i]=heap[parent];i=parent;}heap[i]=node;};
  const pop=()=>{const root=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].score<heap[child].score)child++;if(heap[child].score>=last.score)break;heap[i]=heap[child];i=child;}heap[i]=last;}return root;};
  for(const p of starts){const cost=Math.hypot(p.x-from.x,p.y-from.y);costs.set(key(p),cost);push({p,cost,score:cost+Math.hypot(p.x-to.x,p.y-to.y)});}
  for(let expanded=0;heap.length&&expanded<100000;expanded++) {
    const node=pop(),p=node.p;
    if(node.cost!==costs.get(key(p)))continue;
    if(ends.has(key(p))) {
      const path:Point[]=[to]; let current:Point|null=p;
      while(current) {path.unshift(current);current=parents.get(key(current))??null;}
      const smooth:Point[]=[];let previous=from;
      for(let n=0;n<path.length;n++) if(n===path.length-1 || !canWalk(map,previous,path[n+1])) {smooth.push(path[n]);previous=path[n];}
      return smooth;
    }
    for(const [dx,dy] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]) {
      const n={x:p.x+dx,y:p.y+dy},id=key(n),cost=node.cost+.5;
      if(cost>=(costs.get(id)??Infinity)||!cachedEdge(map,p,n))continue;
      parents.set(id,p);costs.set(id,cost);push({p:n,cost,score:cost+Math.hypot(n.x-to.x,n.y-to.y)});
    }
  }
  return [];
}
export function nearbyAnchors(map:WorldMapDefinition,p:Point) {
  return map.anchors.filter(a=>Math.hypot(a.position.x-p.x,a.position.y-p.y)<=a.radius).sort((a,b)=>Math.hypot(a.position.x-p.x,a.position.y-p.y)-Math.hypot(b.position.x-p.x,b.position.y-p.y));
}

const edges=new WeakMap<WorldMapDefinition,Map<string,boolean>>();
function cachedEdge(map:WorldMapDefinition,a:Point,b:Point) {
 let cache=edges.get(map);if(!cache){cache=new Map();edges.set(map,cache);}
 const ak=`${a.x},${a.y}`,bk=`${b.x},${b.y}`,key=ak<bk?`${ak}:${bk}`:`${bk}:${ak}`;
 const known=cache.get(key);if(known!==undefined)return known;
 const result=canWalk(map,a,b);cache.set(key,result);return result;
}
