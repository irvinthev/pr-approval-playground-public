const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function crosswalk(){const context={};vm.runInNewContext(read('assurance-rcm-crosswalk.js'),context);return context.AssuranceRcmCrosswalk;}
test('all 15 RCM controls exist once in crosswalk master definitions',()=>{
 const source=read('rcm-view.html'),json=source.match(/const controls=(\[[^\n]+?\]);/);
 assert.ok(json,'RCM master data available');
 const rcm=JSON.parse(json[1]),cross=crosswalk();
 assert.equal(rcm.length,15);
 assert.deepEqual(Object.keys(cross.controls).sort(),rcm.map(c=>c.id).sort());
 for(const c of rcm){
  assert.equal(cross.controls[c.id].name,c.title,c.id+' title');
  assert.ok(cross.controls[c.id].primary,c.id+' primary stage');
 }
});
test('every RCM control belongs to at least one proposed assurance domain',()=>{
 const cross=crosswalk(),seen=new Set(),keys=['governance','agent','policy','evaluation','authorization','monitoring'];
 assert.deepEqual(Object.keys(cross.domains),keys);
 for(const [key,domain] of Object.entries(cross.domains)){
  assert.ok(domain.controls.length>0,key);
  for(const id of domain.controls){assert.ok(cross.controls[id],id);seen.add(id)}
  for(const property of ['change','testing','operation'])assert.ok(domain[property].length>50,key+'/'+property);
  assert.ok(domain.stages.length>0,key+' stages');
 }
 assert.deepEqual([...seen].sort(),Object.keys(cross.controls).sort());
});
test('six-domain assurance explorer reuses one crosswalk, shows cross-cutting checks and retains independent assurance content',()=>{
 const html=read('independent-assurance.html');
 assert.match(html,/src="\.\/assurance-rcm-crosswalk\.js\?v=1"/);
 assert.ok(html.indexOf('assurance-rcm-crosswalk.js?v=1')<html.indexOf('const domains=['));
 for(const id of ['ace-picker','ace-selected','ace-rcm-crosswalk','ace-rcm-list','ace-crosscut-cards','ace-footer','prelaunch-validation'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/crosswalk\.domains\[d\.key\]/);
 assert.match(html,/a\.href='\.\/rcm-view\.html#control-'\+id/);
 assert.match(html,/\['Change Management','change'\]/);
 assert.match(html,/\['Testing & Validation','testing'\]/);
 assert.match(html,/\['Operating Effectiveness','operation'\]/);
 assert.match(html,/Grouping controls into these six domains is an illustrative association/);
});
test('downloadable control map describes six domains and cross-cutting assurance without inventing six RCM controls',()=>{
 const svg=read('assurance-control-map.svg');
 assert.match(svg,/viewBox="0 0 1600 1180"/);
 for(const label of ['Cross-cutting assurance requirements','Change Management','Testing &amp; Validation','Operating Effectiveness','Control domain 1','Control domain 6','Directly controlled','Governed or monitored','Outside direct control'])assert.ok(svg.includes(label),label);
 assert.doesNotMatch(svg,/Management control [1-6]|Independent test [1-6]/);
 assert.match(svg,/RCM domain associations are proposed/);
});
