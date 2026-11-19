// Run with: node --test tests/v2-assessment-model.test.mjs
// Static, source-derived tests: no browser, model API, GitHub auth or deployment.
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
const html=readFileSync(new URL("../v2/index.html",import.meta.url),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,"V2 inline script must exist");
const start=js.indexOf('"use strict";');
const end=js.indexOf('$("environment-form").addEventListener');
assert.ok(start>=0&&end>start,"Pure assessment model must precede DOM event binding");
// Compile functions from the shipped HTML itself rather than a second copy of the risk algorithm.
const model=new Function(js.slice(start,end)+"\nreturn {BASE,PRESETS,riskCatalog,applicable,priority,reason};")();
const lookup=(id,context)=>{const item=model.riskCatalog.find(r=>r.id===id);assert.ok(item);const applies=model.applicable(item,context);return {applies,priority:model.priority(item,context,applies),why:model.reason(item,context,applies)};};
test("V2 script parses and required workflow stages exist",()=>{
  assert.doesNotThrow(()=>new Function(js));
  ["view-overview","view-risk","view-engineering","view-testing"].forEach(id=>assert.ok(html.includes('id="'+id+'"')));
});
test("Autonomous approval is not agent-executed human approval",()=>{
  assert.equal(lookup("R02",model.PRESETS.auto).applies,"yes");
  assert.equal(lookup("R01",model.PRESETS.agent).applies,"yes");
  assert.equal(lookup("R02",model.PRESETS.agent).applies,"no");
});
test("Routing without approval substitution is not an autonomous approval or bot exemption",()=>{
  assert.equal(lookup("R08",model.PRESETS.routing).applies,"yes");
  assert.equal(lookup("R02",model.PRESETS.routing).applies,"no");
  assert.equal(lookup("R03",model.PRESETS.routing).applies,"no");
});
test("Substitution changes authorization attention without inventing an exempt identity",()=>{
  assert.equal(lookup("R08",model.PRESETS["routing-replace"]).priority,"High attention");
  assert.equal(lookup("R03",model.PRESETS["routing-replace"]).applies,"no");
});
test("Third-party exposure depends on reported external integration",()=>{
  assert.equal(lookup("R06",model.PRESETS.auto).applies,"yes");
  assert.equal(lookup("R06",model.PRESETS.routing).applies,"no");
});
test("Evidence treatment is distinct from risk applicability and priority",()=>{
  assert.match(js,/evidence=\{\};record\("Reviewer explicitly applied environment changes/);
  assert.match(js,/evidenceName\(evidence\[r\.id\]\|\|"unknown"\)/);
  assert.match(js,/pending=JSON\.stringify\(fromForm\(\)\)!==JSON\.stringify\(config\)/);
});
test("No provider credentials are embedded in public HTML",()=>{
  assert.doesNotMatch(html,/GEMINI_API_KEY|OPENAI_API_KEY|CHALLENGE_API_TOKEN|sk-[A-Za-z0-9_-]{20}/);
});