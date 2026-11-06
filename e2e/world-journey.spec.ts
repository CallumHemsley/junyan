import {test, expect} from "@playwright/test";
import {withSkip} from "./opening";
import {visitWorld, savedGame} from "./world-journey";
import {privateArtifact} from "./private-artifacts";

test("physical doors and stairs connect every neighbourhood activity", async ({page},info) => {
  test.setTimeout(240_000);
  page.setDefaultTimeout(8_000);
  const errors: string[] = [];
  page.on("pageerror", error=>errors.push(error.message));
  page.on("console", message=>{if(message.type()==="error")errors.push(message.text());});
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", {name:"开门迎客"}).click();
  for (const [location,map] of [["家","apartment"],["院子","courtyard"],["修理间","workshop"],["屋顶花园","rooftop"],["早安小馆","restaurant"]]) {
    await visitWorld(page, location);
    expect((await savedGame(page)).world!.mapId).toBe(map);
    await page.screenshot({path:privateArtifact(`navigation/${info.project.name}-${map}.png`)});
  }
  expect(errors).toEqual([]);
});
