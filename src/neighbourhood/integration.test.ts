import { describe, expect, it } from "vitest";
import { content, featureContent } from "./registry";
import { content as restaurantContent } from "../content";
import { contentWords } from "../content/words";
import { attachFeatureContent } from "./content";
import { mandarin } from "../language";
import { createNeighbourhood, availableGifts } from "./model";
import { reduceNeighbourhoodGame, type NeighbourhoodAction } from "./transitions";
import { KITCHEN, TABLES, type Content, type GameState } from "../contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "../game";
import { validateSavedGame } from "../save";
import { createSession, reduceSession } from "../opening";
import { startSession } from "../startup";
import type { Action as CatsAction } from "../features/cats/rules";
import type { Action as RepairAction } from "../features/repairs/rules";
import { nextDots } from "../recovery";


const act = (game: GameState, action: NeighbourhoodAction) => reduceNeighbourhoodGame(game, action, content);
const visit = (game: GameState, location: NonNullable<GameState["neighbourhood"]>["location"]) => act(game, { type: "visit-location", location });
const reload = (game: GameState) => validateSavedGame(JSON.parse(JSON.stringify(game)), content)!;
function reunion(game: GameState) {
  game = visit(game, "cats");
  const actions: CatsAction[] = [{type:"select",target:"white"},{type:"crouch"},{type:"wait"},{type:"approach"},{type:"follow"},{type:"reunite"}];
  for (const action of actions) game = act(game, {type:"feature-action",feature:"cats",action,now:10});
  return game;
}
function repairBoth(game: GameState) {
  game = visit(game, "repairs");
  const actions: RepairAction[] = [
    {type:"select",job:"lamp",part:"bulb"},{type:"turn",job:"lamp",direction:"tighten"},{type:"test",job:"lamp"},{type:"return",job:"lamp"},
    {type:"switch",job:"toy"},{type:"select",job:"toy",part:"cover"},{type:"cover",job:"toy",position:"open"},
    {type:"select",job:"toy",part:"lead"},{type:"lead",job:"toy",position:"connected"},{type:"select",job:"toy",part:"cell"},
    {type:"cell",job:"toy",condition:"fresh"},{type:"select",job:"toy",part:"cover"},{type:"cover",job:"toy",position:"closed"},
    {type:"test",job:"toy"},{type:"return",job:"toy"},
  ];
  for (const action of actions) game = act(game, {type:"feature-action",feature:"repairs",action,now:11});
  return game;
}
function finishDay(game: GameState) {
  game = visit(game, "restaurant");
  for (const table of TABLES) {
    const order = getOrder(game, table.table, content)!;
    const position = {x:table.x,y:table.y-1.5};
    game = reduceGame(game,{type:"move",position},content);
    game = reduceGame(game,{type:"interact",table:table.table},content);
    game = reduceGame(game,{type:"move",position:KITCHEN},content);
    for (const item of order.items) for(let n=0;n<item.quantity;n++) game=reduceGame(game,{type:"pickup",foodId:item.foodId},content);
    game=reduceGame(game,{type:"move",position},content);
    game=reduceGame(game,{type:"deliver",table:table.table,now:20},content);
    game=reduceGame(game,{type:"pay",table:table.table,change:order.paid-orderTotal(order,content)},content);
  }
  expect(game.ended).toBe(true);
  return game;
}

