import { readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mergeSpriteSets, type SpriteSet } from "../kit/index.ts";

const spritesDir = fileURLToPath(new URL("../sprites/", import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : entry.name.endsWith(".ts") && !basename(entry.name).startsWith("_") && !entry.name.endsWith(".test.ts") ? [join(dir, entry.name)] : []);
}

/** Load every sprite module under `src/pixel/sprites` in Node. Files starting with `_` are helpers. */
export async function loadSprites(): Promise<SpriteSet> {
  const sets: SpriteSet[] = [];
  for (const file of walk(spritesDir).sort()) {
    const module = await import(pathToFileURL(file).href);
    if (!module.default) throw new Error(`${file} has no default export; use \`export default defineSprites({...})\``);
    sets.push(module.default as SpriteSet);
  }
  return mergeSpriteSets(sets);
}
