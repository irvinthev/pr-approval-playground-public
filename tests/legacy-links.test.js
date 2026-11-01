const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../case-ui.js'),'utf8');
function rewrite(href,{navigation=false,download=false,active=true}={}){
 const a={href,getAttribute:()=>href,classList:{contains:()=>false},closest:()=>navigation,hasAttribute:()=>download};
 const ctx={document:{querySelectorAll:()=>[a]},URL,location:{href:'https://example.test/experience.html',origin:'https://example.test'},C:{encode:()=>'#case=valid'},active,error:'',current:{}};
 vm.runInNewContext(source.slice(source.indexOf('function wireLinks(){'),source.indexOf('function persist(){'))+';wireLinks();',ctx);return a.href;
}
test('legacy state cannot overwrite a reference anchor or a download destination',()=>{
 for(const href of ['./independent-assurance.html#example-rcm','./independent-assurance.html?stage=3#testing-guide','./downloads/AI_Approval_Example_RCM.xlsx'])assert.equal(rewrite(href),href);
 assert.equal(rewrite('./independent-assurance.html',{navigation:true}),'./independent-assurance.html');
});
test('explicit legacy journey links retain case state and query context',()=>{assert.equal(rewrite('./continuous-monitoring.html?stage=3'),'https://example.test/continuous-monitoring.html?stage=3#case=valid');});
