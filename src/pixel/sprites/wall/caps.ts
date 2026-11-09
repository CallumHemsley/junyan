/**
 * Wall caps: the tops of the side and front walls, seen from above, as 16×16 tiles.
 * One profile everywhere: dark outer edge, a tea-wood plate, a dusky plaster core, a lit wooden lip
 * and a dark inner edge against the floor. Outside the wall is void (`ink`), matching `tile/void`.
 *
 * Side caps fill the inner 8px of their tile; the front cap fills the top 6 rows. Corners join the
 * profiles: `tl`/`tr` meet the back wall's own cap (rows 0–4 of the wall slices), `bl`/`br` turn the
 * side caps into the front cap. Door jambs end the front cap in a squared timber door post.
 * Tiles anchor at their top-left corner.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { CAP, block } from "./_helpers.ts";

const mirror = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(""));
const cap = (rows: readonly string[], name: string) => ({
  w: 16, h: 16, anchor: [0, 0] as const, layer: "floor" as const,
  draw: (p: Px) => block(p, 0, 0, 16, 16, rows, CAP, name),
});
const VOID = "vvvvvvvvvvvvvvvv";

const LEFT_A = [
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12pPp241",
  "vvvvvvvv12pPp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv11ppp231",
  "vvvvvvvv11ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppP231",
  "vvvvvvvv12ppP231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp241",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
];
/** A joint across the timber plates, and the core flecked elsewhere. */
const LEFT_B = [
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp241",
  "vvvvvvvv12Ppp231",
  "vvvvvvvv12Ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv11ppp111",
  "vvvvvvvv12ppp241",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv11ppp231",
  "vvvvvvvv12pPp231",
  "vvvvvvvv12pPp231",
  "vvvvvvvv12ppp231",
];
const FRONT_A = [
  "1111111111111111",
  "3333333343333333",
  "pppppppppppppppp",
  "ppppPPpppppppppp",
  "2222222222221122",
  "1111111111111111",
  VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID,
];
const FRONT_B = [
  "1111111111111111",
  "3343333331333343",
  "ppppppppppPPpppp",
  "pppppppppppppppp",
  "2222222221222222",
  "1111111111111111",
  VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID,
];
const CORNER_TL = [
  "vvvvvvvv11111111",
  "vvvvvvvv12pppppp",
  "vvvvvvvv12pppPPp",
  "vvvvvvvv12ppp233",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp241",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12pPp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv11ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp231",
];
const CORNER_BL = [
  "vvvvvvvv12ppp231",
  "vvvvvvvv12ppp233",
  "vvvvvvvv12pppppp",
  "vvvvvvvv12ppppPp",
  "vvvvvvvv12222222",
  "vvvvvvvv11111111",
  VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID,
];
/** The front cap ending in a squared timber door post; the doorway opens to its right. */
const DOOR_LEFT = [
  "1111111111111111",
  "3333343333314441",
  "ppppppppppp14331",
  "pppPPpppppp13331",
  "2222222222211111",
  "1111111111113221",
  "vvvvvvvvvvv13221",
  "vvvvvvvvvvv11111",
  VOID, VOID, VOID, VOID, VOID, VOID, VOID, VOID,
];

export default defineSprites({
  "wall/cap-left": cap(LEFT_A, "cap-left"),
  "wall/cap-left-b": cap(LEFT_B, "cap-left-b"),
  "wall/cap-right": cap(mirror(LEFT_A), "cap-right"),
  "wall/cap-right-b": cap(mirror(LEFT_B), "cap-right-b"),
  "wall/cap-front": cap(FRONT_A, "cap-front"),
  "wall/cap-front-b": cap(FRONT_B, "cap-front-b"),
  "wall/cap-corner-tl": cap(CORNER_TL, "cap-corner-tl"),
  "wall/cap-corner-tr": cap(mirror(CORNER_TL), "cap-corner-tr"),
  "wall/cap-corner-bl": cap(CORNER_BL, "cap-corner-bl"),
  "wall/cap-corner-br": cap(mirror(CORNER_BL), "cap-corner-br"),
  "wall/cap-door-left": cap(DOOR_LEFT, "cap-door-left"),
  "wall/cap-door-right": cap(mirror(DOOR_LEFT), "cap-door-right"),
});