describe("saved neighbourhood integration", () => {
  it("keeps mandatory opening and preserves the restaurant through every optional visit", () => {
    const opening=createSession(content,42,"opening");
    expect(reduceSession(opening,{type:"visit-location",location:"cats"},content)).toBe(opening);
    const start=createGame(content);
    let game=start;
    for(const location of ["apartment","cats","repairs","garden","restaurant"] as const) {
      game=visit(game,location);
      const {neighbourhood,...restaurant}=game;
      const {neighbourhood:initial,...original}=start;
      expect(restaurant).toEqual(original);
      expect(neighbourhood?.location).toBe(location);
      expect(neighbourhood?.apartment).toBe(initial?.apartment);
    }
  });

  it("initializes old v1 saves without replaying the opening or losing progress", () => {
    const game=createGame(content);
    const {neighbourhood,...legacy}=game;
    const saved=validateSavedGame(legacy,content)!;
    expect(saved).toEqual({...legacy,neighbourhood:createNeighbourhood(1)});
    expect(startSession({checkpoint:null,saved,failed:false},content,42).session.phase).toBe("day");
    expect(neighbourhood).toEqual(saved.neighbourhood);
  });

  it("validates real feature payloads independently and restores claimed apartment gifts", () => {
    let game=repairBoth(reunion(createGame(content)));
    for(const giftId of ["repairs.stool","cats.cushion"] as const) game=act(game,{type:"claim-neighbourhood-gift",giftId});
    const saved=validateSavedGame({...game,neighbourhood:{...game.neighbourhood,apartment:null}},content)!;
    expect(saved.neighbourhood?.apartment.owned).toEqual(["bed","repairs.stool","cats.cushion"]);
    expect(saved.neighbourhood?.cats).toEqual(game.neighbourhood?.cats);
    expect(saved.neighbourhood?.repairs).toEqual(game.neighbourhood?.repairs);
    expect(saved.journal).toEqual(game.journal);
    expect(reload(saved)).toEqual(saved);
  });

  it("rejects future feature day anchors without discarding restaurant or sibling progress", () => {
    const game=reunion(createGame(content));
    const raw={...game,neighbourhood:{...game.neighbourhood,garden:{...game.neighbourhood!.garden,day:100}}};
    const restored=validateSavedGame(raw,content)!;
    expect(restored.neighbourhood?.garden).toEqual(createNeighbourhood(1).garden);
    expect(restored.neighbourhood?.cats).toEqual(game.neighbourhood?.cats);
    expect(restored.day).toBe(1);
  });

  it("keeps the restaurant clock and player still while a feature is active", () => {
    const game=visit(finishDay(createGame(content)),"garden");
    expect(reduceGame(game,{type:"next-day"},content)).toBe(game);
    expect(reduceGame(game,{type:"move",position:{x:1,y:1}},content)).toBe(game);
    expect(act(game,{type:"feature-action",feature:"apartment",action:{type:"accept-starter"},now:1})).toBe(game);
  });

  it("recovers related words atomically for a successful action, never a rejected placement", () => {
    let game=visit(createGame(content),"apartment");
    game=act(game,{type:"feature-action",feature:"apartment",action:{type:"accept-starter"},now:1});
    game=act(game,{type:"feature-action",feature:"apartment",action:{type:"select",id:"table"},now:2});
    const rejected=act(game,{type:"feature-action",feature:"apartment",action:{type:"place",x:0,y:0},now:3});
    expect(rejected.journal).toBe(game.journal);
    const placed=act(rejected,{type:"feature-action",feature:"apartment",action:{type:"place",x:2,y:1},now:4});
    expect(placed.journal["apartment.put"]).toMatchObject({recovered:true,lookups:0,lastSeen:4});
    expect(reload(placed)).toEqual(placed);
    expect(placed.neighbourhood?.apartment.placements.some(item=>item.id==="table")).toBe(true);
  });

  it("derives markers from actual learning and retains them through lookup or rejected actions", () => {
    const start=visit(createGame(content),"apartment");
    const action: NeighbourhoodAction={type:"feature-action",feature:"apartment",action:{type:"accept-starter"},now:1};
    const learned=act(start,action);
    const dots=nextDots([],start,action,learned);
    expect(dots).toEqual(["table","apartment.chair"]);
    const select: NeighbourhoodAction={type:"feature-action",feature:"apartment",action:{type:"select",id:"table"},now:2};
    const selected=act(learned,select);
    expect(nextDots(dots,learned,select,selected)).toBe(dots);
    const invalid: NeighbourhoodAction={type:"feature-action",feature:"apartment",action:{type:"place",x:0,y:0},now:3};
    const rejected=act(selected,invalid);
    expect(nextDots(dots,selected,invalid,rejected)).toBe(dots);
  });

  it("keeps lookup separate from successful-use recovery", () => {
    const game=visit(createGame(content),"apartment");
    const looked=reduceSession({phase:"day",game},{type:"lookup",wordId:"apartment.put",now:2},content);
    expect(looked.phase).toBe("day");
    if(looked.phase==="day") expect(looked.game.journal["apartment.put"]).toMatchObject({recovered:false,lookups:1});
  });

  it("claims optional rewards only when earned and retains them after reload and undo", () => {
    const start=createGame(content);
    expect(act(start,{type:"claim-neighbourhood-gift",giftId:"repairs.stool"})).toBe(start);
    const earned=repairBoth(reunion(start));
    expect(availableGifts(earned.neighbourhood!)).toEqual(["repairs.stool","cats.cushion"]);
    let home=visit(earned,"apartment");
    for(const action of [{type:"accept-starter"},{type:"select",id:"table"},{type:"place",x:2,y:1},{type:"select",id:"table"},{type:"place",x:3,y:2}] as const) {
      home=act(home,{type:"feature-action",feature:"apartment",action,now:12});
    }
    let claimed=act(home,{type:"claim-neighbourhood-gift",giftId:"cats.cushion"});
    claimed=reload(claimed);
    expect(act(claimed,{type:"claim-neighbourhood-gift",giftId:"cats.cushion"})).toBe(claimed);
    const undone=act(claimed,{type:"feature-action",feature:"apartment",action:{type:"undo"},now:13});
    expect(undone.neighbourhood?.apartment.placements.find(item=>item.id==="table")).toMatchObject({x:2,y:1});
    expect(undone.neighbourhood?.claimedGiftIds).toEqual(["cats.cushion"]);
    expect(undone.journal).toBe(claimed.journal);
    expect(reload(undone)).toEqual(undone);
    expect(undone.neighbourhood?.apartment.owned.filter(id=>id==="cats.cushion")).toHaveLength(1);
    expect(act(visit(start,"apartment"),{type:"feature-action",feature:"apartment",action:{type:"receive-gift",giftId:"cats.cushion"},now:1}).neighbourhood?.apartment.owned).toEqual(["bed"]);
  });

  it("advances the garden only with the completed restaurant day and preserves every feature", () => {
    let game=repairBoth(reunion(createGame(content)));
    game=act(game,{type:"claim-neighbourhood-gift",giftId:"repairs.stool"});
    game=visit(game,"apartment");
    game=act(game,{type:"feature-action",feature:"apartment",action:{type:"accept-starter"},now:1});
    game=visit(game,"garden");
    game=act(game,{type:"feature-action",feature:"garden",action:{type:"tidy",value:true},now:1});
    for(const plant of ["climber","tree"] as const) game=act(game,{type:"feature-action",feature:"garden",action:{type:"water",plant},now:2});
    const completed=finishDay(game);
    const next=reduceGame(completed,{type:"next-day"},content);
    expect(next.day).toBe(2);
    expect(next.earnings).toBe(completed.earnings);
    expect(next.journal).toEqual(completed.journal);
    expect(next.neighbourhood?.cats).toEqual(completed.neighbourhood?.cats);
    expect(next.neighbourhood?.apartment).toEqual(completed.neighbourhood?.apartment);
    expect(next.neighbourhood?.repairs).toEqual(completed.neighbourhood?.repairs);
    expect(next.neighbourhood?.claimedGiftIds).toEqual(["repairs.stool"]);
    expect(next.neighbourhood?.garden.day).toBe(2);
    expect(Object.values(next.neighbourhood!.garden.plants).every(plant=>plant.growth===1)).toBe(true);
    expect(availableGifts(next.neighbourhood!)).toContain("garden.planter");
    expect(reload(next)).toEqual(next);
    expect(reduceGame(next,{type:"next-day"},content)).toBe(next);
  });
});

