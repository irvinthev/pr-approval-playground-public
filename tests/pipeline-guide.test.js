const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../experience.html'),'utf8');
test('seven guide stages render, navigate, and keep the active case fragment',()=>{
 const match=html.match(/<script>\(function\(\)\{'use strict';const rows=([\s\S]*?)<\/script>/);
 assert.ok(match,'guide script exists');
 const nodes=new Map();
 function element(id){if(!nodes.has(id))nodes.set(id,{id,textContent:'',disabled:false,children:[],setAttribute(k,v){this[k]=v},addEventListener(k,fn){this['on'+k]=fn},replaceChildren(...xs){this.children=xs},append(x){this.children.push(x)},scrollIntoView(){this.scrolled=true},focus(){this.focused=true}});return nodes.get(id)}
 const stageButtons=[];
 element('learning-steps').append=function(x){stageButtons.push(x)};
 element('learning-steps').querySelectorAll=()=>stageButtons;
 const document={getElementById:element,createElement:tag=>({tag,textContent:'',children:[],setAttribute(k,v){this[k]=v},addEventListener(k,fn){this['on'+k]=fn},append(x){this.children.push(x)}}),createTextNode:text=>text};
 const ctx={document,Event:class{constructor(type){this.type=type}}};
 vm.runInNewContext(match[0].slice('<script>'.length,-'</script>'.length),ctx);
 assert.equal(stageButtons.length,7);
 for(let i=0;i<7;i++){stageButtons[i].onclick();assert.equal(element('learn-title').textContent,['Pull request','Eligibility gate','Two AI reviews','Authorization','Merge + build','Preproduction gate','Production rollout'][i]);assert.equal(element('learn-requirements').children.length,4);assert.ok(element('learn-happens').textContent.length>20);assert.equal(stageButtons[i]['aria-pressed'],'true')}
 const hash='#case=preserve-this';ctx.location={hash};element('learn-jump').onclick();assert.equal(ctx.location.hash,hash);assert.equal(element('simulator').scrolled,true);
});
