import { z } from 'zod';
import type { Line, Word } from '../../contracts';
import data from './content.json';
import { content as sharedContent } from '../../content';
import { contentWords } from '../../content/words';
import { createWordSchema, createPhraseSchema } from '../../content/schema';
import { adaptMandarinContent } from '../../content/mandarin';
import { language } from '../../language';

const canonical = new Map(contentWords(sharedContent).map(word => [word.id, word]));
const schema = z.strictObject({
  words: z.array(createWordSchema(language).refine(word => /^(?:cats\.)?[a-z][a-z0-9-]*$/.test(word.id) && /^\/audio\/(?:cats\/)?[a-z0-9-]+\.(?:wav|m4a)$/.test(word.audio), 'Invalid cats word ID or audio')),
  lines: z.array(createPhraseSchema(language).refine(line => /^cats\.[a-z][a-z0-9-]*$/.test(line.id) && /^\/audio\/cats\/[a-z0-9-]+\.(?:wav|m4a)$/.test(line.audio), 'Invalid cats line ID or audio')),
}).superRefine((value, ctx) => {
  const vocabulary = new Map(value.words.map(word => [word.id, word]));
  if (vocabulary.size !== value.words.length || new Set(value.lines.map(line => line.id)).size !== value.lines.length)
    ctx.addIssue({ code: 'custom', message: 'Duplicate content ID' });
  value.words.forEach(word => {
    if (word.id.startsWith('cats.') && !word.audio.startsWith('/audio/cats/'))
      ctx.addIssue({ code: 'custom', message: 'Feature words need feature-owned audio' });
    if (!word.id.startsWith('cats.') && JSON.stringify(canonical.get(word.id)) !== JSON.stringify(word))
      ctx.addIssue({ code: 'custom', message: 'Shared word must match canonical content' });
  });
  value.lines.forEach((line, index) => {
    for (const word of line.tokens) {
      if (JSON.stringify(vocabulary.get(word.id)) !== JSON.stringify(word))
        ctx.addIssue({ code: 'custom', message: 'Noncanonical word', path: ['lines', index] });
    }
  });
});
export const contentSchema = z.preprocess(adaptMandarinContent, schema);
export const content = contentSchema.parse(data);
export const words: Word[] = content.words;
export const lines: Line[] = content.lines;
export function lineFor(key: string): Line & { text: string } {
  const line = content.lines.find(line => line.id === `cats.${key}`);
  if (!line) throw new Error(`Unknown cats line: ${key}`);
  return line;
}
