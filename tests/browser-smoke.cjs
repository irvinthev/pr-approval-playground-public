// Optional integration test: requires Playwright and its Chromium browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']} : {})});
 const page = await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[], external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 assert.equal(await page.locator('#story').isVisible(),true);
 assert.equal(await page.locator('[data-tab]').count(),3);
 assert.equal(await page.locator('[data-pipeline]').count(),6);
 await page.locator('[data-pipeline="outcome"]').click();assert.match(await page.locator('#story-verdict').textContent(),/Independent human review still required/);
 assert.equal(await page.locator('#pipe-outcome-state').textContent(),'On hold');
 await page.locator('[data-pipeline="authority"]').click();await page.locator('#story-authorize').click();assert.equal(await page.locator('#pipe-outcome-state').textContent(),'Eligible · not deployed');
 await page.locator('#story-reset').click();
 await page.locator('[data-pipeline="technical"]').focus();await page.keyboard.press('Enter');assert.match(await page.locator('#story-title').textContent(),/technical reviews establish/);
 await page.locator('[data-pipeline="scope"]').click();assert.equal(await page.locator('[data-pipeline="scope"]').getAttribute('aria-pressed'),'true');
 await page.locator('#story-reset').click();

 await page.locator('#story-next').click();await page.locator('#story-next').click();
 assert.equal(await page.locator('#story-impact').isVisible(),true);
 assert.equal(await page.locator('#story-impact').evaluate(el=>el.open),false);
 await page.locator('#story-next').click();await page.locator('#story-override').click();
 assert.match(await page.locator('#story-feedback').textContent(),/Denied/);
 await page.locator('#story-authorize').click();await page.locator('#story-next').click();
 assert.match(await page.locator('#story-verdict').textContent(),/Authorized through independent human review/);
 await page.locator('#story-push').click();assert.match(await page.locator('#story-verdict').textContent(),/Fresh technical validation/);
 await page.locator('#story-recheck').click();assert.match(await page.locator('#story-verdict').textContent(),/Independent human review still required/);
 await page.locator('#story-review-again').click();assert.match(await page.locator('#story-verdict').textContent(),/Authorized through/);
 for(const [id,expected] of [['docs',/Eligible for the automated route/],['unknown',/Resolve the missing dependency mapping/]]){
  await page.locator('#story-case').selectOption(id);for(let i=0;i<4;i++)await page.locator('#story-next').click();assert.match(await page.locator('#story-verdict').textContent(),expected);
 }
 await page.locator('#story-case').selectOption('shared');

 await page.locator('[data-tab="sandbox"]').click();
 await page.locator('[data-open-section="financial"]').click();
 assert.equal(await page.locator('#financial').isVisible(),true);
 assert.equal(await page.locator('#fin-exposure').textContent(),'$120,000–$360,000');
 assert.equal(await page.locator('#fin-decision').textContent(),'HUMAN REVIEW REQUIRED');
 await page.locator('#fin-approve').click();
 assert.equal(await page.locator('#fin-decision').textContent(),'HUMAN AUTHORIZED');
 await page.locator('#fin-push').click();
 assert.equal(await page.locator('#fin-decision').textContent(),'BLOCKED');
 await page.locator('#fin-ci').check();
 assert.equal(await page.locator('#fin-decision').textContent(),'HUMAN REVIEW REQUIRED');
 await page.locator('#fin-error-high').fill('2');
 assert.equal(await page.locator('#fin-exposure').textContent(),'Unknown — not zero');
 await page.locator('#fin-reset').click();
 for(const [id,route] of [['docs','AUTOMATION ELIGIBLE'],['pricing','HUMAN REVIEW REQUIRED'],['schedule','HUMAN REVIEW REQUIRED'],['unknown','UNRESOLVED'],['downgrade','HUMAN REVIEW REQUIRED'],['shared','HUMAN REVIEW REQUIRED']]) {
  await page.locator('#fin-scenario').selectOption(id);assert.equal(await page.locator('#fin-decision').textContent(),route);
 }
 await page.locator('#fin-mapping').selectOption('stale');assert.equal(await page.locator('#fin-decision').textContent(),'UNRESOLVED');
 await page.locator('#fin-reset').click();
 const downloadPromise=page.waitForEvent('download');await page.locator('#fin-record').evaluate(el=>el.parentElement.open=true);await page.locator('#fin-export').click();
 const download=await downloadPromise;assert.equal(download.suggestedFilename(),'fictional-financial-impact.json');
 await page.locator('#fin-record').evaluate(el=>el.parentElement.open=false);
 await page.locator('#fin-actor').evaluate(el=>el.parentElement.open=true);
 await page.locator('#fin-actor').selectOption('infrastructure-operator');await page.locator('#fin-independent').uncheck();await page.locator('#fin-attempt').click();
 assert.match(await page.locator('#fin-attempt-result').textContent(),/bypass possible/);
 await page.locator('#fin-independent').check();await page.locator('#fin-attempt').click();assert.match(await page.locator('#fin-attempt-result').textContent(),/Denied/);
 await page.locator('#fin-actor').evaluate(el=>el.parentElement.open=false);
 if(process.env.SMOKE_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SMOKE_SCREENSHOT_DIR,'financial-desktop.png'),fullPage:true});
 await page.locator('#fin-race').click();
 for(let i=0;i<7;i++)await page.locator('#race-next').click();
 let record=JSON.parse(await page.locator('#race-json').textContent());assert.equal(record.mergeAuthorized,false);assert.equal(record.decision,'HUMAN REVIEW REQUIRED');
 await page.locator('#race-all').click();record=JSON.parse(await page.locator('#race-json').textContent());assert.equal(record.mergeAuthorized,true);
 for(const id of ['financialPush','financialMapping']) {await page.locator('#race-scenario').selectOption(id);await page.locator('#race-all').click();record=JSON.parse(await page.locator('#race-json').textContent());assert.equal(record.mergeAuthorized,false);assert.equal(record.decision,'HUMAN REVIEW REQUIRED');}
 await page.locator('#race-scenario').selectOption('financial');await page.locator('#race-policy-shadow').check();await page.locator('#race-all').click();assert.equal(JSON.parse(await page.locator('#race-json').textContent()).mergeAuthorized,false);await page.locator('#race-policy-shadow').uncheck();
 // Existing Approval Race and each primary/secondary section remain usable.
 for(const [id,merged] of [['routine',true],['push',false],['disagreement',false],['policy',false]]) {await page.locator('#race-scenario').selectOption(id);await page.locator('#race-all').click();assert.equal(JSON.parse(await page.locator('#race-json').textContent()).mergeAuthorized,merged);}
 for(const id of ['builder','control-lab','financial','approval-race','investigate','library','journey','simulator','policy','discovery','access','operations','results']) {await page.selectOption('#sandbox-activity',id);assert.equal(await page.locator('#'+id).isVisible(),true);}
 await page.locator('[data-tab="reference"]').click();for(let i=0;i<3;i++)await page.locator('#secondary-nav button').nth(i).click();
 await page.locator('[data-tab="story"]').click();
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(process.env.SMOKE_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SMOKE_SCREENSHOT_DIR,'financial-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await browser.close();console.log('Browser smoke passed: clickable pipeline and keyboard navigation, three guided stories, all six lab cases, independent approval, stale data, export, authority simulation, three financial races, four legacy races, navigation, mobile overflow, no JS errors or external requests.');
})().catch(e=>{console.error(e);process.exit(1)});
