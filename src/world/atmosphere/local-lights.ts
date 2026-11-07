import type {AtmosphereHooks,Point} from './index';
import type {AtmosphereMap} from './map-hooks';

type Fixture=AtmosphereMap['props'][number];
const quad=(x:number,y:number,width:number,height:number,z:number):Point[]=>[
  {x,y,z},{x:x+width,y,z},{x:x+width,y:y+height,z},{x,y:y+height,z},
];
function taskLamp(prop:Fixture,props:AtmosphereMap['props']):NonNullable<AtmosphereHooks['lights']>[number] {
  const {x,y}=prop.position;
  // The art owner places tabletop props after their host bench, not at prop centre depth.
  const host=props.find(p=>p.id!==prop.id&&/bench|shelf/.test(p.kind)&&x>=p.position.x&&x<=p.position.x+p.width&&y>=p.position.y&&y<=p.position.y+p.height);
  const depth=host?host.position.x+host.position.y+(host.width+host.height)/2+.02:x+y+(prop.width+prop.height)/2+.02;
  return {
    id:prop.id,depth,kind:'lamp',position:{x:x-.15,y:y+.25,z:2.5},radius:1.8,
    emitter:quad(x-.30,y+.09,.28,.30,2.505),
    pool:quad(x-1.55,y-.03,2.05,1.02,1.675),
  };
}
function courtyardWindow(prop:Fixture):NonNullable<AtmosphereHooks['lights']>[number] {
  const {x,y}=prop.position,left=x+.14,right=x+prop.width-.14,front=y+.265;
  return {
    id:prop.id,depth:prop.position.x+prop.position.y+(prop.width+prop.height)/2+.02,kind:'window',position:{x:(left+right)/2,y:front,z:1.45},radius:2.2,
    emitter:[{x:left,y:front,z:1.45},{x:right,y:front,z:1.45},{x:right,y:front,z:2.63},{x:left,y:front,z:2.63}],
    pool:[{x:left-.15,y:front+.22,z:.025},{x:right+.15,y:front+.22,z:.025},{x:right+.65,y:front+2.05,z:.025},{x:left-.65,y:front+2.05,z:.025}],
  };
}

function apartmentFixtures(map:AtmosphereMap):NonNullable<AtmosphereHooks['lights']> {
  return map.props.flatMap(prop=>{
    const {x,y}=prop.position,depth=x+y+(prop.width+prop.height)/2+.02;
    if(prop.id==='apartment.reading-lamp'&&prop.kind==='lamp')return [{
      id:prop.id,kind:'lamp' as const,position:{x:x+prop.width/2,y:y+prop.height/2,z:1.83},radius:8,color:[255,216,150] as const,depth,
      // Aperture is the real lower opening of the 144 lamp shade, not its stem or prop origin.
      emitter:quad(x+.12,y+.12,prop.width-.24,prop.height-.24,1.835),pool:[],
    }];
    if(!['apartment.window-one','apartment.window-two','apartment.kitchen-window'].includes(prop.id)||prop.kind!=='window')return [];
    const front=y+prop.height+.075;
    const windows:NonNullable<AtmosphereHooks['lights']>[number][]=[];
    for(let at=.28,column=0;at<prop.width-.3;at+=1.1,column++)for(const [bottom,top] of [[1.18,2.13],[2.25,3.28]]) {
      const left=x+at,right=Math.min(x+at+.78,x+prop.width-.28);
      if(right<=left)continue;
      windows.push({id:`${prop.id}.pane-${column}-${bottom}`,kind:'window',position:{x:(left+right)/2,y:front,z:(bottom+top)/2},radius:4.5,color:[92,117,146],depth,
        emitter:[{x:left,y:front,z:bottom},{x:right,y:front,z:bottom},{x:right,y:front,z:top},{x:left,y:front,z:top}],pool:[]});
    }
    return windows;
  });
}

/** Bind only existing fixtures. Missing or changed fixture kinds emit no guessed light. */
export function authoredLocalLights(map:AtmosphereMap):AtmosphereHooks {
  const fixture=(id:string,kind:string)=>map.props.find(p=>p.id===id&&p.kind===kind);
  if(map.id==='apartment')return {lights:apartmentFixtures(map),ambientByPhase:{morning:[.92,.89,.83],noon:[.92,.89,.83],evening:[.70,.72,.79],night:[.52,.57,.68]}};
  if(map.id==='workshop') {
    const lamps=['workshop.desk-lamp','workshop.toy-lamp'].flatMap(id=>{
      const prop=fixture(id,'lamp');return prop?[taskLamp(prop,map.props)]:[];
    });
    return {lights:lamps,ambientByPhase:{morning:[.95,.96,.92],noon:[1,.99,.94],evening:[.64,.71,.84],night:[.49,.57,.72]}};
  }
  if(map.id==='courtyard') {
    return {lights:['courtyard.window-blue','courtyard.window-kitchen'].flatMap(id=>{
      const prop=fixture(id,'window');return prop?[courtyardWindow(prop)]:[];
    })};
  }
  if(map.id==='rooftop') {
    const prop=fixture('rooftop.stairhead','stairhead');
    if(!prop)return {lights:[]};
    const x=prop.position.x+prop.width+.025,y=prop.position.y+2.85;
    return {lights:[{id:'rooftop.stairhead-aperture',depth:prop.position.x+prop.position.y+(prop.width+prop.height)/2+.02,kind:'window',position:{x,y:y+1.05,z:1.6},radius:2.1,
      emitter:[{x,y,z:1.9},{x,y:y+2.05,z:1.9},{x,y:y+2.05,z:2.6},{x,y,z:2.6}],
      pool:[{x:x+.10,y:y-.10,z:.025},{x:x+2.6,y:y-.75,z:.025},{x:x+2.6,y:y+2.7,z:.025},{x:x+.10,y:y+2.2,z:.025}],
    }]};
  }
  return {};
}
