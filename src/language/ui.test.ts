import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Line, Word } from "../contracts";
import { french } from "../content/fixtures/french";
import WordLine from "../WordLine";
import WordToken from "../WordToken";
import { ui } from "./ui";

const lookup = () => {};
const plain = (): "plain" => "plain";
const word = (id: string, text: string): Word => ({ id, text, gloss: text, audio: `/audio/${id}.wav` });
const visibleText = (markup: string) => markup.replace(/<[^>]+>/g, "").replaceAll("&#x27;", "'");

describe("language-neutral word rendering", () => {
  it("renders an accented word without requiring a pronunciation guide", () => {
    const markup = renderToStaticMarkup(createElement(WordToken, {
      word: word("coffee", "café"), look: "plain", onLookup: lookup,
    }));
    expect(markup).toContain("data-word-lookup");
    expect(visibleText(markup)).toBe("café");
    expect(markup).not.toContain("undefined");
  });

  it("preserves authored French spaces, apostrophes and punctuation around tappable words", () => {
    const line: Line = {
      id: "coffee-order", text: "Un café, s'il vous plaît !", audio: "/audio/order.wav",
      tokens: [word("one", "Un"), word("coffee", "café"), word("if-it", "s'il"), word("you", "vous"), word("please", "plaît")],
    };
    const markup = renderToStaticMarkup(createElement(WordLine, {
      line, policy: french, look: plain, onLookup: lookup,
    }));
    expect(visibleText(markup)).toBe(line.text);
    expect(markup.match(/data-word-lookup/g)).toHaveLength(5);
  });

  it("keeps the existing Mandarin line presentation without visible punctuation", () => {
    const line: Line = {
      id: "thanks", text: "多谢！", audio: "/audio/thanks.wav", tokens: [word("thanks", "多谢")],
    };
    const markup = renderToStaticMarkup(createElement(WordLine, { line, look: plain, onLookup: lookup }));
    expect(visibleText(markup)).toBe("多谢");
  });
});

describe("Mandarin interface formatting", () => {
  it("preserves the first days and fallback day label", () => {
    expect([1, 5, 6].map(ui.marketDay)).toEqual(["第一天 · 早市", "第五天 · 早市", "第6天 · 早市"]);
  });

  it("keeps receipts, journal counts and control labels in the catalog", () => {
    expect(ui.checkout(4, 10)).toBe("共 4块 · 收到 10块");
    expect(ui.change(6)).toBe("找零 6块");
    expect(ui.journalCount(3)).toBe("3 个词 · 点一下，再听一遍");
    expect(ui.customer(2, "小李", "ordered")).toBe("2桌 小李 等候上菜");
    expect(ui.listen("厨房")).toBe("听厨房");
  });
});
