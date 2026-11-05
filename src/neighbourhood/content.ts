import { z } from "zod";
import type { Line, Word } from "../contracts";
import { featureIds, type FeatureId } from "./contracts";

const id = z.string().regex(/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/);
const audio = z.string().regex(/^\/audio\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(m4a|wav)$/);
export const wordSchema: z.ZodType<Word> = z.strictObject({
  id,
  hanzi: z.string().regex(/^[\p{Script=Han}]+$/u),
  pinyin: z.string().trim().min(1),
  gloss: z.string().trim().min(1),
  audio,
});
export const lineSchema: z.ZodType<Line> = z.strictObject({
  id, tokens: z.array(wordSchema).min(1), audio,
});
export const featureContentSchema = z.strictObject({
  words: z.array(wordSchema),
  lines: z.array(lineSchema),
});
export type FeatureContent = { words: readonly Word[]; lines: readonly Line[] };

function sameWord(left: Word, right: Word): boolean {
  return left.hanzi === right.hanzi && left.pinyin === right.pinyin && left.gloss === right.gloss && left.audio === right.audio;
}

export function registerFeatureContent(
  canonicalWords: readonly Word[],
  features: Record<FeatureId, FeatureContent>,
): { words: Word[]; lines: Line[]; audio: string[] } {
  const words = new Map<string, Word>();
  const lines = new Map<string, Line>();
  for (const word of canonicalWords) {
    const previous = words.get(word.id);
    if (previous && !sameWord(previous, word)) throw new Error(`Conflicting canonical word: ${word.id}`);
    words.set(word.id, word);
  }
  const canonicalIds = new Set(words.keys());
  for (const feature of featureIds) {
    const bundle = featureContentSchema.parse(features[feature]);
    const declared = new Set<string>();
    for (const word of bundle.words) {
      if (!canonicalIds.has(word.id) && !word.id.startsWith(`${feature}.`)) throw new Error(`Word outside ${feature}: ${word.id}`);
      if (declared.has(word.id)) throw new Error(`Duplicate feature word: ${word.id}`);
      declared.add(word.id);
      const previous = words.get(word.id);
      if (previous && !sameWord(previous, word)) throw new Error(`Conflicting word: ${word.id}`);
      words.set(word.id, word);
    }
    for (const line of bundle.lines) {
      if (!line.id.startsWith(`${feature}.`)) throw new Error(`Line outside ${feature}: ${line.id}`);
      if (lines.has(line.id)) throw new Error(`Duplicate feature line: ${line.id}`);
      for (const token of line.tokens) {
        const word = words.get(token.id);
        if ((!canonicalIds.has(token.id) && !declared.has(token.id)) || !word || !sameWord(word, token)) throw new Error(`Undeclared or conflicting token: ${token.id}`);
      }
      lines.set(line.id, line);
    }
  }
  return {
    words: [...words.values()],
    lines: [...lines.values()],
    audio: [...new Set([...words.values(), ...lines.values()].map(value => value.audio))],
  };
}
