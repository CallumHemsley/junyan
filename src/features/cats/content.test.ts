import { describe, expect, it } from 'vitest';
import { content, contentSchema, lines, words } from './content';
import data from './content.json';
import { initialState, recoveredWords, reduce } from './rules';

describe('authored cats Mandarin', () => {
  it('validates every presegmented line and resolves its canonical words', () => {
    expect(contentSchema.safeParse(data).success).toBe(true);
    expect(lines.length).toBeGreaterThan(30);
    for (const line of lines) for (const token of line.tokens) expect(words).toContainEqual(token);
  });
  it('rejects unsegmented text drift and duplicate IDs', () => {
    const broken = structuredClone(data);
    broken.lines[0].text += '猫';
    expect(contentSchema.safeParse(broken).success).toBe(false);
    expect(contentSchema.safeParse({ ...data, words: [...data.words, data.words[0]] }).success).toBe(false);
  });
  it('supports content addressed feature audio paths and rejects unrelated shared words', () => {
    const changed = structuredClone(data);
    changed.lines[0].audio = '/audio/cats/line-123abc.wav';
    expect(contentSchema.safeParse(changed).success).toBe(true);
    changed.words.find(word => word.id === 'you')!.gloss = 'different';
    expect(contentSchema.safeParse(changed).success).toBe(false);
  });
  it('every recovered word is available to the shared journal', () => {
    let state = initialState();
    for (const action of [{ type: 'select', target: 'white' }, { type: 'space' }, { type: 'crouch' }, { type: 'wait' }, { type: 'approach' }, { type: 'follow' }, { type: 'reunite' }] as const) state = reduce(state, action, 1);
    const ids = new Set(content.words.map(word => word.id));
    for (const id of recoveredWords(state)) expect(ids.has(id), id).toBe(true);
  });
});
