import { z } from 'zod';
import type { Line, Word } from '../../contracts';
import data from './content.json';

import { createWordSchema, createPhraseSchema } from '../../content/schema';
import { adaptMandarinContent } from '../../content/mandarin';
import { language } from '../../language';
const audio = /^\/audio\/(?:repairs\/)?[a-z0-9-]+\.wav$/;
const wordSchema = createWordSchema(language).refine(word => /^(?:repairs\.)?[a-z][a-z0-9-]*$/.test(word.id) && audio.test(word.audio), 'Invalid repairs word ID or audio');
const phraseSchema = createPhraseSchema(language).refine(line => /^repairs\.[a-z][a-z0-9-]*$/.test(line.id) && audio.test(line.audio), 'Invalid repairs line ID or audio');
const schema = z.strictObject({ words: z.array(wordSchema), characters: z.array(z.strictObject({ id: z.enum(['lamp', 'toy']), name: z.string().min(1), voiceId: z.string().min(1), lines: z.array(phraseSchema) })) }).superRefine((value, ctx) => {
  const byId = new Map(value.words.map(word => [word.id, word]));
  const lines = value.characters.flatMap(character => character.lines);
  if (byId.size !== value.words.length || new Set(lines.map(line => line.id)).size !== lines.length) ctx.addIssue({ code: 'custom', message: 'Duplicate content IDs' });
  for (const line of lines) for (const word of line.tokens) {
    if (JSON.stringify(byId.get(word.id)) !== JSON.stringify(word)) ctx.addIssue({ code: 'custom', message: 'Line word differs from dictionary' });
  }
});
export const contentSchema = z.preprocess(adaptMandarinContent, schema);
export const content = contentSchema.parse(data);
export const words: Word[] = content.words;
export const lines: Line[] = content.characters.flatMap(character => character.lines);
export function lineFor(feedback: string): Line {
  return lines.find(line => line.id === `repairs.${feedback}`)!;
}
export function wordFor(id: string): Word {
  return words.find(word => word.id === id)!;
}

export function speakerFor(feedback: string) {
  return content.characters.find(character => character.lines.some(line => line.id === `repairs.${feedback}`))!;
}
