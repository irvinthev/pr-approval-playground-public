const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'field-guide-journey.js'), 'utf8');

function node(tag) {
 return {
  tagName:tag,children:[],attrs:{},className:'',textContent:'',href:'',
  append(...items){this.children.push(...items)},
  setAttribute(name,value){this.attrs[name]=value},
  insertAdjacentElement(_position,child){this.inserted=child}
 };
}
test('chapter renders only a compact, fictional case reference, not an eight-stage selector', () => {
 const anchor=node('section');
 const document={
  readyState:'complete',
  createElement:node,
  getElementById(name){return name==='main-content'?anchor:null}
 };
 const loc={pathname:'/pr-approval-playground-public/engineering-blueprint.html',search:'',hash:''};
 let writes=0;const location=new Proxy(loc,{set(target,key,value){writes++;target[key]=value;return true}});
 const window={};
 vm.runInNewContext(source,{document,location,window,URLSearchParams});
 const panel=anchor.inserted;
 assert.ok(panel);
 assert.equal(panel.id,'field-guide-shared-journey');
 assert.equal(panel.className,'fgj-context');
 assert.match(panel.children[0].textContent,/CASE-SHARED-01/);
 assert.match(panel.children[1].textContent,/independently restricts/);
 assert.match(panel.children[2].textContent,/identity/);
 assert.equal(panel.children[3].href,'#engineering-build-plan');
 assert.equal(panel.children.filter(child=>child.tagName==='button').length,0);
 assert.equal(writes,0);
 assert.equal(window.FieldGuideCase.stages.length,8);
});
