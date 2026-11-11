const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('Risk Assessment deep links activate the containing tab, including shared pipeline context',()=>{
 const html=read('ai-sdlc-risk.html'),tabs=read('risk-dashboard-tabs.js');
 assert.match(html,/id="risk-tab-model"[^>]*hidden/);
 assert.ok(html.indexOf('id="risk-tab-model"')<html.indexOf('id="shared-pipeline-context"'));
 assert.match(tabs,/target\.closest\('\.risk-tab-panel'\)/);
 assert.match(tabs,/if\(!revealHashTarget\(\)\)activate\(/);
 assert.match(tabs,/addEventListener\('hashchange',revealHashTarget\)/);
 assert.match(tabs,/scrollIntoView\(\{block:'start',behavior:'auto'\}\)/);
 new vm.Script(tabs,{filename:'risk-dashboard-tabs.js'});
});
test('Risk page formatting preserves accessible horizontal navigation and light model surfaces',()=>{
 const css=read('risk-dashboard-v04.css');
 assert.match(css,/\.risk-dashboard \.risk-tabs\{flex-wrap:nowrap;overflow-x:auto/);
 assert.match(css,/\.risk-dashboard #risk-tab-model \.shared-pipeline-context\{background:#fff/);
 assert.match(css,/\.risk-dashboard #risk-tab-model \.shared-pipeline-context \.shared-stages\{display:flex;overflow-x:auto/);
 assert.match(css,/\.risk-dashboard #risk-tab-model \.operating-panel\{background:#fff/);
 assert.match(css,/@media\(max-width:780px\)/);
 assert.match(css,/\.risk-dashboard #risk-tab-model \.operating-example\{background:#f6faff/);
});
test('Risk tab formatting leaves risk assessment and reviewer logic untouched',()=>{
 const tabs=read('risk-dashboard-tabs.js'),css=read('risk-dashboard-v04.css');
 assert.doesNotMatch(tabs,/evaluateCase|approveMerge|runApproval|QualityBot|RiskBot|Braze|Appboy/);
 assert.doesNotMatch(css,/QualityBot|RiskBot|Braze|Appboy/);
});

test('mobile Risk Assessment light theme takes precedence over shared dark mobile shell',()=>{
 const base=read('site.css'),risk=read('risk-dashboard-v04.css'),html=read('ai-sdlc-risk.html');
 assert.match(base,/@media\(max-width:700px\)\{[\s\S]*?body\{background:#091321!important\}/);
 assert.match(risk,/@media\(max-width:700px\)\{body\.risk-dashboard\{background:#f1f5fb!important;color:#172844\}\}/);
 assert.match(html,/risk-dashboard-v04\.css\?v=mobile-contrast-1/);
});
