'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Story=require('../story-model.js');
test('excluded repository never uses automated authorization',()=>{
 const x=Story.evaluate(Story.initial('outside'));
 assert.equal(x.technical.eligible,false);
 assert.equal(x.decision.allowed,false);
 assert.equal(x.decision.route,'BLOCKED');
 assert.match(x.decision.reason,/allowlist/i);
});
test('allowlisted shared-service change routes to financial reviewer',()=>{
 const x=Story.evaluate(Story.initial('billingImpact'));
 assert.equal(x.technical.eligible,true);
 assert.equal(x.financial.status,'REVIEW_REQUIRED');
 assert.equal(x.decision.route,'HUMAN_REVIEW_REQUIRED');
});
test('unavailable dependency map is unresolved, not low impact',()=>{
 const x=Story.evaluate(Story.transition(Story.initial('billingImpact'),'visibility','unknown'));
 assert.equal(x.financial.status,'UNRESOLVED');
 assert.equal(x.decision.allowed,false);
 assert.equal(x.decision.route,'UNRESOLVED');
});
test('known safe dependency mapping permits conditional automation',()=>{
 const x=Story.evaluate(Story.transition(Story.initial('billingImpact'),'visibility','none'));
 assert.equal(x.financial.status,'ELIGIBLE');
 assert.equal(x.decision.route,'AUTOMATION_ELIGIBLE');
});
test('new revision clears human authorization',()=>{
 let s=Story.initial('billingImpact');s=Story.transition(s,'approve');
 assert.equal(Story.evaluate(s).decision.route,'HUMAN_AUTHORIZED');
 s=Story.transition(s,'push');
 assert.equal(s.approval,null);
 assert.equal(Story.evaluate(s).decision.allowed,false);
});
