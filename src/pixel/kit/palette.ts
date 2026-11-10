/**
 * The master palette. Every sprite pixel is one of these colours, by name.
 *
 * Ramps run dark (1) to light (N). Shadows lean toward plum/blue, highlights toward yellow,
 * so stepping along a ramp already does the hue shift. Do not add colours in sprite files;
 * propose additions to the orchestrator.
 */
export const PALETTE = {
  // Outlines. Never pure black.
  ink: "#2b1d2e",
  ink2: "#45283c",

  // Tea wood: furniture, frames, beams.
  wood1: "#3f2832",
  wood2: "#5c3a36",
  wood3: "#7f4f38",
  wood4: "#a66b40",
  wood5: "#c98f55",
  wood6: "#e3b877",

  // Oak: floorboards, pale timber, crates.
  oak1: "#7a5536",
  oak2: "#9a7043",
  oak3: "#b98c54",
  oak4: "#d3a866",
  oak5: "#e7c688",

  // Rosewood: lacquered counters, doors, red-brown trim.
  rose1: "#4a2530",
  rose2: "#6e3238",
  rose3: "#944541",
  rose4: "#b85f4a",

  // Plaster, paper, dough, porcelain body.
  cream1: "#8f7a72",
  cream2: "#b9a48f",
  cream3: "#dcc9a8",
  cream4: "#f0e2c0",
  cream5: "#fbf3dc",
  white: "#fffaf0",

  // Jade: painted dado, tiles, aprons, enamel.
  jade1: "#1f3b3a",
  jade2: "#2f5a50",
  jade3: "#4a7f68",
  jade4: "#6fa283",
  jade5: "#9dc7a0",
  jade6: "#c9e3bf",

  // Leaf: plants, scallion, vegetables.
  leaf1: "#234a36",
  leaf2: "#3a6f3d",
  leaf3: "#5c9a44",
  leaf4: "#8fc055",
  leaf5: "#c4e078",

  // Blue: sky through windows, blue-and-white porcelain, denim.
  blue1: "#26334f",
  blue2: "#36507a",
  blue3: "#4f7fa6",
  blue4: "#7fb0c9",
  blue5: "#b5d8e2",
  blue6: "#e1f1f0",

  // Lacquer red: lanterns, paper, chili. Distinct from the UI vermilion, which stays on words.
  red1: "#5a1f2e",
  red2: "#8c2a35",
  red3: "#b93a3a",
  red4: "#d95a44",
  red5: "#ee8a5e",

  // Gold: brass, fried dough, tassels, lamp light.
  gold1: "#8a5a2b",
  gold2: "#b9812f",
  gold3: "#e0a93a",
  gold4: "#f5cf5b",
  gold5: "#fbe9a0",

  // Steel: pots, steamers' metal, fridge, cool shadows.
  steel1: "#33313f",
  steel2: "#56566b",
  steel3: "#7f8497",
  steel4: "#aab2bf",
  steel5: "#d3dade",
  steel6: "#f0f4f2",

  // Stone: kitchen tile grout, concrete, terrazzo.
  stone1: "#4d4347",
  stone2: "#74686a",
  stone3: "#9c8f8a",
  stone4: "#c2b5a8",
  stone5: "#dfd5c5",

  // Bamboo: steamer baskets, chopsticks, woven things.
  bamboo1: "#6b5230",
  bamboo2: "#96783f",
  bamboo3: "#bfa058",
  bamboo4: "#dcc47e",
  bamboo5: "#efe0a8",

  // Skin, light and tan. `blush` is cheeks only.
  skin1: "#8a4f45",
  skin2: "#c98466",
  skin3: "#eab08a",
  skin4: "#f8d3ae",
  tan1: "#74423c",
  tan2: "#a9684f",
  tan3: "#cf9068",
  tan4: "#e6b58a",
  blush: "#e58f7b",

  // Hair: black, brown, grey.
  hair1: "#1f1a26",
  hair2: "#3a2d3a",
  hair3: "#5a4350",
  brown1: "#3d2526",
  brown2: "#63392f",
  brown3: "#8c5a3c",
  grey1: "#6f6c7c",
  grey2: "#a3a2ad",
  grey3: "#d6d5d8",

  // Cloth accents.
  plum1: "#3b2546",
  plum2: "#5d3a6a",
  plum3: "#8a5b96",
  plum4: "#b98bbd",
  pink1: "#a8506a",
  pink2: "#d77a8c",
  pink3: "#f0aeb0",
  orange1: "#a84f24",
  orange2: "#d9772b",
  orange3: "#f2a14a",
} as const;

export type Color = keyof typeof PALETTE;

/** `ramp("wood")` → ["wood1", …, "wood6"], dark to light. */
export function ramp(name: string): Color[] {
  const out: Color[] = [];
  for (let i = 1; `${name}${i}` in PALETTE; i++) out.push(`${name}${i}` as Color);
  if (!out.length) throw new Error(`No ramp named "${name}"`);
  return out;
}
