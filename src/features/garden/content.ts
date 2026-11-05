import {z} from 'zod';
import type {Line, Word} from '../../contracts';
import data from './content.json';

const id = z.string().regex(/^(garden\.)?[a-z][a-z0-9-]*$/);
const audio = z.string().regex(/^\/audio\/(garden\/)?[a-z0-9-]+\.(wav|m4a)$/);
const wordSchema: z.ZodType<Word> = z.strictObject({id, hanzi: z.string().regex(/^[\p{Script=Han}]+$/u), pinyin: z.string().min(1), gloss: z.string().min(1), audio});
const lineSchema: z.ZodType<Line> = z.strictObject({id: z.string().regex(/^garden\.[a-z][a-z0-9-]*$/), tokens: z.array(wordSchema).min(1), audio});
const parsed = z.strictObject({words: z.array(wordSchema), lines: z.array(lineSchema), labels: z.record(z.string(), id)}).parse(data);
export const words: Word[] = parsed.words;
export const lines: Line[] = parsed.lines;
const byLine = new Map(lines.map(line => [line.id, line]));
export function line(id: string): Line {
  const found = byLine.get(`garden.${id}`);
  if (!found) throw new Error(`Unknown garden line: ${id}`);
  return found;
}
const byWord = new Map(words.map(word => [word.id, word]));
export function label(id: string): Pick<Line, 'id' | 'tokens'> {
  const word = byWord.get(parsed.labels[id]);
  if (!word) throw new Error(`Unknown garden label: ${id}`);
  return {id: `garden.label-${id}`, tokens: [word]};
}
