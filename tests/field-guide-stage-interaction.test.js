const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','field-guide-journey.js'),'utf8');

function node(tag){
  return {
    tagName:tag,children:[],attrs:{},style:{},dataset:{},listeners:{},className:'',textContent:'',href:'',
    classList:{values:new Set(),toggle(key,on){if(on)this.values.add(key);else this.values.delete(key)},add(key){this.values.add(key)}},
    append(...children){this.children.push(...children)},
    setAttribute(k,v){this.attrs[k]=v},
    addEventListener(k,fn){this.listeners[k]=fn},
    querySelector(q){
      const id=q.startsWith('#')?q.slice(1):null;
      function visit(n){if(n.id===id)return n;for(const child of n.children){const found=visit(child);if(found)return found}return null}
      return visit(this);
    },
    insertAdjacentElement(_position,child){this.inserted=child}
  };
}

test('switching lifecycle stages updates panel in place without navigation or scrolling',()=>{
 const anchor=node('section');
 const document={
   readyState:'complete',
   createElement:node,
   querySelector(q){return q.includes('.risk-main-hero')?anchor:null},
   getElementById(){return null}
 };
 let writes=0,scrolls=0;
 const loc={pathname:'/pr-approval-playground-public/engineering-blueprint.html',search:'',hash:''};
 const location=new Proxy(loc,{set(target,key,value){writes++;target[key]=value;return true}});
 const context={document,location,URLSearchParams,window:{},scrollTo(){scrolls++}};
 vm.runInNewContext(source,context);
 const root=anchor.inserted;
 assert.ok(root,'shared journey should render');
 const buttons=root.children.find(c=>c.className==='fgj-stages').children;
 const detail=root.children.find(c=>c.className==='fgj-case-detail');
 assert.equal(buttons.length,8);
 assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
 assert.match(detail.querySelector('#fgj-selected-label').textContent,/Authorize/);
 const before=location.pathname+location.search+location.hash;
 buttons[5].listeners.click();
 assert.equal(detail.querySelector('#fgj-selected-label').textContent,'CASE STATE / Release');
 assert.match(detail.children.find(x=>x.tagName==='p').textContent,/release mismatch/);
 assert.match(detail.children.find(x=>x.tagName==='a').href,/continuous-monitoring.html/);
 assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
 assert.equal(location.pathname+location.search+location.hash,before);
 assert.equal(writes,0);
 assert.equal(scrolls,0);
});
