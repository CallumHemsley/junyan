import type { LanguagePolicy } from '../../language';
import { createContentSchema } from '../schema';
import { voicesSchema } from '../voices';
import data from './french.json';

export const french: LanguagePolicy = {
  id: 'fr-FR',
  locale: 'fr-FR',
  direction: 'ltr',
  tokenSeparator: ' ',
  wordPattern: /^[\p{Script=Latin}]+(?:[’'-][\p{Script=Latin}]+)*$/u,
  speechPattern: /^[\p{Script=Latin} ’',.!?;:-]+$/u,
  punctuationPattern: /[ ,.!?;:]/gu,
  pronunciationRequired: false,
  targetVoiceLanguages: ['French'],
  renderAuthoredText: true,
};

const preset = {
  engine: 'qwen', model: 'fixture-only', revision: '0'.repeat(40),
  speaker: 'fixture', speed: 1, instructions: null,
};

export const frenchVoices = voicesSchema.parse({
  wordVoice: 'french',
  voices: {
    french: { ...preset, language: 'French' },
    premise: { ...preset, language: 'English' },
  },
});

export const frenchSchema = createContentSchema(french, frenchVoices);
export const frenchContent = frenchSchema.parse(data);
