import { chromium } from '@playwright/test';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { findPath } from '../../../../src/world/geometry.ts';
import { cameraForMap, project } from '../../../../src/world/camera.ts';
const base = process.env.COURTYARD_PROOF_URL ?? 'http://127.0.0.1:5482', key = 'junyan-waiter-pending-v1';
const maps = {};
for (const owner of await readdir('src/world/maps')) for (const file of await readdir(`src/world/maps/${owner}`)) if (file.endsWith('.json')) {
  const data = JSON.parse(await readFile(`src/world/maps/${owner}/${file}`, 'utf8')); if (data.bounds && data.id) maps[data.id] = data;
}
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const selectedDevice = process.env.LAUNDRY_PROOF_DEVICE;
const results = selectedDevice ? JSON.parse(await readFile('docs/evidence/world/0080/laundry-motion-proof.json', 'utf8')).filter(r => r.name !== selectedDevice) : [];
try {
  const setup = await browser.newPage(); await setup.goto(`${base}/?test=1&seed=42&opening=skip`); await setup.waitForFunction(() => window.__TEST__?.getState());
  const initial = await setup.evaluate(() => window.__TEST__.getState()); await setup.close();
  for (const [name, width, height, touch] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]].filter(([device]) => !selectedDevice || device === selectedDevice)) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, serviceWorkers: 'block' });
    const seed = structuredClone(initial); seed.world = { version: 1, mapId: 'town', position: { x: 45, y: 3.3 }, facing: 'north', returnPositions: {}, activeActivity: null };
    await context.addInitScript(({ key, seed }) => { if (!sessionStorage.getItem('connection-seeded')) { localStorage.setItem(key, JSON.stringify(seed)); sessionStorage.setItem('connection-seeded', 'true'); } }, { key, seed });
    const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
    const save = () => page.evaluate(async key => { const pending = localStorage.getItem(key); if (pending) return JSON.parse(pending); return new Promise(resolve => { const open = indexedDB.open('junyan-waiter', 1); open.onsuccess = () => { const db = open.result; const get = db.transaction('saves').objectStore('saves').get('v1'); get.onsuccess = () => { resolve(get.result); db.close(); }; }; }); }, key);
    const encoder = spawn('/usr/bin/ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '15', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', `docs/evidence/world/0080/${name}-laundry-resident.mp4`], { stdio: ['pipe', 'ignore', 'pipe'] });
    const encodingErrors = []; encoder.stderr.on('data', b => encodingErrors.push(b.toString())); page.on('close', () => encoder.stdin.end());
    const cdp = await context.newCDPSession(page), timestamps = [];
    cdp.on('Page.screencastFrame', frame => { timestamps.push(frame.metadata.timestamp); encoder.stdin.write(Buffer.from(frame.data, 'base64')); void cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {}); });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 75, maxWidth: width, maxHeight: height, everyNthFrame: 2 });
    await page.goto(`${base}/?seed=42&opening=skip`); await page.locator('[data-testid="world-viewport"] canvas[data-rendered="true"]').waitFor();
    const welcome = page.getByRole('button', { name: /开门迎客/ }); if (await welcome.isVisible()) await welcome.click();
    const transitions = [];
    async function cross(id) {
      const before = (await save()).world, map = maps[before.mapId], exit = map.exits.find(e => e.id === id); assert(exit, `${map.id}/${id}`);
      const target = { x: exit.rect.x + exit.rect.width / 2, y: exit.rect.y + exit.rect.height / 2 }, path = findPath(map, before.position, target); assert(path.length);
      let done = false;
      for (const waypoint of path) {
        if (done) break;
        const begin = (await save()).world.position, distance = Math.hypot(waypoint.x - begin.x, waypoint.y - begin.y), steps = Math.max(1, Math.ceil(distance / 3));
        for (let i = 1; i <= steps; i++) {
          const current = (await save()).world; if (current.mapId !== map.id) { done = true; break; }
          const p = { x: begin.x + (waypoint.x - begin.x) * i / steps, y: begin.y + (waypoint.y - begin.y) * i / steps };
          const canvas = page.locator('[data-testid="world-viewport"] canvas'), bounds = await canvas.boundingBox(), size = await canvas.evaluate(c => ({ width: c.width, height: c.height }));
          const camera = cameraForMap(map.bounds, current.position, size.width, size.height, bounds.width < 600 ? 11 : 15), screen = project(p, camera);
          const px = bounds.x + screen.x / size.width * bounds.width, py = bounds.y + screen.y / size.height * bounds.height;
          assert(px >= bounds.x && px <= bounds.x + bounds.width && py >= bounds.y && py <= bounds.y + bounds.height, 'Exit approach must be visible for real pointer input');
          if (touch) await page.touchscreen.tap(px, py); else await page.mouse.click(px, py);
          const deadline = Date.now() + 6500;
          for (;;) {
            const at = (await save()).world; if (at.mapId !== map.id) { done = true; break; }
            if (Math.hypot(at.position.x - p.x, at.position.y - p.y) < .15) break;
            assert(Date.now() < deadline, `Travel stopped at ${JSON.stringify(at.position)} towards ${JSON.stringify(p)}`); await page.waitForTimeout(100);
          }
          if (done) break;
        }
      }
      const after = (await save()).world; assert.equal(after.mapId, exit.targetMapId);
      const arrival = maps[after.mapId].entrances.find(e => e.id === exit.targetEntranceId); assert(arrival);
      assert(Math.hypot(after.position.x - arrival.position.x, after.position.y - arrival.position.y) < .4);
      await page.locator(`[data-testid="world-viewport"][data-map="${after.mapId}"] canvas[data-rendered="true"]`).waitFor();
      await page.screenshot({ path: `docs/evidence/world/0080/${name}-laundry-entry-${map.id}-${after.mapId}.png` });
      transitions.push({ from: map.id, exit: id, to: after.mapId, arrival: after.position }); console.log(name, map.id, '->', after.mapId);
    }
    await cross('to-courtyard');
    const map = maps.courtyard;
    async function walkTo(goal) {
      let here = (await save()).world.position;
      const path = findPath(map, here, goal); assert(path.length);
      for (const waypoint of path) {
        const begin = { ...here }, steps = Math.max(1, Math.ceil(Math.hypot(waypoint.x - here.x, waypoint.y - here.y) / 3));
        for (let i = 1; i <= steps; i++) {
          here = (await save()).world.position;
          const p = { x: begin.x + (waypoint.x - begin.x) * i / steps, y: begin.y + (waypoint.y - begin.y) * i / steps };
          const canvas = page.locator('[data-testid="world-viewport"] canvas'), bounds = await canvas.boundingBox(), size = await canvas.evaluate(c => ({ width: c.width, height: c.height }));
          const screen = project(p, cameraForMap(map.bounds, here, size.width, size.height, bounds.width < 600 ? 11 : 15));
          const px = bounds.x + screen.x / size.width * bounds.width, py = bounds.y + screen.y / size.height * bounds.height;
          assert(px >= bounds.x && px <= bounds.x + bounds.width && py >= bounds.y && py <= bounds.y + bounds.height);
          if (touch) await page.touchscreen.tap(px, py); else await page.mouse.click(px, py);
          const deadline = Date.now() + 6500;
          for (;;) { const at = (await save()).world.position; if (Math.hypot(at.x - p.x, at.y - p.y) < .15) break; assert(Date.now() < deadline, 'Player must reach the real landmark viewpoint'); await page.waitForTimeout(100); }
          here = (await save()).world.position;
        }
      }
      await page.waitForTimeout(400); const arrived = (await save()).world.position;
      assert(Math.hypot(arrived.x - goal.x, arrived.y - goal.y) < .25);
    }
    const contract = await page.evaluate(async () => {
      const [{ worldMaps }, { compileLife }, { navigationFor }, { profileFor }, { sampleActor }] = await Promise.all([
        import('/src/world/registry.ts'), import('/src/world/life/routes.ts'), import('/src/world/life/navigation.ts'), import('/src/world/life/profiles.ts'), import('/src/world/characters/index.ts'),
      ]);
      const map = worldMaps.courtyard, plan = compileLife(map, navigationFor(map));
      const residents = plan.actors.filter(a => a.characterId === 'resident-laundry-neighbour');
      return { profile: profileFor('resident-laundry-neighbour'), actors: residents.map(a => ({ id: a.id, durationMs: a.durationMs, phases: a.phases })), diagnostics: plan.diagnostics, frameId: sampleActor({ characterId: 'resident-laundry-neighbour', facing: 'south', action: 'interact', posture: 'work', elapsedMs: 0, reducedMotion: false }).frameId };
    });
    assert.equal(contract.actors.length, 1, 'Registered production plan must contain the canonical resident exactly once');
    assert.equal(contract.profile.homeMap, 'courtyard'); assert.equal(contract.profile.greeting, undefined);
    assert(contract.frameId.includes('laundry-basket'), 'Published actor must carry its real basket silhouette');
    assert(contract.actors[0].phases.some(p => p.action === 'walk')); assert.equal(contract.actors[0].phases.filter(p => p.action === 'work').length, 2);
    await walkTo({ x: 34, y: 19.05 });
    const samples = [], durationMs = contract.actors[0].durationMs + 1500, start = Date.now();
    let shot = 0;
    while (Date.now() - start < durationMs) {
      if (Date.now() - start >= shot * durationMs / 5) {
        await page.screenshot({ path: `docs/evidence/world/0080/${name}-laundry-cycle-${shot}.png` });
        samples.push({ frame: shot, observedWallElapsedMs: Date.now() - start, player: (await save()).world.position }); shot++;
      }
      await page.waitForTimeout(500);
    }
    // These ordinary walks show that the two task approaches leave a usable route for the player.
    await walkTo({ x: 32.8, y: 21.8 }); await page.screenshot({ path: `docs/evidence/world/0080/${name}-laundry-jar-approach.png` });
    await walkTo({ x: 35.8, y: 12 }); await page.screenshot({ path: `docs/evidence/world/0080/${name}-laundry-clothesline-approach.png` });
    const finished = await save(); assert.equal(finished.world.mapId, 'courtyard'); assert.equal(finished.day, initial.day); assert.deepEqual(finished.player, initial.player);
    results.push({ name, sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), startFixture: 'Existing town save; entered courtyard and walked using ordinary pointer/touch input. NPC is the sole registered canonical hook, not an injected spawn.', transitions, contract, samples, ordinaryPlayerEnd: finished.world.position, errors, frames: timestamps.length, limits: 'Real production motion capture and actual player traversal. Writer must inspect task phases; independent integrated review remains required. No actor clock or position was overridden.' });
    await cdp.send('Page.stopScreencast'); await cdp.detach(); encoder.stdin.end(); await new Promise((resolve, reject) => encoder.on('close', code => code === 0 ? resolve() : reject(Error(encodingErrors.join('')))));
    await writeFile(`docs/evidence/world/0080/${name}-laundry-frame-times.json`, JSON.stringify({ outputFps: 15, source: 'Actual Chromium CDP screencast, no audio track', timestamps })); await context.close();
  }
} finally { await browser.close(); await writeFile('docs/evidence/world/0080/laundry-motion-proof.json', JSON.stringify(results, null, 2) + '\n'); }
console.log(JSON.stringify(results.map(({ name, contract, errors }) => ({ name, resident: contract.actors[0].id, durationMs: contract.actors[0].durationMs, errors })), null, 2));
