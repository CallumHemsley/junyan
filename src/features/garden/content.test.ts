import {describe, expect, it} from 'vitest';
import {existsSync} from 'node:fs';
import shared from '../../content/content.json';
import {label, line, lines, words} from './content';
import {initialState, reduce, recoveryForTransition} from './rules';

describe('garden authored content', () => {
  it('has distinct namespaced lines and complete word references', () => {
    expect(new Set(lines.map(value => value.id)).size).toBe(lines.length);
    expect(new Set(words.map(value => value.id)).size).toBe(words.length);
    const byId = new Map(words.map(value => [value.id, value]));
    for (const value of lines) {
      expect(value.id.startsWith('garden.')).toBe(true);
      for (const word of value.tokens) expect(word).toEqual(byId.get(word.id));
    }
  });
  it('retains identical canonical entries and existing real audio paths', () => {
    const canonical = new Map<string, unknown>();
    const visit = (value: unknown) => {
      if (Array.isArray(value)) {value.forEach(visit); return;}
      if (!value || typeof value !== 'object') return;
      if ('id' in value && typeof value.id === 'string' && 'hanzi' in value) canonical.set(value.id, value);
      Object.values(value).forEach(visit);
    };
    visit(shared);
    for (const value of words.filter(value => !value.id.startsWith('garden.'))) {
      expect(value).toEqual(canonical.get(value.id));
      expect(existsSync(`public${value.audio}`)).toBe(true);
    }
  });
  it('authors the first contrast and all seven bounded dialogue lines', () => {
    expect(line('wet-warning').tokens.map(value => value.hanzi).join('')).toBe('土还是湿的先别浇水');
    expect(line('dry-advice').tokens.map(value => value.hanzi).join('')).toBe('这盆土干了浇一点水');
    for (const id of ['shade-advice', 'rain-advice', 'extra-result', 'growth-result', 'mature-result']) expect(line(id).tokens.length).toBeGreaterThan(3);
    for (const id of ['flower', 'climber', 'tree', 'cancel', 'anyway', 'keep-waiting']) expect(label(id).tokens.length).toBeGreaterThan(0);
  });
  it('only returns registered recovery IDs', () => {
    let state = reduce(initialState(), {type: 'sync'}, 1);
    state = reduce(state, {type: 'tidy', value: true}, 1);
    const ids = new Set(words.map(value => value.id));
    for (const action of [{type: 'wait', plant: 'flower'}, {type: 'water', plant: 'tree'}, {type: 'move', plant: 'tree', site: 5}, {type: 'shade', site: 1}] as const) {
      const next = reduce(state, action, 1);
      for (const id of recoveryForTransition(state, next, action)) expect(ids.has(id)).toBe(true);
    }
  });
});
