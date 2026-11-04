import type { Page } from "@playwright/test";
import data from "../src/content/content.json" with { type: "json" };
import type { Content, GameState } from "../src/contracts";
import { createGame } from "../src/game";

export function withSkip(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}opening=skip`;
}

export async function seedDayOne(page: Page, base: string, state: object = createGame(data as Content, 42)) {
  await page.goto(new URL("audio/manifest.json", base).href);
  await page.evaluate(async (save) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("saves");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put(save, "v1");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { db.close(); }
    localStorage.removeItem("junyan-waiter-pending-v1");
  }, state);
}
