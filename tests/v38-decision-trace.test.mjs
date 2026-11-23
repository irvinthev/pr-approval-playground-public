import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Test the production source; do not replicate the decision algorithm here.
const source=readFileSync(new URL('../v2/decision-trace.js',import.meta.url),'utf8');
const window={};
runInNewContext(source,{window,Date,Math});
const D=window.FGDecision;
const fromMode=(mode,existing)=> {
 const m=D.modes[mode];
 return D.decisionFromFields({
  mode,title:m.title,decider:m.decider,executor:m.executor,scope:m.scope,
  alternatives:m.alternatives.join('\n')
 },existing);
};
const observation=(status)=>({
 id:'observation-1',status,result:status==='support'?'Unauthorized action rejected':'Unauthorized action succeeded',
 source:'synthetic test trace',scope:'one GitHub identity, endpoint and PR revision',
 attribution:'fictional test engineer'
});
const claim=(status)=>({id:'claim-1',text:'The delegated authorization boundary is enforced',observations:status?[observation(status)]:[]});

test('three architectures preserve distinct engineering decisions and authority boundaries',()=>{
 const a=['fasttrack','execution','autonomous'].map(mode=>D.summarize(fromMode(mode)));
 assert.equal(new Set(a.map(x=>x.question)).size,3);
 assert.equal(new Set(a.map(x=>x.authority.decider)).size,3);
 assert.equal(new Set(a.map(x=>x.authority.executor)).size,3);
 assert.ok(a.every(x=>x.alternatives.length===3));
});

test('different observed evidence produces different briefs without approving an architecture',()=>{
 const fast=fromMode('fasttrack'); fast.claims=[claim()];
 const exec=fromMode('execution'); exec.claims=[claim('support')];
 const auto=fromMode('autonomous'); auto.claims=[claim('contradict')];
 const results=[fast,exec,auto].map(D.summarize);
 assert.match(results[0].claims[0].assessment.label,/Unresolved/);
 assert.match(results[1].claims[0].assessment.label,/Reported support/);
 assert.match(results[2].claims[0].assessment.label,/Contradicted/);
 assert.deepEqual(Array.from(results[0].unresolved),['claim-1']);
 assert.deepEqual(Array.from(results[2].contradictions),['claim-1']);
 assert.ok(results.every(x=>!('approved' in x)&&!('goNoGo' in x)));
 assert.ok(results.every(x=>x.evidenceBoundary.includes('unverified')));
});

test('reported contradictions override supporting observations in a mixed result',()=>{
 const c=claim('support');c.observations.push({...observation('contradict'),id:'observation-2'});
 const result=D.classify(c);
 assert.match(result.label,/Conflicting/);
 assert.equal(result.contrary,1);
 assert.equal(result.supportive,1);
 assert.equal(result.verified,false);
});

test('same authority and decision retain working evidence and management entries',()=>{
 const original=fromMode('execution');
 original.claims=[claim('support')];
 original.management={decision:'pilot',owner:'fictional manager',rationale:'restricted scope'};
 const same=fromMode('execution',original);
 assert.equal(same.id,original.id);
 assert.equal(same.claims.length,1);
 assert.equal(same.management.decision,'pilot');
});

test('changing any component of authority invalidates old evidence and management decision',()=>{
 const original=fromMode('execution');
 original.claims=[claim('support')];
 original.management={decision:'approved',owner:'fictional manager',rationale:'tested previous scope'};
 for(const key of ['decider','executor','scope']){
  const m=D.modes.execution;
  const changed=D.decisionFromFields({
   mode:'execution',title:m.title,decider:m.decider,executor:m.executor,scope:m.scope,
   alternatives:m.alternatives.join('\n'),[key]:'materially different '+key
  },original);
  assert.notEqual(changed.id,original.id,key);
  assert.equal(changed.claims.length,0,key);
  assert.equal(changed.management.decision,'',key);
 }
});

test('changing architecture or decision question invalidates old evidence',()=>{
 const initial=fromMode('fasttrack');initial.claims=[claim('support')];
 const switched=fromMode('autonomous',initial);
 assert.equal(switched.claims.length,0);
 const m=D.modes.fasttrack;
 const retitled=D.decisionFromFields({mode:'fasttrack',title:'A different specific decision',decider:m.decider,executor:m.executor,scope:m.scope,alternatives:m.alternatives},initial);
 assert.equal(retitled.claims.length,0);
});

test('export preserves source limits and never claims observation verification',()=>{
 const d=fromMode('execution');d.claims=[claim('support')];
 const record=D.exportRecord(d,{authority:'execution'});
 assert.equal(record.schema,'field-guide-decision-record-v1');
 assert.equal(record.brief.claims[0].assessment.verified,false);
 assert.match(record.disclaimer,/does not authenticate/);
});
