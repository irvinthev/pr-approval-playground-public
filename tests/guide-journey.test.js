const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const G=require('../guide-model');
function complete(id){let c=G.initial(id);for(const action of ['REVIEW','AUTHORIZE','BUILD','RELEASE','DEPLOY','MONITOR'])c=G.transition(c,action);return c;}
test('all three journeys finish with linked authorization, artifact, release and monitor records',()=>{
 for(const id of Object.keys(G.scenarios)){const c=complete(id),x=G.evaluate(c);assert.equal(x.deployment,'Simulated deployment recorded');assert.equal(x.monitoring,'Reconciled within example');assert.equal(x.authorization.kind,id==='happy'?'POLICY':'HUMAN');assert.equal(x.build.revision,x.revision);assert.equal(x.releaseRecord.digest,x.build.digest);assert.equal(x.deploymentRecord.authorizationId,x.authorization.recordId);assert.equal(x.authorization.revision,x.revision);}
});
test('navigation does not authorize, and required steps cannot be skipped',()=>{
 const c=G.initial('protected'),before=JSON.stringify(c);for(let i=0;i<7;i++){G.selection('?scenario=protected&step='+i);assert.equal(JSON.stringify(c),before);}for(const a of ['AUTHORIZE','BUILD','RELEASE','DEPLOY','MONITOR'])assert.throws(()=>G.transition(c,a));
});
test('nonqualifying AI result takes human route without requiring a favorable rerun',()=>{let c=G.transition(G.initial('review'),'REVIEW');assert.equal(G.evaluate(c).authorization,null);c=G.transition(c,'AUTHORIZE');const x=G.evaluate(c);assert.equal(x.reviewB,'HIGH');assert.equal(x.authorization.kind,'HUMAN');assert.equal(x.release,'Awaiting trusted build');});
test('URL state replays events, rejects injected conclusions and does not default invalid imports to happy',()=>{
 const c=complete('protected');assert.deepEqual(G.decode(G.encode(c)),c);
 for(const p of [{schemaVersion:2,scenario:'happy',events:['DEPLOY']},{schemaVersion:2,scenario:'happy',events:[],authorized:true},{schemaVersion:2,scenario:'__proto__',events:[]}])assert.throws(()=>G.decode('#guide='+encodeURIComponent(JSON.stringify(p))));
 assert.throws(()=>G.decode('#guide=%'));assert.throws(()=>G.decode('#guide='+'x'.repeat(17000)));assert.throws(()=>G.initial('bad'));assert.throws(()=>G.selection('?scenario=bad'));
});
test('worked monitors detect mismatches without claiming deployment prevention',()=>{
 const x=G.evaluate(complete('protected'));for(let i=0;i<7;i++){const m=G.monitor(i,x);assert.ok(m.rule&&m.sources&&m.cadence&&m.rows.length);assert.ok(m.owner&&m.response);}
 const scope=G.monitor(1,x,{automaticIssued:true});assert.equal(scope.status,'EXCEPTION');
 const release=G.monitor(5,x,{observedDigest:'unapproved'});assert.equal(release.status,'EXCEPTION');assert.match(release.limitation,/does not prove prevention/);
 const ai=G.monitor(2,x,{severeFalseApprovals:1});assert.equal(ai.status,'EXCEPTION');assert.match(ai.response,/Suspend/);
});
test('every stage maps to stable RCM and library IDs',()=>{
 const controls=fs.readFileSync(require.resolve('../control-matrix.html'),'utf8');for(const s of G.stages){assert.ok(s.rcmIds.length);for(const id of s.rcmIds)assert.match(id,/^AI-(0[1-9]|1[0-6])$/);for(const id of s.libraryIds)assert.ok(controls.includes('id="control-'+id+'"'));}
});
test('primary Assurance cannot load the legacy case renderer',()=>{const html=fs.readFileSync(require.resolve('../independent-assurance.html'),'utf8');assert.doesNotMatch(html,/<script src="\.\/case-ui\.js/);});
