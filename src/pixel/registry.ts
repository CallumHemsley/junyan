/**
 * Every sprite module, for the browser. Vite inlines the glob at build time. Node uses
 * `tools/load.ts`, which walks the same folder; tests pass literal sets.
 */
import { mergeSpriteSets, type SpriteSet } from "./kit/index.ts";

const modules = import.meta.glob<{ default: SpriteSet }>(["./sprites/**/*.ts", "!./sprites/**/_*.ts", "!./sprites/**/*.test.ts"], { eager: true });

export const sprites: SpriteSet = mergeSpriteSets(Object.keys(modules).sort().map((path) => {
  const set = modules[path].default;
  if (!set) throw new Error(`${path} has no default export; use \`export default defineSprites({...})\``);
  return set;
}));
