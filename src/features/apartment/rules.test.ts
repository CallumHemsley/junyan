import { describe, expect, it } from 'vitest';
import { initialState, reduce, validate, gifts, legal, type State, type Action } from './rules';
const run = (state: State, ...actions: Action[]) => actions.reduce((s,a) => reduce(s,a,1),state);
const starter = () => reduce(initialState(), {type:'accept-starter'},1);
const put = (state: State, id: 'table'|'chair'|'rug'|'cushion',x:number,y:number) => run(state,{type:'select',id},{type:'place',x,y});
describe('apartment editor', () => {
  it('delivers starter once and preserves a usable room', () => {
    const s=starter(); expect(s.owned).toHaveLength(5); expect(reduce(s,{type:'accept-starter'},1)).toBe(s); expect(validate(s)).toEqual(s);
  });
  it('rotates preview footprints and keeps saved furniture unchanged until confirmed', () => {
    const s=put(starter(),'table',3,2);
    const draft=run(s,{type:'select',id:'table'},{type:'rotate'},{type:'preview',x:4,y:2});
    expect(draft.placements).toEqual(s.placements); expect(legal(draft,{id:'table',...draft.draft!})).toBe(true);
    const moved=reduce(draft,{type:'place'},1); expect(moved.placements.find(p=>p.id==='table')).toEqual({id:'table',x:4,y:2,rotation:1});
  });
  it('rejects collisions, bounds and the protected path without losing the last valid placement', () => {
    const s=put(starter(),'table',2,1);
    for (const [x,y] of [[0,0],[5,2],[2,4],[-1,2],[4,3]]) {
      const before=run(s,{type:'select',id:'table'},{type:'rotate'});
      if(x===4 && y===3) expect(reduce(before,{type:'place',x,y},1).notice).toBe('blocked');
      else expect(reduce(before,{type:'place',x,y},1).placements).toEqual(s.placements);
    }
    expect(run(s,{type:'select',id:'table'},{type:'preview',x:0,y:0},{type:'cancel'}).placements).toEqual(s.placements);
  });
  it('layers rugs beneath furniture while preventing furniture collisions', () => {
    const s=put(put(starter(),'rug',2,1),'table',2,1);
    expect(s.placements).toHaveLength(3); expect(validate(s)).toEqual(s);
    expect(put(s,'chair',2,1).notice).toBe('blocked');
  });
  it('stores without consumption and undoes a move while keeping gifts through reload', () => {
    const s=put(starter(),'table',2,1);
    const moved=put(s,'table',3,2);
    const gifted=reduce(moved,{type:'receive-gift',giftId:'repairs.stool'},1);
    const undone=reduce(gifted,{type:'undo'},1);
    expect(undone.placements).toEqual(s.placements); expect(gifts(undone)).toEqual(['repairs.stool']);
    expect(validate(JSON.parse(JSON.stringify(undone)))).toEqual(undone);
    const stored=run(s,{type:'select',id:'table'},{type:'store'});
    expect(stored.owned).toContain('table'); expect(stored.placements).toHaveLength(1); expect(reduce(stored,{type:'undo'},1).placements).toEqual(s.placements);
  });
  it('swaps colours and rug sizes with undo without restoring claim history', () => {
    const s=starter(); const blue=reduce(s,{type:'choose-colour',colour:'cream'},1);
    const gifted=reduce(blue,{type:'claim-gift'},1); const undone=reduce(gifted,{type:'undo'},1);
    expect(undone.colour).toBe('blue'); expect(undone.lastGiftDay).toBe(1); expect(undone.owned).toContain('vase');
    expect(reduce(s,{type:'choose-rug',size:'large'},1).rugSize).toBe('large');
  });
  it('offers bounded daily finds once per day and permanent gifts once', () => {
    let s=starter(); for(let day=1;day<=4;day++) { s=reduce(s,{type:'claim-gift'},day); expect(reduce(s,{type:'claim-gift'},day)).toBe(s); }
    expect(s.owned).toEqual(['bed','table','chair','rug','cushion','vase','basket','lamp']);
    const gift=reduce(s,{type:'receive-gift',giftId:'cats.cushion'},4); expect(reduce(gift,{type:'receive-gift',giftId:'cats.cushion'},4)).toBe(gift);
  });
  it('rejects malformed saves, duplicate ownership, collisions and corrupt undo', () => {
    const s=starter(); for(const value of [null,{}, {...s,owned:[...s.owned,'chair']}, {...s,placements:[...s.placements,{id:'table',x:0,y:0,rotation:0}]}, {...s,selected:'chair'}, {...s,undo:{placements:[],colour:'blue',rugSize:'small'}}, {...s,lastGiftDay:-1}]) expect(validate(value)).toBeNull();
  });
});
it('describes the visible isometric chair position and stays neutral when aligned', () => {
  const table=put(starter(),'table',2,1);
  expect(put(table,'chair',3,3).notice).toBe('left');
  expect(put(table,'chair',4,1).notice).toBe('right');
  expect(put(table,'chair',3,2).notice).toBe('okay');
  const rotated=run(table,{type:'select',id:'table'},{type:'rotate'},{type:'place'});
  expect(put(rotated,'chair',3,2).notice).toBe('okay');
});
it('rejects partial starter inventories and inconsistent daily acquisition history', () => {
  expect(validate({...initialState(),owned:['bed','table']})).toBeNull();
  expect(validate({...starter(),owned:[...starter().owned,'vase']})).toBeNull();
});
