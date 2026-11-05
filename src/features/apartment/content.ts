import { z } from 'zod';
import type { Word, Line } from '../../contracts';
import data from './content.json';
const audio = z.string().regex(/^\/audio\/(?:apartment\/)?[a-z0-9-]+\.(?:wav|m4a)$/);
const word = z.strictObject({ id: z.string().regex(/^(?:apartment\.)?[a-z][a-z0-9-]*$/), hanzi: z.string().regex(/^[\p{Script=Han}]+$/u), pinyin: z.string().min(1), gloss: z.string().min(1), audio });
export const contentSchema = z.strictObject({ words: z.array(word), lines: z.array(z.strictObject({ id: z.string().regex(/^apartment\.[a-z-]+$/), tokens: z.array(word).min(1), audio, text: z.string() })) }).superRefine((value, ctx) => {
  const words = new Map(value.words.map(w => [w.id, w]));
  if (words.size !== value.words.length || new Set(value.lines.map(l => l.id)).size !== value.lines.length) ctx.addIssue({ code: 'custom', message: 'Duplicate content IDs' });
  value.lines.forEach((line, i) => {
    if (line.text !== line.tokens.map(w => w.hanzi).join('') + '。') ctx.addIssue({ code: 'custom', message: 'Line segmentation mismatch', path: ['lines', i] });
    line.tokens.forEach(token => { if (JSON.stringify(words.get(token.id)) !== JSON.stringify(token)) ctx.addIssue({ code: 'custom', message: 'Noncanonical token', path: ['lines', i] }); });
  });
});
const parsed = contentSchema.parse(data);
export const words: Word[] = parsed.words;
export const lines: Line[] = parsed.lines;
export const lineById = Object.fromEntries(lines.map(line => [line.id.slice('apartment.'.length), line]));
export const wordByHanzi = Object.fromEntries(words.map(word => [word.hanzi, word]));
