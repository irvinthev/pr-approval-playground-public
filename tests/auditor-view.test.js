const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../auditor-view.html'),'utf8');
function mount(){
 const elements=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],{dataset:{},textContent:'',innerHTML:'',replaceChildren(...children){this.children=children;}}]));
 const buttons=['pass','split','scope','canary'].map(scenario=>({dataset:{scenario},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(name,fn){this[name]=fn;}}));
 const tabs=['engineering','audit'].map(mobileTab=>({dataset:{mobileTab},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(name,fn){this[name]=fn;}}));
 const context=vm.createContext({document:{getElementById:id=>elements[id],querySelectorAll:selector=>selector==='[data-scenario]'?buttons:selector==='[data-mobile-tab]'?tabs:[],createElement:()=>({})}});
 vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
 return {elements,buttons,tabs,context};
}
test('Auditor View scenario buttons synchronize telemetry, evidence, status and selection',()=>{
 const {elements:e,buttons}=mount();
 const expected=[['Policy Auto-Approval','AUTO-APPROVED','ITGC-CM-02'],['AI Reviews','APPROVAL PENDING','ITGC-CM-03'],['Eligibility Gates','SCOPE EXCLUDED','ITGC-CM-01'],['Canary Rollouts','ROLLED BACK','ITGC-CM-07']];
 buttons.forEach((b,i)=>{b.click();assert.equal(e.dashboard.dataset.mode,b.dataset.scenario);assert.equal(buttons.filter(x=>x.attrs['aria-pressed']==='true').length,1);assert.equal(b.attrs['aria-pressed'],'true');assert.equal(e['stage-title'].textContent,expected[i][0]);assert.equal(e['audit-status'].textContent,expected[i][1]);assert.equal(e['control-id'].textContent,expected[i][2]);assert.equal(e['testing-steps'].children.length,3);assert.equal(e.artifact.textContent,e['log-file'].textContent);const payload=JSON.parse(e['json-log'].innerHTML.replace(/<\/?span[^>]*>/g,''));assert.equal(payload.run_id,e['run-id'].textContent);});
});
test('Auditor View mobile workpaper tabs preserve scenario and update independent selection',()=>{
 const {elements:e,buttons,tabs}=mount();
 buttons[2].click();
 const before={mode:e.dashboard.dataset.mode,control:e['control-id'].textContent,log:e['json-log'].innerHTML};
 tabs[1].click();
 assert.equal(e.dashboard.dataset.mobileView,'audit');
 assert.equal(tabs[1].attrs['aria-pressed'],'true');
 assert.equal(tabs[0].attrs['aria-pressed'],'false');
 assert.equal(e.dashboard.dataset.mode,before.mode);
 assert.equal(e['control-id'].textContent,before.control);
 assert.equal(e['json-log'].innerHTML,before.log);
 tabs[0].click();
 assert.equal(e.dashboard.dataset.mobileView,'engineering');
 assert.equal(tabs[0].attrs['aria-pressed'],'true');
 assert.equal(e.dashboard.dataset.mode,before.mode);
 assert.equal(buttons.filter(x=>x.attrs['aria-pressed']==='true').length,1);
});
test('Auditor View rejects unknown states and escapes HTML in logs',()=>{
 const {elements,context}=mount();vm.runInContext("renderScenario('__proto__')",context);assert.equal(elements.dashboard.dataset.mode,'pass');
 const marked=vm.runInContext("highlightJson({value:'<img onerror=alert(1)>&'})",context);assert(!marked.includes('<img'));assert(marked.includes('&lt;img'));assert(marked.includes('&amp;'));
});
test('Assurance exposes Auditor View and both pages provide the RCM route',()=>{
 const guide=fs.readFileSync(path.join(__dirname,'../independent-assurance.html'),'utf8');assert.match(guide,/href="\.\/auditor-view.html"/);assert.match(html,/aria-label="Assurance tools"/);assert.match(html,/href="\.\/auditor-view.html" aria-current="page"/);assert.match(html,/downloads\/AI_Approval_Example_RCM.xlsx/);assert.match(html,/do not import or change the editable shared-library case used elsewhere in the playground/);
});
