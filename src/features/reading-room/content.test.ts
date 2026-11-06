import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { lineById } from '../apartment/content';
import { briefs, instruction, instructionsFor, lines, words } from './content';

it('uses complete canonical voiced Mandarin without changing permissive-right into a command', () => {
  expect(briefs.map(b => b.id)).toEqual(['window', 'alcove']);
  expect(instructionsFor('alcove')).toEqual([lineById.window, lineById.rotate, lineById.left]);
  expect(instruction.window).toBe(lineById.window);
  expect(lines.some(line => line.id === 'apartment.right')).toBe(false);
  for (const line of lines) {
    expect(readFileSync(`public${line.audio}`).byteLength).toBeGreaterThan(44);
    for (const token of line.tokens) {
      expect(words.find(word => word.id === token.id)).toEqual(token);
      expect(readFileSync(`public${token.audio}`).byteLength).toBeGreaterThan(44);
    }
  }
});
