const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../story-model');
const next=(s,n)=>{for(let i=0;i<n;i++)s=S.transition(s,'next');return s;};
test('the shared-library story requires review despite two low verdicts',()=>{
 const x=S.evaluate(next(S.initial(),4));assert.equal(x.technical.eligible,true);assert.equal(x.decision.route,'HUMAN_REVIEW_REQUIRED');
});
test('the override challenge cannot grant authorization',()=>{
 const s=S.transition(next(S.initial(),3),'override');assert.match(s.feedback,/Denied/);assert.equal(S.evaluate(s).decision.allowed,false);
});
test('qualified review authorizes only the current revision',()=>{
 let s=S.transition(next(S.initial(),3),'approve');assert.equal(S.evaluate(s).decision.route,'HUMAN_AUTHORIZED');
 s=S.transition(s,'push');assert.equal(S.evaluate(s).decision.route,'BLOCKED');
 s=S.transition(s,'recheck');assert.equal(S.evaluate(s).decision.route,'HUMAN_REVIEW_REQUIRED');
 s=S.transition(s,'approve');assert.equal(S.evaluate(s).decision.route,'HUMAN_AUTHORIZED');
});
test('documentation uses automation, missing mappings never do',()=>{
 assert.equal(S.evaluate(next(S.initial('docs'),4)).decision.route,'AUTOMATION_ELIGIBLE');
 let s=next(S.initial('unknown'),4);s=S.transition(s,'approve');assert.equal(S.evaluate(s).decision.route,'UNRESOLVED');assert.equal(s.approval,null);
});
test('optional exposure inputs cannot weaken review; changes clear approval',()=>{
 let s=S.transition(S.initial(),'approve');s=S.transition(s,'share',0.1);
 assert.equal(s.approval,null);assert.equal(S.evaluate(s).decision.route,'HUMAN_REVIEW_REQUIRED');
 s=S.transition(s,'months',NaN);assert.equal(S.evaluate(s).financial.exposure.status,'UNKNOWN');assert.equal(S.evaluate(s).decision.allowed,false);
});
test('navigation stays bounded and scenario/reset clear all prior state',()=>{
 let s=S.transition(next(S.initial(),10),'approve');assert.equal(s.step,4);s=S.transition(s,'scenario','docs');assert.equal(s.step,0);assert.equal(s.approval,null);s=S.transition(s,'back');assert.equal(s.step,0);s=S.transition(s,'push');s=S.transition(s,'reset');assert.equal(s.revision,1);assert.equal(s.ci,true);
});

test('jumping between pipeline nodes never changes authorization',()=>{
 let s=S.initial();for(const value of [4,3,1,2,0]){s=S.transition(s,'goto',value);assert.equal(s.step,value);assert.equal(S.evaluate(s).decision.allowed,false);assert.equal(s.approval,null);}
 for(const value of [-1,5,NaN,'3']){const before=s;s=S.transition(s,'goto',value);assert.equal(s.step,before.step);}
});
