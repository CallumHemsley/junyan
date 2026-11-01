export type Position = { x: number; y: number };
export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  gloss: string;
  audio: string;
};
export type Line = { id: string; tokens: Word[]; audio: string };
export type Food = {
  id: string;
  word: Word;
  price: number;
  kind: "bun" | "bread" | "egg" | "milk" | "porridge" | "youtiao" | "dumpling";
};
export type Order = {
  id: string;
  level: number;
  customer: string;
  table: number;
  line: Line;
  items: { foodId: string; quantity: number }[];
  paid: number;
};
export type Character = {
  id: string;
  name: string;
  voiceId: string;
  personality: string;
  appearance: { shirt: [number, number, number]; hair: [number, number, number]; accessory: "bun" | "tie" | "glasses" | "backpack" };
  greeting: Line;
  thanks: Line;
  retry: Line;
};
export type Content = {
  help: {
    welcome: Line;
    lookup: Line;
    steps: { id: "order" | "kitchen" | "deliver"; line: Line }[];
    pace: Line;
  };
  characters: Character[];
  foods: Food[];
  orders: Order[];
  thanks: Line;
  retry: Line;
};
export type Phase = "seated" | "ordered" | "checkout" | "served";
export type Customer = { table: number; orderId: string; phase: Phase };
export type GameState = {
  seed: number;
  day: number;
  level: number;
  player: Position;
  customers: Customer[];
  tray: string[];
  served: number;
  earnings: number;
  mistakes: number;
  activeTable: number | null;
  feedback: "none" | "wrong-food" | "wrong-change" | "thanks" | "full";
  receipt: { table: number; total: number; change: number } | null;
  journal: Record<string, { lookups: number; lastSeen: number }>;
  ended: boolean;
};
export type Action =
  | { type: "move"; position: Position }
  | { type: "interact"; table: number }
  | { type: "pickup"; foodId: string }
  | { type: "return-food"; index: number }
  | { type: "deliver"; table: number }
  | { type: "pay"; table: number; change: number }
  | { type: "lookup"; wordId: string; now: number }
  | { type: "next-day" };
export const TABLES = [
  { table: 1, x: 3, y: 4 },
  { table: 2, x: 9, y: 4 },
  { table: 3, x: 3, y: 8 },
  { table: 4, x: 9, y: 8 },
];
export const KITCHEN = { x: 6, y: 1 };
export const TRAY_CAPACITY = 6;
