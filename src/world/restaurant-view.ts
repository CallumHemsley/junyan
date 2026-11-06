import {projectRestaurant} from "./art/restaurant";
import {restaurantPresence} from "./presence";
import {content} from "../content";
import type {GameState} from "../contracts";
import type {WorldMapDefinition} from "./schema";
export function restaurantPresentation(game:GameState,map:WorldMapDefinition) {
 const projection=projectRestaurant(game,content,map),present=new Set(restaurantPresence(game).filter(p=>p.inside).map(p=>p.table));
 return {...projection,customers:projection.customers.filter(customer=>present.has(customer.table))};
}
