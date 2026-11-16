const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..','v2');
const filenames=['index.html','ai-sdlc-risk.html','engineering-blueprint.html','continuous-monitoring.html','independent-assurance.html'];
const chapters=['overview','risk','engineering','monitoring','assurance'];
const read=file=>fs.readFileSync(path.join(base,file),'utf8');

test('five rewritten chapters are concise and share only the canonical case context',()=>{
 for(let i=0;i<filenames.length;i++){
  const page=read(filenames[i]);
  assert.ok(page.length<(chapters[i]==='risk'?12000:9000),filenames[i]+' is too long');
  assert.match(page,new RegExp('data-chapter="'+chapters[i]+'"'));
  assert.equal((page.match(/data-scenario-root/g)||[]).length,1);
  assert.match(page,/SHARED CASE \/ FICTIONAL/);
  assert.match(page,/lib\/dedup\/key.js/);
  assert.match(page,/Two AI LOW results/);
  assert.match(page,/role="region" aria-label="Selected example detail"/);
  assert.match(page,/Evidence boundary/);
  assert.match(page,/skip" href="#main"/);
  for(const filename of filenames)assert.ok(page.includes('href="./'+filename+'"'));
  assert.doesNotMatch(page,/https?:\/\/|\/api\/challenge|data-lab=|data-scenario="pass"/);
  assert.doesNotMatch(page,/id="workflow-stages"|id="scenario-lab"|id="stage-inspector"/);
 }
});

test('all chapter interactions update information and selected controls without network or navigation',()=>{
 const script=read('guide.js');
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.doesNotMatch(script,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|window\.location|location\.replace/);
 for(const chapter of chapters){
  const buttons=[];
  const title={},summary={},status={},next={};
  const pointSlots=[{},{},{}],labelSlots=[{},{},{}];
  const picker={appendChild(button){buttons.push(button)}};
  const root={
   querySelector(selector){const map={'[data-picker]':picker,'[data-insight-title]':title,'[data-insight-summary]':summary,'[data-insight-status]':status,'[data-insight-next]':next};return map[selector]},
   querySelectorAll(selector){return selector==='[data-insight-point]'?pointSlots:selector==='[data-insight-label]'?labelSlots:[]}
  };
  const document={
   readyState:'complete',body:{dataset:{chapter}},
   querySelector(query){return query==='[data-scenario-root]'?root:null},
   createElement(tag){const el={tag,dataset:{},attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.listeners[k]=fn}};return el}
  };
  vm.runInNewContext(script,{document,window:{}});
  assert.equal(buttons.length,chapter==='engineering'?4:chapter==='monitoring'?4:chapter==='assurance'?5:3,chapter+' option count');
  assert.ok(title.textContent&&summary.textContent&&status.textContent&&next.textContent);
  assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
  const previous=title.textContent;buttons[1].listeners.click();
  assert.notEqual(title.textContent,previous);
  assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
  assert.ok(pointSlots.every(p=>typeof p.textContent==='string'&&p.textContent.length>10));
  assert.ok(labelSlots.every(p=>typeof p.textContent==='string'&&p.textContent.length>5));
 }
});

test('the V2 preview has no extra sixth chapter and leaves legacy reference content in place',()=>{
 for(const file of filenames){
  const page=read(file);
  const nav=page.match(/<nav class="chapter-nav"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav,file);
  assert.equal((nav[1].match(/<a /g)||[]).length,5);
  assert.equal((nav[1].match(/aria-current="page"/g)||[]).length,1);
  const ref='../'+file;
  assert.ok(page.includes('href="'+ref+'"'),file+' missing legacy reference');
  assert.ok(fs.existsSync(path.join(__dirname,'..',file)),ref+' target is missing');
 }
 assert.ok(fs.existsSync(path.join(base,'site.css')));
 assert.ok(fs.existsSync(path.join(base,'guide.js')));
});

