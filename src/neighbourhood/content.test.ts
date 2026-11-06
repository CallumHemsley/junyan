import { describe, expect, it } from "vitest";
import type { Word } from "../contracts";
import { attachFeatureContent, registerFeatureContent, type FeatureContent } from "./content";
import type { FeatureId } from "./contracts";
import { content, contentSchema } from "../content";
import { contentLines, contentWords } from "../content/words";
import { recordLookup } from "../game";

const canonical: Word = { id: "hao", text: "好", pronunciation: "hǎo", gloss: "good", audio: "/audio/word-hao.wav" };
const room: Word = { id: "apartment.room", text: "房间", pronunciation: "fáng jiān", gloss: "room", audio: "/audio/apartment/word-room.wav" };
const bundles = (): Record<FeatureId, FeatureContent> => ({
  apartment: { words: [canonical, room], lines: [{ id: "apartment.room-ready", tokens: [room, canonical], audio: "/audio/apartment/line-room-ready.wav" }] },
  cats: { words: [], lines: [] },
  repairs: { words: [], lines: [] },
  garden: { words: [], lines: [] },
});

describe("feature content registration", () => {
  it("shares exact canonical words and enumerates nested audio without duplication", () => {
    const registered = registerFeatureContent([canonical, canonical], bundles());
    expect(registered.words).toEqual([canonical, room]);
    expect(registered.lines).toHaveLength(1);
    expect(registered.audio).toEqual([canonical.audio, room.audio, "/audio/apartment/line-room-ready.wav"]);
  });

  it("preserves authored Phrase text for audio provenance", () => {
    const features = bundles();
    const phrase = { ...features.apartment.lines[0], text: "房间好。" };
    features.apartment = { words: features.apartment.words, lines: [phrase] };
    const registered = registerFeatureContent([canonical], features);
    expect(registered.lines).toEqual([phrase]);
    expect(registered.lines[0].text).toBe("房间好。");
    const mismatched = { ...phrase, text: "房间坏。" };
    features.apartment = { words: features.apartment.words, lines: [mismatched] };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Line text must equal its tokens");
  });

  it("rejects conflicting canonical words instead of changing existing journal meaning", () => {
    const features = bundles();
    features.apartment = { words: [{ ...canonical, text: "坏" }], lines: [] };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Conflicting word: hao");
    expect(() => registerFeatureContent([canonical, { ...canonical, audio: "/audio/wrong.wav" }], bundles())).toThrow("Conflicting canonical word: hao");
  });

  it("rejects another feature's namespace and duplicate declarations", () => {
    const features = bundles();
    features.cats = { words: [room], lines: [] };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Word outside cats");
    features.cats = { words: [], lines: [] };
    features.apartment = { words: [room, room], lines: [] };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Duplicate feature word");
  });

  it("requires declared words and exact token definitions", () => {
    const features = bundles();
    features.apartment = { words: [], lines: features.apartment.lines };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Undeclared or conflicting token");
    features.apartment = { words: [room], lines: [{ id: "apartment.changed", tokens: [{ ...room, pronunciation: "wrong" }], audio: "/audio/apartment/line.wav" }] };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Undeclared or conflicting token");
  });

  it("rejects duplicate or unowned lines", () => {
    const features = bundles();
    features.apartment = { words: [room], lines: [features.apartment.lines[0], features.apartment.lines[0]] };
    expect(() => registerFeatureContent([canonical], features)).toThrow("Duplicate feature line");
    features.cats = { words: [], lines: [{ id: "apartment.cat", tokens: [canonical], audio: "/audio/cats/line.wav" }] };
    features.apartment = bundles().apartment;
    expect(() => registerFeatureContent([canonical], features)).toThrow("Line outside cats");
  });

  it("requires segmented Han words and committed local audio paths", () => {
    const features = bundles();
    features.apartment = { words: [{ ...room, audio: "https://example.test/room.wav" }], lines: [] };
    expect(() => registerFeatureContent([canonical], features)).toThrow();
    features.apartment = { words: [{ ...room, text: "房间 room" }], lines: [] };
    expect(() => registerFeatureContent([canonical], features)).toThrow();
  });
});

it("registers namespaced words for shared learning without changing base content", () => {
  const features = bundles();
  const openingWord = content.opening.steps.flatMap(step => step.type === "reply" ? step.options.map(option => option.word) : [])[0];
  features.apartment = { words: [room, openingWord], lines: [{ id: "apartment.room", tokens: [room, openingWord], audio: "/audio/apartment/line-room.wav" }] };
  const connected = attachFeatureContent(content, features);
  expect(content.neighbourhood).toBeUndefined();
  expect(contentWords(connected)).toContainEqual(room);
  expect(contentWords(connected)).toContainEqual(openingWord);
  expect(contentLines(connected)).toContainEqual(features.apartment.lines[0]);
  expect(recordLookup({}, { type: "lookup", wordId: room.id, now: 12 }, connected)).toEqual({ [room.id]: { lookups: 1, recovered: false, lastSeen: 12 } });
  expect(contentSchema.parse(connected).neighbourhood?.words).toContainEqual(room);
});
