const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=require('../assurance-data.js'),{initialStage}=require('../assurance.js');
const root=path.resolve(__dirname,'..');
test('assurance stage order matches the live pipeline',()=>{
 const pipeline=fs.readFileSync(path.join(root,'experience.html'),'utf8');
 const titles=[...pipeline.matchAll(/<button class="node"[^>]*>[\s\S]*?<strong>(.*?)<\/strong>/g)].map(m=>m[1]);
 assert.deepEqual(data.stages.map(s=>s.title),titles);
});
test('existing inbound assurance links still select a relevant stage and retain their procedures',()=>{
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const m of html.matchAll(/independent-assurance\.html\?area=([A-Z]+)/g)){
   const id=m[1],stage=initialStage('?area='+id,data);
   assert.ok(Object.hasOwn(data.legacy,id),file+': '+id);
   assert.ok(data.stages[stage].areas.includes(id),file+': '+id+' loses its detailed procedure');
  }
 }
});
test('stage query is bounded and takes priority over legacy categories',()=>{
 for(let i=0;i<7;i++)assert.equal(initialStage('?stage='+i+'&area=MON',data),i);
 for(const query of ['?stage=-1','?stage=7','?stage=1x','?stage=1.5','?area=unknown','?area=__proto__'])assert.equal(initialStage(query,data),0);
});
test('stage tests resolve to published references, procedures and control objectives',()=>{
 const controls=fs.readFileSync(path.join(root,'control-matrix.html'),'utf8');
 for(const stage of data.stages){
  assert.ok(stage.tests.length>=1&&stage.tests.length<=2);
  for(const id of stage.controls)assert.ok(controls.includes('id="control-'+id+'"'),id);
  for(const id of stage.areas)assert.ok(data.areas.some(a=>a.id===id),id);
  for(const id of [...stage.guidance.map(g=>g.ref),...stage.tests.flatMap(t=>t.refs)])assert.ok(new URL(data.references[id].url).protocol==='https:',id);
 }
});