test('Overview broadens the AI-SDLC premise without rebuilding the approval explorer',()=>{
 const html=read('index.html'),css=read('site.css');
 assert.match(html,/AI is changing how software gets built—and who gets to act/);
 assert.match(html,/write, test, review, and deliver software/);
 assert.match(html,/WHAT CHANGES WITH AI/);
 for(const phrase of ['Advice → Action','Small change → Wider impact','Event log → Accountability']){
  assert.ok(html.includes(phrase),phrase);
 }
 assert.equal((html.match(/class="overview-shift"/g)||[]).length,3);
 assert.equal((html.match(/data-scenario-root/g)||[]).length,1);
 assert.match(html,/Who really approved this change/);
 assert.match(html,/Start with the problem, then design the authority/);
 assert.match(html,/WORKED EXAMPLE \/ AI PR APPROVAL/);
 assert.match(css,/\.overview-shift-grid/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.doesNotMatch(html,/stakeholder matrix|framework comparison|risk scorecard/i);
});

test('Risk page presents the source Top 10 taxonomy and one bounded worked example',()=>{
 const html=read('ai-sdlc-risk.html');
 const expected=[
  'Insecure or defective AI-generated code',
  'Unauthorized AI decision-making and execution',
  'Agent identity, credential, and privilege abuse',
  'Prompt injection and agent manipulation',
  'Sensitive data, intellectual property, and secret exposure',
  'AI-enabled software supply-chain compromise',
  'False assurance from AI review and testing',
  'Loss of change integrity, traceability, and accountability',
  'High-speed propagation of failures',
  'Uncontrolled AI workflow evolution and operational dependency'
 ];
 const table=html.match(/<table class="risk-table">([\s\S]*?)<\/table>/);
 assert.ok(table,'missing top-risk table');
 assert.equal((table[1].match(/<tr>/g)||[]).length,11,'ten risks plus heading');
 assert.equal((table[1].match(/scope="row"/g)||[]).length,10);
 expected.forEach((name,i)=>{
   const first=table[1].indexOf(name);
   assert.ok(first!==-1,name+' missing from risk taxonomy');
   if(i>0)assert.ok(first>table[1].indexOf(expected[i-1]),'risks out of source order');
 });
 assert.match(html,/Editorial prioritization from the November 2026 design draft/);
 assert.match(html,/Decision rights/);
 for(const concept of ['Engineering designs and operates','Delegated management accepts','Security\/GRC challenge','IA evaluates independently'])
  assert.ok(html.includes(concept.replace('\\/','/')),concept);
 assert.equal((html.match(/data-scenario-root/g)||[]).length,1);
 assert.match(html,/id="risk-case"/);
 assert.match(html,/href="#risk-case"/);
 assert.doesNotMatch(html,/data-risk-score|weighted-risk-score|risk-register-input/);
 const css=read('site.css');
 assert.match(css,/\.risk-table/);
 assert.match(css,/@media\(max-width:700px\)/);
});

test('Engineering remains problem-first with named responsibilities and one architecture explorer',()=>{
 const html=read('engineering-blueprint.html');
 assert.match(html,/Which AI architecture is worth building/);
 for(const term of ['Actual constraint','Simplest alternative','Evidence of value','capability owner','repository or service owners','authorized management']){
  assert.ok(html.includes(term),'missing Engineering design element: '+term);
 }
 assert.equal((html.match(/data-scenario-root/g)||[]).length,1);
 assert.equal((html.match(/class="engineering-brief-questions"/g)||[]).length,1);
 assert.match(read('site.css'),/\.engineering-brief-questions/);
});

test('Monitoring prioritizes four operational signal sources and investigation triggers without invented health data',()=>{
 const html=read('continuous-monitoring.html');
 const table=html.match(/<table class="risk-table monitoring-signal-table">([\s\S]*?)<\/table>/);
 assert.ok(table,'operational signal matrix missing');
 assert.equal((table[1].match(/scope="row"/g)||[]).length,4);
 for(const term of ['Decision ↔ revision integrity','Authorization ↔ merge ↔ release','Decision quality and adjudication','Privileges, rulesets and policy drift','source coverage','not proof of a violation']){
  assert.ok(html.includes(term),'missing monitoring concept: '+term);
 }
 assert.equal((html.match(/data-scenario-root/g)||[]).length,1);
 assert.doesNotMatch(html,/1,248|186 automated approvals|release paused|connected to production telemetry/);
});

test('Assurance expands the existing lens selector to five source-defined methods, without creating an RCM builder',()=>{
 const html=read('independent-assurance.html');
 const script=read('guide.js');
 for(const term of ['FIVE COMPLEMENTARY TEST LENSES','configuration, population, negative, judgment, and period-of-reliance','Make credible evidence a by-product of engineering','Implementation status, design effectiveness']){
  assert.ok(html.includes(term),'missing Assurance emphasis: '+term);
 }
 const assurance=script.slice(script.indexOf(' assurance:{'),script.indexOf('\n }\n};',script.indexOf(' assurance:{')));
 for(const key of ["configuration","population","negative","judgment","period"]){
  assert.ok(assurance.includes("key:'"+key+"'"),key);
 }
 assert.equal((assurance.match(/key:'/g)||[]).length,5);
 assert.equal((html.match(/data-scenario-root/g)||[]).length,1);
 assert.doesNotMatch(html,/risk-score-input|rcm-builder-form|data-live-audit-conclusion/);
});
