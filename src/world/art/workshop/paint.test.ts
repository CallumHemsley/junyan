import { describe, expect, it } from 'vitest';
import { drawWorkshopProp } from './paint';
import { initialState, reduce, type Action, type Job, type State } from '../../../features/repairs/rules';
import type { RepairArtApi } from '../../../features/repairs/scene';
import { workshopDefinition } from '../../maps/workshop';

function appearance(job: Job, state: State) {
  const commands: unknown[]=[];
  const api:RepairArtApi={
    box:(...args)=>{commands.push(['box',...args]);},
    sphere:(...args)=>{commands.push(['sphere',...args]);},
    capsule:(a,b,r,s,color)=>{commands.push(['capsule',a,b,r,s,color(0)]);},
  };
  drawWorkshopProp(api,workshopDefinition.props.find(p=>p.kind===`${job}-bench`)!,{repairs:state,elapsedSeconds:0});
  return commands;
}
const actions:Record<Job,Action[]>={
  lamp:[{type:'select',job:'lamp',part:'bulb'},{type:'turn',job:'lamp',direction:'tighten'},{type:'test',job:'lamp'},{type:'return',job:'lamp'}],
  toy:[{type:'switch',job:'toy'},{type:'select',job:'toy',part:'cover'},{type:'cover',job:'toy',position:'open'},{type:'select',job:'toy',part:'lead'},{type:'lead',job:'toy',position:'connected'},{type:'select',job:'toy',part:'cell'},{type:'cell',job:'toy',condition:'fresh'},{type:'select',job:'toy',part:'cover'},{type:'cover',job:'toy',position:'closed'},{type:'test',job:'toy'},{type:'return',job:'toy'}],
};
describe('physical repair bench occupancy',()=>{
  for(const job of ['lamp','toy'] as const)it(`puts the ${job} back on its physical bench when repeating a completed repair`,()=>{
    const fresh=reduce(initialState(),{type:'switch',job},1);
    const returned=actions[job].reduce((state,action)=>reduce(state,action,1),fresh);
    expect(returned.completed).toContain(job);
    expect(returned.jobs[job]).toBeNull();
    const repeated=reduce(returned,{type:'start',job},1);
    expect(repeated.completed).toContain(job);
    expect(appearance(job,returned)).not.toEqual(appearance(job,fresh));
    expect(appearance(job,repeated)).toEqual(appearance(job,fresh));
  });
});
