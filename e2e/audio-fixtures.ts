import { expect, type Page, type Route } from "@playwright/test";

export function silentWav(bytes: Buffer) {
  const silent = Buffer.from(bytes);
  expect(silent.toString("ascii", 0, 4)).toBe("RIFF");
  expect(silent.toString("ascii", 8, 12)).toBe("WAVE");
  let bits = 0;
  for (let offset = 12; offset + 8 <= silent.length;) {
    const size = silent.readUInt32LE(offset + 4);
    const kind = silent.toString("ascii", offset, offset + 4);
    if (kind === "fmt ") {
      expect(silent.readUInt16LE(offset + 8)).toBe(1);
      bits = silent.readUInt16LE(offset + 22);
    }
    if (kind === "data") {
      expect(bits).toBeGreaterThan(0);
      silent.fill(bits === 8 ? 128 : 0, offset + 8, offset + 8 + size);
    }
    offset += 8 + size + (size % 2);
  }
  return silent;
}

export async function silentResponse(route: Route, delay = 0) {
  const response = await route.fetch({ headers: { ...route.request().headers(), range: "bytes=0-" } });
  const body = silentWav(await response.body());
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  await route.fulfill({ status: 200, contentType: "audio/wav", body });
}

export async function probeAudio(page: Page) {
  await page.addInitScript(() => {
    const probe = window as any;
    probe.__audioProbe = [];
    probe.__audioElements = [];
    probe.__ambienceProbe = [];
    probe.__ambienceElements = [];
    probe.__lastClickAt = 0;
    document.addEventListener("click", () => { probe.__lastClickAt = performance.now(); }, true);
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const row = {
        src: this.src, at: performance.now(), active: navigator.userActivation?.isActive,
        sinceClick: performance.now() - probe.__lastClickAt,
        muted: this.muted, volume: this.volume, status: "pending",
      };
      if (new URL(this.src, location.href).pathname.includes("/audio/ambience/")) {
        probe.__ambienceProbe.push(row);
        if (!probe.__ambienceElements.includes(this)) probe.__ambienceElements.push(this);
      } else {
        probe.__audioProbe.push(row);
        probe.__audioElements.push(this);
        probe.__lastAudio = this;
      }
      return original.call(this).then(
        () => { row.status = "playing"; },
        error => { row.status = error.name; throw error; },
      );
    };
  });
}
