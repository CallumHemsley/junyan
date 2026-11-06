import { z } from 'zod';
import type { Word, Line } from '../../contracts';
import data from './content.json' with { type: 'json' };
import { createWordSchema, createPhraseSchema } from '../../content/schema';
import { adaptMandarinContent } from '../../content/mandarin';
import { language } from '../../language';
const audio = /^\/audio\/(?:apartment\/)?[a-z0-9-]+\.(?:wav|m4a)$/;
const word = createWordSchema(language).refine(word => /^(?:apartment\.)?[a-z][a-z0-9-]*$/.test(word.id) && audio.test(word.audio), 'Invalid apartment word ID or audio');
const phrase = createPhraseSchema(language).refine(line => /^apartment\.[a-z-]+$/.test(line.id) && audio.test(line.audio), 'Invalid apartment line ID or audio');
const schema = z.strictObject({ words: z.array(word), lines: z.array(phrase) }).superRefine((value, ctx) => {
  const words = new Map(value.words.map(w => [w.id, w]));
  if (words.size !== value.words.length || new Set(value.lines.map(l => l.id)).size !== value.lines.length) ctx.addIssue({ code: 'custom', message: 'Duplicate content IDs' });
  value.lines.forEach((line, i) => {
    line.tokens.forEach(token => { if (JSON.stringify(words.get(token.id)) !== JSON.stringify(token)) ctx.addIssue({ code: 'custom', message: 'Noncanonical token', path: ['lines', i] }); });
  });
});
export const contentSchema = z.preprocess(adaptMandarinContent, schema);
const parsed = contentSchema.parse(data);
export const words: Word[] = parsed.words;
export const lines: Line[] = parsed.lines;
export const lineById = Object.fromEntries(lines.map(line => [line.id.slice('apartment.'.length), line]));
