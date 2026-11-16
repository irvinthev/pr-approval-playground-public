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
  assert.ok(page.length<9000,filenames[i]+' is too long');
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
  assert.ok(buttons.length>=3,chapter);
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
