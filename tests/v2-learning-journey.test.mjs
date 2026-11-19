// V2 Learn → Engineer & Evaluate → Assess regression checks.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = file => readFileSync(new URL("../v2/"+file, import.meta.url),"utf8");
const learn=read("learn.html"),engineering=read("nondeterministic-audit.html"),assess=read("index.html");
const script=assess.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const ids=[...assess.matchAll(/\{id:"(R\d+)"/g)].map(x=>x[1]);
test("All three navigation stages connect bidirectionally",()=>{
  for(const html of [learn,engineering,assess]){
    assert.match(html,/href="\.\/learn\.html"/);
    assert.match(html,/href="\.\/nondeterministic-audit\.html"/);
    assert.ok(html===assess ? html.includes('href="#risk"') : /href="\.\/index\.html(?:\?risk=R\d+)?(?:#risk)?"/.test(html));
  }
});
test("Risk reference covers every assessor mechanism and provides safeguard and test",()=>{
  assert.equal(ids.length,9);
  for(const id of ids){
    assert.match(learn,new RegExp('href="\\./nondeterministic-audit\\.html#risk-'+id+'"'));
    assert.match(engineering,new RegExp('id="risk-'+id+'"'));
    assert.match(engineering,new RegExp('href="\\./index\\.html\\?risk='+id+'#risk"'));
  }
});
test("Three scenarios preserve distinct human authority",()=>{
  for(const scenario of ["advisory","agent","auto"]){
    assert.match(engineering,new RegExp('id="scenario-'+scenario+'"'));
    assert.match(learn,new RegExp('href="\\./nondeterministic-audit\\.html#scenario-'+scenario+'"'));
  }
  assert.match(learn,/human still authorizes changes/i);
  assert.match(learn,/engineer decides/i);
  assert.match(learn,/autonomous AI approval/i);
});
test("Nondeterministic assurance methods include critical misses, access and log reconciliation",()=>{
  for(const term of ["False-low-risk rate","Run-to-run instability","prompt injection","GitHub merged/review populations","revoke permissions","Two-model agreement"])
    assert.ok(engineering.toLowerCase().includes(term.toLowerCase()),term);
});
test("Assessor accepts only known risk deep links and retains explicit environment changes",()=>{
  assert.ok(script);
  assert.doesNotThrow(()=>new Function(script));
  assert.match(script,/new URLSearchParams\(location\.search\)\.get\("risk"\)/);
  assert.match(script,/riskCatalog\.some\(function\(r\)\{return r\.id===linkedRisk\}\)/);
  assert.match(script,/pending=JSON\.stringify\(fromForm\(\)\)!==JSON\.stringify\(config\)/);
});
test("No repeated DOM IDs or actual provider credentials in public pages",()=>{
  for(const html of [learn,engineering,assess]){
    const found=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(new Set(found).size,found.length);
    assert.doesNotMatch(html,/GEMINI_API_KEY|OPENAI_API_KEY|CHALLENGE_API_TOKEN|sk-(?:proj-)?[A-Za-z0-9_-]{32,}/);
  }
});
