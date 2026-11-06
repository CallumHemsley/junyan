import {z} from 'zod';
import type {Line, Word} from '../../contracts';
import data from './content.json';

import { createWordSchema, createLineSchema } from '../../content/schema';
import { adaptMandarinContent } from '../../content/mandarin';
import { language } from '../../language';
const id = /^(?:garden\.)?[a-z][a-z0-9-]*$/;
const audio = /^\/audio\/(?:garden\/)?[a-z0-9-]+\.(?:wav|m4a)$/;
const wordSchema = createWordSchema(language).refine(word => id.test(word.id) && audio.test(word.audio), 'Invalid garden word ID or audio');
const lineSchema = createLineSchema(language).refine(line => /^garden\.[a-z][a-z0-9-]*$/.test(line.id) && audio.test(line.audio), 'Invalid garden line ID or audio');
const parsed = z.strictObject({words: z.array(wordSchema), lines: z.array(lineSchema), labels: z.record(z.string(), z.string().regex(id))}).parse(adaptMandarinContent(data));
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
