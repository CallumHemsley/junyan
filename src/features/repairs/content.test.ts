import { expect, it } from 'vitest';
import { contentSchema, createRepairContentSchema } from './content';
import { french, frenchVoices } from '../../content/fixtures/french';
import data from './content.json';

it.each(['missing', 'ryan-en'])('rejects repair speaker voice %s outside the target-language catalog', voiceId => {
  const invalid = structuredClone(data);
  invalid.characters[0].voiceId = voiceId;
  expect(contentSchema.safeParse(invalid).success).toBe(false);
});

it.each(['English', ' ', ''])('rejects repair speaker name %j outside the selected language', name => {
  const invalid = structuredClone(data);
  invalid.characters[0].name = name;
  expect(contentSchema.safeParse(invalid).success).toBe(false);
});

it('accepts authored Mandarin voices and another pack’s selected target-language voice', () => {
  expect(contentSchema.safeParse(data).success).toBe(true);
  const renamed = structuredClone(data);
  renamed.characters[0].name = '王奶奶';
  expect(contentSchema.safeParse(renamed).success).toBe(true);
  const word = {id: 'repairs.stool', text: 'tabouret', gloss: 'stool', audio: '/audio/repairs/word-stool.wav'};
  const alternative = {
    words: [word], characters: [{
      id: 'lamp', name: 'Camille', voiceId: 'french',
      lines: [{id: 'repairs.welcome', tokens: [word], text: 'tabouret.', audio: '/audio/repairs/line-welcome.wav'}],
    }],
  };
  const schema = createRepairContentSchema(french, frenchVoices);
  expect(schema.safeParse(alternative).success).toBe(true);
  alternative.characters[0].voiceId = 'premise';
  expect(schema.safeParse(alternative).success).toBe(false);
});
