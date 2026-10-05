import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  const bundled = process.env.CODEX_PLAYWRIGHT_MODULE;
  if (!bundled) {
    throw new Error('Install dependencies with `npm install`, or set CODEX_PLAYWRIGHT_MODULE to a Playwright package path.');
  }
  ({ chromium } = require(bundled));
}

const fps = 30;
const seconds = 10;
const frames = fps * seconds;
const projectRoot = dirname(fileURLToPath(import.meta.url));
const output = process.env.THERMAL_CORE_FRAMES ?? '/tmp/iwrzwr-thermal-core-frames';
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(projectRoot, 'dist/exports/thermal-core.html')).href);

for (let frame = 0; frame < frames; frame++) {
  await page.evaluate(t => window.__renderFrame(t), frame / fps);
  await page.screenshot({
    path: `${output}/frame-${String(frame).padStart(4, '0')}.png`,
    type: 'png'
  });
}

await browser.close();
