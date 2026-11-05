import { describe, expect, it } from "vitest";
import { content } from "./registry";
import { createNeighbourhood, availableGifts } from "./model";
import { reduceNeighbourhoodGame, type NeighbourhoodAction } from "./transitions";
import { KITCHEN, TABLES, type GameState } from "../contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "../game";
import { validateSavedGame } from "../save";
import { createSession, reduceSession } from "../opening";
import { startSession } from "../startup";
import type { Action as CatsAction } from "../features/cats/rules";
import type { Action as RepairAction } from "../features/repairs/rules";
import { wordByHanzi } from "../features/apartment/content";

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
    expect(placed.journal[wordByHanzi["放"].id]).toMatchObject({recovered:true,lookups:0,lastSeen:4});
    expect(reload(placed)).toEqual(placed);
    expect(placed.neighbourhood?.apartment.placements.some(item=>item.id==="table")).toBe(true);
  });

  it("keeps lookup separate from successful-use recovery", () => {
    const game=visit(createGame(content),"apartment");
    const looked=reduceSession({phase:"day",game},{type:"lookup",wordId:wordByHanzi["放"].id,now:2},content);
    expect(looked.phase).toBe("day");
    if(looked.phase==="day") expect(looked.game.journal[wordByHanzi["放"].id]).toMatchObject({recovered:false,lookups:1});
  });

  it("claims optional rewards only when earned and retains them after reload and undo", () => {
    const start=createGame(content);
    expect(act(start,{type:"claim-neighbourhood-gift",giftId:"repairs.stool"})).toBe(start);
    const earned=repairBoth(reunion(start));
    expect(availableGifts(earned.neighbourhood!)).toEqual(["repairs.stool","cats.cushion"]);
    let claimed=act(earned,{type:"claim-neighbourhood-gift",giftId:"cats.cushion"});
    claimed=reload(claimed);
    expect(act(claimed,{type:"claim-neighbourhood-gift",giftId:"cats.cushion"})).toBe(claimed);
    expect(claimed.neighbourhood?.apartment.owned.filter(id=>id==="cats.cushion")).toHaveLength(1);
    expect(act(visit(start,"apartment"),{type:"feature-action",feature:"apartment",action:{type:"receive-gift",giftId:"cats.cushion"},now:1}).neighbourhood?.apartment.owned).toEqual(["bed"]);
  });

  it("advances the garden only with the completed restaurant day and preserves every feature", () => {
    let game=visit(reunion(createGame(content)),"garden");
    game=act(game,{type:"feature-action",feature:"garden",action:{type:"tidy",value:true},now:1});
    for(const plant of ["climber","tree"] as const) game=act(game,{type:"feature-action",feature:"garden",action:{type:"water",plant},now:2});
    const completed=finishDay(game);
    const next=reduceGame(completed,{type:"next-day"},content);
    expect(next.day).toBe(2);
    expect(next.earnings).toBe(completed.earnings);
    expect(next.journal).toEqual(completed.journal);
    expect(next.neighbourhood?.cats).toEqual(completed.neighbourhood?.cats);
    expect(next.neighbourhood?.garden.day).toBe(2);
    expect(Object.values(next.neighbourhood!.garden.plants).every(plant=>plant.growth===1)).toBe(true);
    expect(availableGifts(next.neighbourhood!)).toContain("garden.planter");
    expect(reload(next)).toEqual(next);
    expect(reduceGame(next,{type:"next-day"},content)).toBe(next);
  });
});
