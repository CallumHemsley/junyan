import { z } from "zod";
import type { Content, Line, Word } from "../contracts";
import { featureIds, type FeatureId } from "./contracts";
import { contentWords } from "../content/words";

import { createWordSchema, createLineSchema } from '../content/schema';
import { language, type LanguagePolicy } from '../language';

export type RegisteredLine = Line;
export function createFeatureContentSchema(policy: LanguagePolicy) {
  return z.strictObject({ words: z.array(createWordSchema(policy)), lines: z.array(createLineSchema(policy)) });
}
export type FeatureContent = { words: readonly Word[]; lines: readonly Line[] };

function sameWord(left: Word, right: Word): boolean {
  return left.text === right.text && left.pronunciation === right.pronunciation && left.gloss === right.gloss && left.audio === right.audio;
}

export function registerFeatureContent(
  canonicalWords: readonly Word[],
  features: Record<FeatureId, FeatureContent>,
  policy: LanguagePolicy = language,
): { words: Word[]; lines: RegisteredLine[]; audio: string[] } {
  const featureContentSchema = createFeatureContentSchema(policy);
  const words = new Map<string, Word>();
  const lines = new Map<string, RegisteredLine>();
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

export function attachFeatureContent(base: Content, features: Record<FeatureId, FeatureContent>, policy: LanguagePolicy = language): Content {
  const registered = registerFeatureContent(contentWords({ ...base, neighbourhood: undefined }), features, policy);
  return { ...base, neighbourhood: { words: registered.words, lines: registered.lines } };
}
