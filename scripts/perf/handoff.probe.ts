import { test, expect } from "@playwright/test";
import { silentResponse } from "../../e2e/audio-fixtures";
import { playOpening } from "../../e2e/opening";

const samples = Number(process.env.SAMPLES ?? 10);
const results: { longest: number; tasks: number[]; help: number }[] = [];

for (let run = 0; run < samples; run++) {
  test(`hand-off sample ${run}`, async ({ page }) => {
    await page.route("**/*.wav", (route) => silentResponse(route));
    const cdp = await page.context().newCDPSession(page);
    await page.goto(`${process.env.JUNYAN_PREVIEW_URL}?seed=42`);
    let armed = false;
    await playOpening(page, {
      pause: async () => {
        if (armed || !(await page.locator(".end-card").isVisible())) return;
        armed = true;
        await page.waitForTimeout(500);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.evaluate(() => {
          const probe = { t0: 0, help: 0, tasks: [] as { start: number; duration: number }[] };
          (window as unknown as { probe: typeof probe }).probe = probe;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) probe.tasks.push({ start: entry.startTime, duration: entry.duration });
          }).observe({ type: "longtask" });
          document.addEventListener("click", () => {
            probe.t0 = performance.now();
            const look = () => {
              if (document.querySelector('[role="dialog"][aria-label="怎么玩"]')) probe.help = performance.now() - probe.t0;
              else requestAnimationFrame(look);
            };
            requestAnimationFrame(look);
          }, { capture: true, once: true });
        });
      },
    });
    await page.waitForTimeout(2000);
    const probe = await page.evaluate(() => (window as unknown as { probe: { t0: number; help: number; tasks: { start: number; duration: number }[] } }).probe);
    const tasks = probe.tasks.filter((task) => task.start + task.duration >= probe.t0).map((task) => Math.round(task.duration));
    results.push({ longest: Math.max(0, ...tasks), tasks, help: Math.round(probe.help) });
    expect(probe.help).toBeGreaterThan(0);
  });
}

test.afterAll(() => {
  for (const [index, result] of results.entries()) console.log(`sample ${index}: longest ${result.longest} ms, tasks [${result.tasks.join(", ")}], help ${result.help} ms`);
  const sorted = (values: number[]) => [...values].sort((a, b) => a - b);
  const longest = sorted(results.map((result) => result.longest));
  const help = sorted(results.map((result) => result.help));
  console.log(`longest task ms: min ${longest[0]} median ${longest[Math.floor(longest.length / 2)]} max ${longest.at(-1)}`);
  console.log(`help visible ms: min ${help[0]} median ${help[Math.floor(help.length / 2)]} max ${help.at(-1)}`);
});
