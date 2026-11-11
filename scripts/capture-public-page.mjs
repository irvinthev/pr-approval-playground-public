// PR visual QA: capture the checked-out site, not the deployed GitHub Pages site.
// Locally: python3 -m http.server 4173 &
//          npm install --no-save playwright && npx playwright install chromium
//          SITE_BASE_URL=http://127.0.0.1:4173/ node scripts/capture-public-page.mjs
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:4173/';
const output = resolve('screenshots-demo');
const pages = [
  ['overview', 'index.html'],
  ['risk-management', 'ai-sdlc-risk.html'],
  ['assurance', 'independent-assurance.html'],
];
const viewports = [
  ['desktop', { width: 1280, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];
const records = [];
const failures = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const check = (ok, message) => { if (!ok) throw new Error(message); };

async function capture(page, label, response, checks = []) {
  const filename = label + '.png';
  await page.screenshot({ path: resolve(output, filename), fullPage: true, animations: 'disabled' });
  const hash = createHash('sha256').update(await readFile(resolve(output, filename))).digest('hex');
  const item = {
    name: label,
    url: page.url(),
    title: await page.title(),
    capturedAtUtc: new Date().toISOString(),
    viewport: page.viewportSize(),
    httpStatus: response.status(),
    screenshot: filename,
    sha256: hash,
    checks,
  };
  records.push(item);
  await writeFile(resolve(output, label + '.json'), JSON.stringify(item, null, 2));
  console.log('CAPTURED ' + label + ' ' + hash.slice(0, 12));
}
async function runCase(label, path, viewportName, viewport, scenario) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let response;
  try {
    const url = new URL(path, base).toString();
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    check(response?.ok(), label + ': HTTP ' + response?.status());
    check((await page.locator('h1').count()) > 0, label + ': missing primary heading');

    const checks = ['HTTP ' + response.status(), 'h1 present'];
    if (scenario === 'guided-journey') {
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/index.html') && url.searchParams.get('journey') === 'rr02'),
        page.locator('a[href*="journey=rr02#guided-investigation"]').first().click()
      ]);
      check(await page.locator('#guided-investigation').isVisible(), 'Guided journey not visible on Overview');
      check(await page.locator('[data-scenario="excluded"]').getAttribute('aria-pressed') === 'true', 'Overview scenario not selected');
      const expected = ['Change', 'Risk', 'Safeguards', 'Monitoring', 'Assurance'];
      for (let i = 0; i < expected.length; i++) {
        const current = page.locator('.guided-steps a[aria-current="step"]');
        check(await current.count() === 1, 'Missing current chapter at step ' + i);
        check((await current.innerText()).includes(expected[i]), 'Wrong chapter at step ' + i);
        check(await page.locator('.guided-local').count() === 1, 'Local content action missing at step ' + i);
        if (i === 1) check((await page.locator('#risk-selected-id').innerText()).includes('RR-02'), 'Risk scenario context not preserved');
        if (i < expected.length - 1) {
          await page.locator('.guided-next').click();
          await page.locator('#guided-investigation').waitFor({state:'visible'});
        }
      }
      check((await page.locator('.guided-completion').innerText()).includes('No actual company configuration'), 'Illustrative conclusion missing');
      const handoff = await page.locator('.guided-completion').innerText();
      check(handoff.includes('Management-to-auditor handoff'), 'Management handoff heading missing');
      check(handoff.includes('Design to explain') && handoff.includes('Evidence to prepare') && handoff.includes('Still to establish'), 'Handoff does not separate design, evidence, and unknowns');
      check(handoff.includes('auditor evaluation remains separate'), 'Independent auditor judgment missing');
      checks.push('Handoff distinguishes management demonstration from auditor evaluation');
      check(await page.locator('.guided-steps a').count() === 5, 'Five chapters not retained');
      checks.push('Full five-page guided investigation, RR-02 and illustrative conclusion');
    }
    if (scenario === 'cross-page-rr02') {
      await page.locator('[data-scenario="excluded"]').click();
      const related = page.locator('#overview-related-risk');
      check(await related.isVisible(), 'Related risk link not visible in excluded scenario');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/ai-sdlc-risk.html') && url.searchParams.get('risk') === 'RR-02' && url.hash === '#risk-explorer'),
        related.locator('a').click(),
      ]);
      check((await page.locator('#risk-selected-id').innerText()).includes('RR-02'), 'RR-02 was not restored from URL');
      check(await page.locator('[data-featured-risk="RR-02"]').getAttribute('aria-pressed') === 'true', 'RR-02 button did not reflect selection');
      checks.push('Overview exclusion → related RR-02 selected on Risk page');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/engineering-blueprint.html') && url.hash === '#technical-requirements'),
        page.locator('#risk-engineering-next').click(),
      ]);
      check((await page.locator('#technical-requirements').count()) === 1, 'Engineering target missing');
      checks.push('Risk Management → Engineering technical requirements');
    }
    if (scenario === 'monitoring-assurance-rr02') {
      const bridge = page.locator('#classification-monitoring-bridge');
      check(await bridge.isVisible(), 'Monitoring RR-02 handoff is missing');
      check((await bridge.innerText()).includes('false-low-risk'), 'Classification signal explanation missing');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/independent-assurance.html') && url.hash === '#classification-evidence-bridge'),
        bridge.locator('a[href*="classification-evidence-bridge"]').click()
      ]);
      const evidence = page.locator('#classification-evidence-bridge');
      check(await evidence.isVisible(), 'Assurance evidence handoff is hidden');
      check((await evidence.locator('.classification-evidence-grid > div').count()) === 3, 'Incomplete Assurance evidence questions');
      checks.push('Monitoring RR-02 signal → Assurance population, validation and response evidence');
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/continuous-monitoring.html') && url.hash === '#classification-monitoring-bridge'),
        evidence.locator('a[href*="classification-monitoring-bridge"]').click()
      ]);
      check(await page.locator('#classification-monitoring-bridge').isVisible(), 'Monitoring return link failed');
      checks.push('Assurance → Monitoring return link');
    }
    if (scenario === 'rr02-negative-test-covered' || scenario === 'rr02-negative-test-missed') {
      const missed = scenario.endsWith('missed');
      const sample = page.locator('#rr02-negative-test');
      check(await sample.isVisible(), 'Engineering negative test missing');
      check(await page.locator('#rr02-test-result').isHidden(), 'Test result should not be predetermined on screen');
      if (missed) await sample.locator('input[value="missed"]').check();
      // Capture the Engineering input state before execution; the final runCase
      // capture happens after navigation on the Assurance page.
      await capture(page, label + '-engineering-before', response, [...checks, 'Engineering fixture selected before execution']);
      await page.locator('#rr02-run-negative-test').click();
      check(await page.locator('#rr02-test-result').isVisible(), 'Simulation result did not appear');
      const actual = await page.locator('#rr02-observed').innerText();
      check(actual === (missed ? 'Auto-approval eligible (unsafe)' : 'Human review required'), 'Incorrect policy simulation result: ' + actual);
      check(await page.locator('#rr02-assurance-handoff').getAttribute('href') === './independent-assurance.html?rr02fixture=' + (missed ? 'missed' : 'covered') + '#rr02-negative-evidence', 'Incorrect Assurance handoff link');
      checks.push('Selected dependency fixture produces expected simulated outcome');
      // Preserve the Engineering outcome before the Assurance link changes pages.
      if (viewportName === 'mobile') {
        const widths = await page.evaluate(() => ({
          windowWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
        }));
        check(Math.max(widths.documentWidth, widths.bodyWidth) - widths.windowWidth <= 2,
          label + ': Engineering result has horizontal overflow');
      }
      await capture(page, label + '-engineering-result', response,
        [...checks, 'Engineering result visible before Assurance navigation', ...(viewportName === 'mobile' ? ['No Engineering result horizontal overflow'] : [])]);
      await Promise.all([
        page.waitForURL(url => url.pathname.endsWith('/independent-assurance.html') && url.searchParams.get('rr02fixture') === (missed ? 'missed' : 'covered') && url.hash === '#rr02-negative-evidence'),
        page.locator('#rr02-assurance-handoff').click()
      ]);
      check(await page.locator('#rr02-negative-evidence').isVisible(), 'Assurance negative test evidence missing');
      const observed = await page.locator('#rr02-evidence-observed').innerText();
      check(observed.includes(missed ? 'auto-approval eligible (unsafe)' : 'human review required'), 'Assurance observation did not preserve selected fixture');
      checks.push('Engineering-to-Assurance handoff preserves selected fixture and limitations');
    }
    if (scenario === 'risk-rr02') {
      const selected = page.locator('#risk-selected-id');
      const initialTitle = await page.locator('#risk-selected-title').innerText();
      await page.locator('[data-featured-risk="RR-02"]').click();
      check((await selected.innerText()).includes('RR-02'), 'RR-02 not selected');
      check(await page.locator('[data-featured-risk="RR-02"]').getAttribute('aria-pressed') === 'true', 'RR-02 button not pressed');
      check((await page.locator('#risk-selected-title').innerText()) !== initialTitle, 'Scenario heading did not update');
      check((await page.locator('#risk-treatment-question').innerText()).length > 15, 'Management decision did not update');
      checks.push('RR-02 scenario updates title, pressed state and decision');
      await page.locator('details.risk-deeper summary').click();
      check(await page.locator('details.risk-deeper').getAttribute('open') !== null, 'Risk details did not expand');
      check((await page.locator('#risk-safeguard').innerText()).length > 15, 'Risk safeguard missing');
      checks.push('Risk safeguards expanded');
    }
    if (scenario === 'assurance-deep-link') {
      await page.goto(new URL('independent-assurance.html#document-assessment', base).toString(), { waitUntil: 'networkidle' });
      check(await page.locator('#assurance-methodology').getAttribute('open') !== null, 'Deep-linked methodology was not opened');
      check(await page.locator('#document-assessment').isVisible(), 'Deep-linked evidence section is hidden');
      checks.push('Direct evidence deep link reveals expanded methodology');
    }
    if (scenario === 'assurance-expanded') {
      const details = page.locator('#authorization-evidence-case');
      await details.locator('summary').click();
      check(await details.getAttribute('open') !== null, 'Assurance example did not expand');
      check((await details.locator('.aec-body').innerText()).length > 100, 'Assurance example empty');
      checks.push('Authorization assurance example expanded');
    }
    if (viewportName === 'mobile') {
      const size = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth
      }));
      const overflow = Math.max(size.documentWidth, size.bodyWidth) - size.windowWidth;
      check(overflow <= 2, label + ': horizontal overflow ' + overflow + 'px');
      checks.push('No document-level horizontal overflow');
    }
    check(errors.length === 0, label + ': uncaught browser errors: ' + errors.join(' | '));
    checks.push('No uncaught page errors');
    await capture(page, label, response, checks);
  } catch (e) {
    failures.push(label + ': ' + e.message);
    console.error('FAILED ' + label + ': ' + e.message);
    if (response?.ok()) {
      // Preserve the broken state for visual investigation.
      try { await capture(page, label + '-failure', response, ['FAILED: ' + e.message]); } catch {}
    }
  } finally { await page.close(); }
}
try {
  for (const [viewportName, viewport] of viewports) {
    for (const [name, path] of pages) {
      await runCase(name + '-' + viewportName, path, viewportName, viewport, null);
    }
    await runCase('risk-rr02-expanded-' + viewportName, 'ai-sdlc-risk.html', viewportName, viewport, 'risk-rr02');
    await runCase('assurance-evidence-expanded-' + viewportName, 'independent-assurance.html', viewportName, viewport, 'assurance-expanded');
    await runCase('assurance-evidence-deep-link-' + viewportName, 'independent-assurance.html', viewportName, viewport, 'assurance-deep-link');
    await runCase('cross-page-rr02-' + viewportName, 'index.html', viewportName, viewport, 'cross-page-rr02');
    await runCase('monitoring-assurance-rr02-' + viewportName, 'continuous-monitoring.html', viewportName, viewport, 'monitoring-assurance-rr02');
    await runCase('guided-investigation-' + viewportName, 'index.html', viewportName, viewport, 'guided-journey');
    await runCase('rr02-negative-test-covered-' + viewportName, 'engineering-blueprint.html', viewportName, viewport, 'rr02-negative-test-covered');
    await runCase('rr02-negative-test-missed-' + viewportName, 'engineering-blueprint.html', viewportName, viewport, 'rr02-negative-test-missed');
  }
} finally { await browser.close(); }
const summary = {
  source: base,
  reference: process.env.GITHUB_SHA || 'local',
  capturedAtUtc: new Date().toISOString(),
  captures: records.length,
  failures,
  note: 'Static-site PR visual QA. Screenshots are review aids, not historical control evidence.'
};
await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
