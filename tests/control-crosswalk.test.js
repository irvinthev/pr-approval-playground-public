const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const page=fs.readFileSync('independent-assurance.html','utf8');
test('current Assurance mounts the connected case with evaluator dependencies in order',()=>{
 assert.match(page,/<div id="shared-case-root" hidden><\/div>/);
 const files=['financial-engine.js','case-model.js','case-ui.js'];
 const positions=files.map(f=>page.indexOf('src="./'+f));assert.ok(positions.every(p=>p>=0));assert.ok(positions[0]<positions[1]&&positions[1]<positions[2]);
 assert.match(page,/href="\.\/case\.css/);
});
test('crosswalk preserves all source-qualified identities and discloses semantic collisions',()=>{
 const c=require('../control-crosswalk');
 assert.equal(c.workbookControls.length,16);assert.equal(c.webSafeguards.length,15);assert.equal(c.objectives.length,14);
 const objectiveIds=new Set(c.objectives.map(o=>o.id)),webIds=new Set(c.webSafeguards.map(o=>o.id));
 for(const row of c.workbookControls){assert.ok(row.id.startsWith('WB16:AI-'));assert.equal(row.row,Number(row.legacyId.slice(3))+5);assert.ok(row.disposition);assert.ok(row.note);assert.ok(row.objectives.length);for(const id of row.objectives)assert.ok(objectiveIds.has(id));for(const id of row.webIds)assert.ok(webIds.has(id));}
 assert.equal(c.workbookControls.find(r=>r.legacyId==='AI-03').title,'AI evaluation');
 assert.equal(c.webSafeguards.find(r=>r.id==='WEB15:AI-03').title,'Approval Authority & SoD');
 assert.notDeepEqual(c.workbookControls.find(r=>r.legacyId==='AI-03').webIds,['WEB15:AI-03']);
 assert.match(c.limit,/related intent/i);assert.match(c.limit,/not equivalence/i);
});
test('shared Pipeline status rendering tolerates a removed optional caption',()=>{
 const vm=require('node:vm'),C=require('../case-model');const source=fs.readFileSync('case-ui.js','utf8');
 const fn=source.slice(source.indexOf('function refreshPipeline(){'),source.indexOf('window.SharedCaseUI='));
 const nodes=Array.from({length:7},()=>({dataset:{},status:{textContent:''},querySelector(){return this.status;}}));
 const elements=Object.fromEntries(['scenario','run','branch','route','announcement'].map(id=>[id,{value:id==='scenario'?'shared':'',textContent:'',hidden:false}]));
 const hint={textContent:''},auth={textContent:''};const current=C.replay(['CHECKS','APPROVE','PUSH']);
 const context={C,current,isJourney:true,error:'',friendly:{STALE:'Needs renewal'},labels:{CHECKS:'Fresh checks'},renderReasoning(){},document:{getElementById(id){return elements[id]},querySelector(s){if(s==='.head .caption'||s==='#pipeline .node[aria-pressed=true]')return null;if(s==='#pipeline-section .hint')return hint;if(s==='#pipeline .node[data-step="3"] strong')return auth;throw Error(s)},querySelectorAll(){return nodes;}}};
 vm.runInNewContext(fn+';refreshPipeline();',context);
 assert.equal(nodes[3].dataset.state,'blocked');assert.equal(nodes[3].status.textContent,'Failed / stale');assert.match(elements.route.textContent,/case-revision-B/);
});
test('current web RCM export includes its source namespace without renumbering legacy IDs',()=>{
 const rcm=fs.readFileSync('rcm-view.html','utf8');
 const {buildRows}=require('../rcm-export'),crosswalk=require('../control-crosswalk');
 const sample={id:'AI-03',domain:'Access',title:'Approval Authority & SoD',risk:'Illustrative',activity:'Proposed',evidence:'Requested',test:'Illustrative',framework:'Example',scenario:'pass'};
 const [head,row]=buildRows([sample],crosswalk);
 assert.equal(row[head.indexOf('Source namespace')],'WEB15');
 assert.equal(row[head.indexOf('Qualified ID')],'WEB15:AI-03');
 assert.equal(row[head.indexOf('ID')],'AI-03');
 assert.match(rcm,/RcmExport\.buildRows\(controls,window\.ControlCrosswalk\)/);
 assert.ok(rcm.indexOf('control-crosswalk.js?v=inventory-1')<rcm.indexOf('rcm-export.js?v=dp06-1'));
 assert.match(rcm,/id="inventory-crosswalk"/);
 const ui=fs.readFileSync('control-crosswalk-ui.js','utf8');assert.match(ui,/textContent=text/);assert.doesNotMatch(ui,/innerHTML\s*=/);
});
