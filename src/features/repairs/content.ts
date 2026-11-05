import { z } from 'zod';
import type { Line, Word } from '../../contracts';
import data from './content.json';

const id = z.string().regex(/^(repairs\.[a-z][a-z0-9-]*|[a-z][a-z0-9-]*)$/);
const audio = z.string().regex(/^\/audio\/(repairs\/)?[a-z0-9-]+\.wav$/);
const wordSchema: z.ZodType<Word> = z.strictObject({ id, hanzi: z.string().regex(/^[\p{Script=Han}]+$/u), pinyin: z.string().min(1), gloss: z.string().min(1), audio });
const phraseSchema = z.strictObject({ id: z.string().regex(/^repairs\.[a-z][a-z0-9-]*$/), tokens: z.array(wordSchema).min(1), text: z.string().min(1), audio }).refine(line => line.text.replace(/[，。！？]/gu, '') === line.tokens.map(word => word.hanzi).join(''), 'Text and segmented words must agree');
export const contentSchema = z.strictObject({ words: z.array(wordSchema), characters: z.array(z.strictObject({ id: z.enum(['lamp', 'toy']), name: z.enum(['林姐', '小周']), voiceId: z.enum(['serena', 'xiaobei']), lines: z.array(phraseSchema) })) }).superRefine((value, ctx) => {
  const byId = new Map(value.words.map(word => [word.id, word]));
  const lines = value.characters.flatMap(character => character.lines);
  if (byId.size !== value.words.length || new Set(lines.map(line => line.id)).size !== lines.length) ctx.addIssue({ code: 'custom', message: 'Duplicate content IDs' });
  for (const line of lines) for (const word of line.tokens) {
    if (JSON.stringify(byId.get(word.id)) !== JSON.stringify(word)) ctx.addIssue({ code: 'custom', message: 'Line word differs from dictionary' });
  }
});
export const content = contentSchema.parse(data);
export const words: Word[] = content.words;
export const lines: Line[] = content.characters.flatMap(character => character.lines);
export function lineFor(feedback: string): Line {
  return lines.find(line => line.id === `repairs.${feedback}`)!;
}
export function wordFor(hanzi: string): Word {
  return words.find(word => word.hanzi === hanzi)!;
}
