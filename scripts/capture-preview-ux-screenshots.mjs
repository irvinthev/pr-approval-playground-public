// Capture the actual protected Vercel deployment's UI using deterministic fictional fixture data.
// We intercept only the private challenge API; deployed HTML/CSS/JS are loaded from Vercel.
// No Gemini calls, tokens, or private scenario data are captured in artifacts.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const input=process.env.UX_PREVIEW_URL;
const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if(!input)throw new Error('UX_PREVIEW_URL is required');
if(!bypass)throw new Error('Set VERCEL_AUTOMATION_BYPASS_SECRET as a GitHub Actions secret');
const parsed=new URL(input);
if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.port||
   !/^ai-sdlc-challenge-agent-[a-z0-9-]+-irvlife23\.vercel\.app$/.test(parsed.hostname))
  throw new Error('Only the exact Braze Challenge Lab Vercel project preview hostname is permitted');
const preview=new URL('/private-challenge.html',parsed.origin);
const output=resolve('screenshots-vercel');
await mkdir(output,{recursive:true});
const sample={
 mode:'live-model',
 continuityReceipt:'fixture-only-not-signed',
 facts:[{support:'explicit-user-statement',statement:'Fictional team wants to reduce low-risk PR review latency.'}],
 conclusions:[{
   basisType:'engineering-judgment',
   scenarioBasis:'The team proposes AI auto approval and CODEOWNERS.',
   application:'CODEOWNERS identifies reviewers; it does not grant approval. Compare decision authority before choosing GitHub execution mechanisms.',
   openQuestion:'Which effective branch rules and credentials apply to the repository?',
   citations:[]
 }],
 alternatives:[
   'Human decides and submits an approval, supported by better review routing.',
   'Human explicitly authorizes an agent to submit the review for a specified revision.',
   'AI decides and submits approval within independently enforced eligibility boundaries.'
 ],
 engineeringReferences:[
   {id:'GH-CODEOWNERS',title:'About code owners',publisher:'GitHub',kind:'technical-documentation',
    reviewedAsOf:'2026-11-14',url:'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners',
    modelUsed:true,limits:'Configuration does not prove effective rules for a particular repository.'},
   {id:'GH-REVIEWS-API',title:'REST API: pull request reviews',publisher:'GitHub',kind:'technical-documentation',
    reviewedAsOf:'2026-11-14',url:'https://docs.github.com/en/rest/pulls/reviews',
    modelUsed:true,limits:'API support does not establish who made the underlying approval decision.'}
 ],
 challenges:[
   {question:'Who actually makes the approval decision?',reason:'Decision authority differs from API submission.',tests:['Identify approver identity and revision','Compare existing review quality against approval latency'],alternatives:['Review routing','Agent-executed human decision']},
   {question:'What prevents stale approval?',reason:'Approval should refer to the intended revision.',tests:['New commit after review','Effective branch rules'],alternatives:['Dismiss stale reviews']}
 ],
 unknowns:['Effective GitHub branch rules','Credential and tool execution paths','Current review latency'],
 approvalOutcomes:[]
};
const scenarios=[
 {name:'mobile',width:390,height:844,scale:1},
 {name:'desktop',width:1440,height:900,scale:1}
];
const captured=[];
const checks=[];
const browser=await chromium.launch({headless:true});
function check(value,message){if(!value)throw new Error(message);checks.push(message)}
try {
 for(const config of scenarios){
   const context=await browser.newContext({
     viewport:{width:config.width,height:config.height},deviceScaleFactor:config.scale,
     reducedMotion:'reduce'
   });
   // Only attach the sensitive bypass header to this exact Vercel origin.
   // Global extraHTTPHeaders would also send it to unrelated third-party requests.
   await context.route('**/*',async route=>{
     const requestUrl=new URL(route.request().url());
     if(requestUrl.origin!==preview.origin)return route.continue();
     return route.continue({headers:{
       ...route.request().headers(),
       'x-vercel-protection-bypass':bypass,
       'x-vercel-set-bypass-cookie':'true'
     }});
   });
   // Intercept private API requests to avoid real provider calls or tokens.
   await context.route('**/api/challenge-session',route=>route.fulfill({
     status:200,contentType:'application/json',body:JSON.stringify({active:false})
   }));
   await context.route('**/api/challenge',route=>route.fulfill({
     status:200,contentType:'application/json',body:JSON.stringify(sample)
   }));
   const page=await context.newPage();
   const pageErrors=[];
   page.on('pageerror',error=>pageErrors.push(error.message));
   const result=await page.goto(preview.href,{waitUntil:'domcontentloaded',timeout:45000});
   check(result?.status()===200,config.name+' deployment returned HTTP 200');
   check((await page.locator('h1').innerText()).includes('Compare.'),config.name+' received V6 workspace, not login or an older page');
   check((await page.locator('#tab-architecture').count())===1,config.name+' interactive tabs present');
   async function screenshot(label,fullPage=false){
     const filename=config.name+'-'+label+'.png';
     await page.screenshot({path:resolve(output,filename),animations:'disabled',fullPage});
     captured.push({file:filename,viewport:config.name,width:config.width,height:config.height,state:label,fullPage});
   }
   await screenshot('scenario');
   await page.locator('#token').fill('fictional-ux-fixture-token');
   await page.locator('#scenario').fill('Fictional engineering team wants to eliminate low-risk PR review bottlenecks with GitHub CODEOWNERS and two AI reviewers. Compare human, delegated and autonomous approval authority.');
   await page.locator('#ask').click();
   await page.locator('#result').waitFor({state:'visible',timeout:15000});
   check(await page.locator('#workspace-architecture').isVisible(),config.name+' architecture visible after mocked response');
   await page.locator('#result').scrollIntoViewIfNeeded();
   await screenshot('architecture');
   if(config.name==='mobile'){
     for(const model of ['human','delegated','autonomous']){
       await page.locator('.model-selector [data-model="'+model+'"]').click();
       check(await page.locator('.model-card.'+model).isVisible(),'mobile model '+model+' is selectable');
       await screenshot('model-'+model);
     }
   }
   await page.locator('#tab-risk').click();
   check(await page.locator('#workspace-risk').isVisible(),config.name+' risk tab works');
   await screenshot('risk');
   await page.locator('#tab-evidence').click();
   check(await page.locator('#workspace-evidence').isVisible(),config.name+' evidence tab works');
   if(await page.locator('#engineering-details').count())await page.locator('#engineering-details summary').click();
   await screenshot('evidence');
   await page.locator('#tab-challenge').click();
   check(await page.locator('#workspace-challenge').isVisible(),config.name+' challenge tab works');
   await screenshot('challenge');
   await page.locator('#workspace-challenge [data-challenge="assumptions"]').click();
   await page.locator('#result').waitFor({state:'visible',timeout:15000});
   check((await page.locator('#turncount').innerText()).includes('1 of 6'),config.name+' one-click challenge submitted a follow-up using fixture API');
   await page.locator('#tab-challenge').click();
   await screenshot('challenge-followup');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   check(overflow<=2,config.name+' no horizontal page overflow ('+overflow+'px)');
   check(pageErrors.length===0,config.name+' no browser script errors');
   await context.close();
 }
 const metadata={
   capturedAtUtc:new Date().toISOString(),
   previewHost:preview.hostname,
   gitSha:process.env.UX_GIT_SHA||'not supplied',
   fixture:true,
   note:'Real Vercel-deployed HTML/CSS/JS. Private Gemini API and browser session are intercepted with fictional test responses. Screenshots are UX fixtures, NOT live model output or tested platform approval enforcement.',
   screenshots:captured,checks
 };
 await writeFile(resolve(output,'manifest.json'),JSON.stringify(metadata,null,2));
 const cards=captured.map(x=>'<article><img src="'+x.file+'" alt="'+x.viewport+' '+x.state+'"><div>'+x.viewport+' · '+x.state+'</div></article>').join('');
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Challenge Lab · deployed UX screenshots</title><style>body{background:#091b2d;color:#eaf5fb;font:15px system-ui;padding:24px;margin:0}h1{margin:0 0 8px}p{max-width:840px;color:#b5d0e1}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px}article{background:#12334a;padding:12px;border:1px solid #527387;border-radius:14px;min-width:0}img{width:100%;border-radius:9px;display:block}article div{padding:8px 0}</style><h1>Vercel Preview · UX screenshots</h1><p>Real deployed UI, fictional API fixture. Browser session and model responses are mocked. No live Gemini requests or private data.</p><main>'+cards+'</main></html>';
 await writeFile(resolve(output,'index.html'),html);
 console.log('Captured '+captured.length+' screenshot fixtures from '+preview.hostname);
 console.log('Validated: '+checks.length+' interaction/viewport checks');
} finally {
 await browser.close();
}
