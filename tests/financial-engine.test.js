const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../financial-engine.js');
const assess = (id, overrides, map) => {const change = F.makeChange(id, overrides); return {change, technical: F.assessTechnicalEligibility(change), financial: F.assessFinancialImpact(change, map)};};
const decide = (x, approval) => F.resolveAuthorization(x.technical, x.financial, x.change, approval);
test('shared dependencies reach billing and reporting without adding exposure twice', () => {
 const x = assess('shared');
 assert.deepEqual(x.financial.components, ['dedup','usage','billing','reporting']);
 assert.equal(x.financial.exposure.low, 120000); assert.equal(x.financial.exposure.high, 360000);
 assert.equal(decide(x).route, 'HUMAN_REVIEW_REQUIRED');
});
test('small or zero modeled error does not waive protected review', () => {
 const x = assess('shared', {assumptions:{monthly:1,affected:1,errorLow:0,errorHigh:0,months:1}});
 assert.equal(x.financial.exposure.high,0); assert.equal(decide(x).allowed,false);
});
test('unknown files and empty inventories never yield zero exposure or human override', () => {
 for (const files of [[], ['services/renamed-dedup/key.js']]) {
  const x = assess('unknown', {files}); assert.equal(x.financial.exposure.status,'UNKNOWN');
  assert.equal(decide(x,F.approve(x.change,x.financial)).allowed,false);
 }
});
test('mixed documentation and protected files still require review', () => {
 const x=assess('docs',{files:['docs/readme.md','lib/dedup/key.js']}); assert.equal(decide(x).allowed,false);
});
test('documentation remains eligible, other unsupported dollar templates remain unknown', () => {
 assert.equal(decide(assess('docs')).route,'AUTOMATION_ELIGIBLE');
 for(const id of ['pricing','schedule']) {const x=assess(id);assert.equal(x.financial.exposure.status,'UNKNOWN');assert.equal(decide(x).allowed,false);}
});
test('stale, incomplete or missing dependency profiles fail closed', () => {
 for (const mutate of [m=>m.nodes.usage.stale=true,m=>delete m.nodes.billing,m=>delete m.profiles.reporting,m=>delete m.nodes.usage.consumers]) {
  const m=structuredClone(F.registry);mutate(m);const x=assess('shared',{},m);assert.equal(x.financial.status,'UNRESOLVED');assert.equal(decide(x).allowed,false);
 }
});
test('invalid numeric inputs remain unknown', () => {
 for (const overrides of [{monthly:NaN},{affected:101},{errorLow:20,errorHigh:5},{months:0},{months:13},{monthly:-1},{errorHigh:Infinity},{monthly:'12000000'},{monthly:Number.MAX_VALUE,months:12,affected:100}]) {
  assert.equal(F.calculateExposure({...F.scenarios.shared.assumptions,...overrides}).status,'UNKNOWN');
 }
});
test('only qualified independent approval for exact revision and versions authorizes', () => {
 const x=assess('shared'), approval=F.approve(x.change,x.financial);
 assert.equal(decide(x,approval).route,'HUMAN_AUTHORIZED');
 for(const patch of [{actor:x.change.author},{role:'contributor'},{sha:'old'},{mappingVersion:'old'},{policyVersion:'old'}]) assert.equal(decide(x,{...approval,...patch}).allowed,false);
});
test('technical failures cannot be overridden by financial approval', () => {
 for(const patch of [{ci:false},{reviewA:'high'},{reviewB:'unavailable'}]) {const x=assess('shared',patch);assert.equal(decide(x,F.approve(x.change,x.financial)).allowed,false);}
});
test('policy downgrade requires separate policy reviewer', () => {
 const x=assess('downgrade');assert.equal(x.financial.requiredRole,'policy-reviewer');
 assert.equal(decide(x,F.approve(x.change,x.financial,'demo-reviewer','financial-reviewer')).allowed,false);
 assert.equal(decide(x,F.approve(x.change,x.financial)).allowed,true);
});
test('effective infrastructure authority matters; custodian can propose only', () => {
 for(const actor of ['contributor','approval-bot','infrastructure-operator']) assert.equal(F.attemptPolicyChange(actor,true).allowed,false);
 assert.equal(F.attemptPolicyChange('infrastructure-operator',false).allowed,true);
 assert.equal(F.attemptPolicyChange('policy-custodian').allowed,false);
 assert.equal(F.attemptPolicyChange('policy-custodian').proposed,true);
});