it('keeps recovery, gifts and saved progress when the same IDs carry another language', () => {
  const translatedWords = new Map(contentWords(content).map(word => [word.id, {
    id: word.id, text: `mot ${word.id}`, gloss: word.gloss, audio: word.audio,
  }]));
  const translate = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(translate);
    if (!value || typeof value !== 'object') return value;
    if ('gloss' in value && 'id' in value && typeof value.id === 'string') return translatedWords.get(value.id);
    const result = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, translate(child)]));
    if ('tokens' in result && Array.isArray(result.tokens)) result.text = `${result.tokens.map(word => word.text).join(' ')}.`;
    return result;
  };
  const alternative = attachFeatureContent(translate(restaurantContent) as Content, translate(featureContent) as typeof featureContent, {
    ...mandarin, id: 'fr', locale: 'fr', tokenSeparator: ' ', wordPattern: /^[a-z0-9. -]+$/,
    speechPattern: /^[a-z0-9. -]+$/, punctuationPattern: /[ .]/gu, pronunciationRequired: false, renderAuthoredText: true,
  });
  expect(contentWords(alternative).every(word => word.text.startsWith('mot ') && word.pronunciation === undefined)).toBe(true);
  const run = (pack: Content) => {
    let game = createGame(pack);
    const dispatch = (action: NeighbourhoodAction) => { game = reduceNeighbourhoodGame(game, action, pack); };
    dispatch({type: 'visit-location', location: 'apartment'});
    for (const action of [{type: 'accept-starter'}, {type: 'choose-colour', colour: 'cream'}, {type: 'select', id: 'table'}, {type: 'place', x: 2, y: 1}, {type: 'select', id: 'table'}, {type: 'store'}] as const) {
      dispatch({type: 'feature-action', feature: 'apartment', action, now: 12});
    }
    dispatch({type: 'visit-location', location: 'cats'});
    for (const action of [{type:'select',target:'white'}, {type:'crouch'}, {type:'wait'}, {type:'approach'}, {type:'follow'}, {type:'reunite'}] as const) {
      dispatch({type: 'feature-action', feature: 'cats', action, now: 13});
    }
    dispatch({type: 'claim-neighbourhood-gift', giftId: 'cats.cushion'});
    return game;
  };
  const original = run(content), translated = run(alternative);
  expect(translated).toEqual(original);
  expect(translated.journal['apartment.put'].recovered).toBe(true);
  expect(translated.journal['apartment.store'].recovered).toBe(true);
  expect(translated.neighbourhood?.apartment.owned).toContain('cats.cushion');
  expect(validateSavedGame(JSON.parse(JSON.stringify(translated)), alternative)).toEqual(translated);
});
