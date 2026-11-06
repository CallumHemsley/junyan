import type { Character, Content } from '../contracts';
import { mandarin } from '../language';
import data from './content.json' with { type: 'json' };
import { adaptMandarinContent } from './mandarin';
import { createContentSchema } from './schema';
import { voices } from './voices';

export { voices, voicesSchema } from './voices';
export const contentSchema = createContentSchema(mandarin, voices);
export const content: Content = contentSchema.parse(adaptMandarinContent({ ...data, language: mandarin.id }));

export function characterFor(customer: string): Character {
  return content.characters.find(character => character.name === customer)!;
}
