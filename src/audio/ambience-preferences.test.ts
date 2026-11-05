import { expect, it } from "vitest";
import { parseAmbiencePreference } from "./ambience-preferences";

it("reads only finite independent preferences and tolerates corrupt storage", () => {
  for (const raw of [null, "bad", "null", "0", "[]"])
    expect(parseAmbiencePreference(raw)).toEqual({ muted: false, level: .35 });
  expect(parseAmbiencePreference('{"muted":true,"level":0.2,"unlocked":true}'))
    .toEqual({ muted: true, level: .2 });
  expect(parseAmbiencePreference('{"muted":"yes","level":9}'))
    .toEqual({ muted: false, level: 1 });
  expect(parseAmbiencePreference('{"level":-1}').level).toBe(0);
  expect(parseAmbiencePreference('{"level":1e999}').level).toBe(.35);
});
