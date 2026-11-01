const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../experience.html'),'utf8');
const source=html.slice(html.indexOf('function transition('),html.indexOf('var messages='));
const ctx=vm.createContext({});vm.runInContext(source,ctx);
const fresh=mode=>({mode,cursor:0,status:'ready',states:Array(7).fill('idle'),human:false});
const next=f=>ctx.transition(f,'next');
test('eligible change requires seven explicit advances to production',()=>{let f=fresh('low');for(let i=0;i<6;i++){f=next(f);assert.notEqual(f.status,'deployed')}assert.equal(next(f).status,'deployed')});
for(const [mode,gate] of [['human',1],['ai',2]])test(mode+' escalation cannot proceed without human authorization and rejoins build',()=>{let f=fresh(mode);for(let i=0;i<=gate;i++)f=next(f);assert.equal(f.status,'human');assert.equal(next(f).cursor,gate);assert.equal(f.states[3],'skipped');f=ctx.transition(f,'approve');assert.equal(f.cursor,4);assert.equal(f.human,true);while(f.status==='running')f=next(f);assert.equal(f.status,'deployed')});
test('release failure cannot be overridden by next or human approval',()=>{let f=fresh('release');for(let i=0;i<6;i++)f=next(f);assert.equal(f.status,'blocked');assert.equal(next(f).status,'blocked');assert.equal(ctx.transition(f,'approve').status,'blocked');assert.equal(f.states[6],'skipped')});
test('human rejection prevents deployment',()=>{let f=next(next(fresh('human')));f=ctx.transition(f,'reject');assert.equal(next(f).status,'rejected');assert.equal(ctx.transition(f,'approve').status,'rejected')});
test('stage links inspect only valid stages without advancing the walkthrough',()=>{
 const source=html.slice(html.indexOf('var initialStage='),html.lastIndexOf('})();'));
 for(const [query,expected] of [['?stage=0',0],['?stage=6',6],['?stage=7',null],['?stage=-1',null],['?stage=2x',null],['?stage=',null],['',null]]){
  let selected=null;const flow=fresh('low'),before=JSON.stringify(flow);
  vm.runInNewContext(source,{URLSearchParams,location:{search:query},select:i=>{selected=i},flow});
  assert.equal(selected,expected,query);assert.equal(JSON.stringify(flow),before);
 }
});
