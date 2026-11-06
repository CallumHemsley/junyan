import type {GameState} from "../contracts";
import {restaurantPresence as presenceFor,restoreLife} from "./life";
export function restaurantPresence(game:GameState) {
 return presenceFor(game,restoreLife(game.world?.life)).tables;
}
