// Optional demonstration: capture public pages with Playwright, no credentials.
// Usage: npm install --no-save playwright && npx playwright install chromium
//        node scripts/capture-public-page.mjs
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = 'https://irvinthev.github.io/pr-approval-playground-public/';
const pages = [
  ['overview', 'index.html'],
  ['risk-management', 'ai-sdlc-risk.html'],
  ['assurance', 'independent-assurance.html'],
];
const out = resolve('screenshots-demo');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, file] of pages) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = new URL(file, base).toString();
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || !response.ok()) throw new Error(`Could not load ${url}: HTTP ${response?.status()}`);
    const screenshotFile = resolve(out, `${name}.png`);
    await page.screenshot({ path: screenshotFile, fullPage: true, animations: 'disabled' });
    const hash = createHash('sha256').update(await readFile(screenshotFile)).digest('hex');
    const metadata = {
      sourceUrl: url,
      finalUrl: page.url(),
      pageTitle: await page.title(),
      httpStatus: response.status(),
      capturedAtUtc: new Date().toISOString(),
      viewport: { width: 1280, height: 900 },
      screenshot: `${name}.png`,
      sha256: hash,
      pageErrors: errors,
      limitation: 'Public demo capture only; not evidence of historical control operation.'
    };
    await writeFile(resolve(out, `${name}.json`), JSON.stringify(metadata, null, 2));
    console.log(`Captured ${name}: ${hash.slice(0, 12)}...`);
    await page.close();
  }
} finally {
  await browser.close();
}
