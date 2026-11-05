export type Position = { x: number; y: number };
export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  gloss: string;
  audio: string;
};
export type Line = { id: string; tokens: Word[]; audio: string };
export type Phrase = Line & { text: string };
export type CastMember = { id: string; name: string; voices: { zh: string; en?: string } };
type Staging = { enter?: string[]; leave?: string[] };
export type OpeningStep =
  | ({ type: "say-en"; who: string; en: string; audio: string } & Staging)
  | ({ type: "say"; who: string; line: Phrase; recover: string[] } & Staging)
  | ({ type: "request"; who: string; line: Phrase; want: string; wrong: Phrase; ok: Phrase; recover: string[] } & Staging)
  | ({ type: "reply"; who: string; options: { word: Word; answer: Phrase; recover: string[] }[] } & Staging)
  | { type: "end"; title: Phrase };
export type Opening = { cast: CastMember[]; tray: string[]; steps: OpeningStep[] };
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
  neighbourhood?: { words: Word[]; lines: (Line & { text?: string })[] };
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
  opening: Opening;
};
export type Phase = "seated" | "ordered" | "checkout" | "served";
export type Customer = { table: number; orderId: string; phase: Phase };
export type JournalEntry = { lookups: number; lastSeen: number; recovered: boolean };
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
  journal: Record<string, JournalEntry>;
  ended: boolean;
};
export type Action =
  | { type: "move"; position: Position }
  | { type: "interact"; table: number }
  | { type: "pickup"; foodId: string }
  | { type: "return-food"; index: number }
  | { type: "deliver"; table: number; now: number }
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
