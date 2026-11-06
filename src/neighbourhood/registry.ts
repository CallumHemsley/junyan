import { content as restaurantContent } from "../content";
import * as apartment from "../features/apartment/content";
import * as cats from "../features/cats/content";
import * as repairs from "../features/repairs/content";
import * as garden from "../features/garden/content";
import { attachFeatureContent } from "./content";
import { validateCatalog } from "../progression/model";

export const featureContent = {
  apartment: { words: apartment.words, lines: apartment.lines },
  cats: { words: cats.words, lines: cats.lines },
  repairs: { words: repairs.words, lines: repairs.lines },
  garden: { words: garden.words, lines: garden.lines },
  "reading-room": { words: [], lines: [] },
};
export const content = attachFeatureContent(restaurantContent, featureContent);
validateCatalog(content);
