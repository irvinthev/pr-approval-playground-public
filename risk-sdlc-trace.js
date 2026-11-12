/* Presentation-only illustration of risk propagation across the shared seven-stage SDLC.
 * Not an evaluator, executable control, or observed implementation. */
(function(root){
'use strict';
const model=root.SharedPipelineContext, host=root.document&&root.document.getElementById('risk-sdlc-trace');
if(!model||!host)return;
const scenarios={
 'RR-02':[
  [0,'introduced','PR description or diff carries misleading context into the review process.'],
  [1,'introduced','Dependency or protected-path mapping may omit a high-impact consumer.'],
  [1,'mitigated','A deterministic exclusion should reject protected or unresolved dependencies before AI review.'],
  [2,'exposed','AI reviewers may both classify the unsafe change as low impact.'],
  [3,'exposed','If a false-low result is treated as sufficient authority, the change could enter automated approval.'],
  [3,'mitigated','Independent authorization should require complete eligibility and current required checks, not AI agreement alone.']
 ],
 'RR-01':[
  [1,'introduced','Changes to the eligibility or policy rules can expand the automated route without independent approval.'],
  [3,'introduced','A contributor or administrator may control approval logic, tokens, or exceptions.'],
  [3,'exposed','An unauthorized actor could cause an approval that is not independently valid.'],
  [3,'mitigated','Separately governed policy and restricted approval identities should reject unauthorized decisions.'],
  [4,'exposed','A protected merge could proceed if the source-system rules or bypass rights are weak.'],
  [4,'mitigated','Branch rules, check-issuer restrictions, and current-revision enforcement should block the merge.']
 ],
 'RR-04':[
  [4,'introduced','An alternate build path or artifact substitution may disconnect the release from an authorized revision.'],
  [5,'introduced','Manual promotion or privileged deployment paths may bypass expected release gates.'],
  [5,'mitigated','Release eligibility and artifact provenance should be verified at promotion.'],
  [6,'exposed','An unapproved artifact or revision could reach production through a bypass route.'],
  [6,'mitigated','Deployment restrictions and independently reconciled production records could reveal or block unauthorized releases.']
 ]
};
const labels={introduced:'Introduced',exposed:'Exposed',mitigated:'Potential safeguard'};
const hostStages=root.document.createElement('div');hostStages.className='risk-sdlc-stages';hostStages.setAttribute('role','group');hostStages.setAttribute('aria-label','Select a software delivery stage');
const head=root.document.createElement('div');head.className='risk-sdlc-detail';head.setAttribute('aria-live','polite');
host.append(hostStages,head);
let currentRisk='RR-01',selectedStage=3;
function node(tag,text,parent,cls){const el=root.document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;parent.appendChild(el);return el}
function detail(){
 const stage=model.stages[selectedStage];
 const rows=scenarios[currentRisk].filter(x=>x[0]===selectedStage);
 head.replaceChildren();
 node('strong','Stage '+String(stage.id+1).padStart(2,'0')+' · '+stage.title,head,'risk-sdlc-stage-title');
 if(rows.length){
   for(const [,kind,note] of rows){
     const p=node('p',undefined,head,'risk-sdlc-event risk-sdlc-'+kind);
     node('span',labels[kind]+': ',p);
     p.append(root.document.createTextNode(note));
   }
 }else node('p','No specific propagation point is mapped for this illustrative scenario at this stage. This is not a statement that the stage has no risk.',head,'risk-sdlc-empty');
 const links=node('div',undefined,head,'risk-sdlc-links');
 for(const [lens,label] of [['engineering','Engineering'],['monitoring','Monitoring'],['assurance','Assurance']]){
   const a=node('a','Explore in '+label,links);a.href=model.href(lens,selectedStage);
 }
}
function render(risk){
 if(!scenarios[risk])return;
 currentRisk=risk;
 selectedStage=scenarios[risk][0][0];
 hostStages.replaceChildren();
 for(const stage of model.stages){
   const kinds=[...new Set(scenarios[risk].filter(x=>x[0]===stage.id).map(x=>x[1]))];
   const btn=node('button',undefined,hostStages,'risk-sdlc-stage');
   btn.type='button';btn.dataset.stage=String(stage.id);
   const title=node('strong',String(stage.id+1).padStart(2,'0')+' · '+stage.title,btn);
   const status=node('span',undefined,btn,'risk-sdlc-status');
   if(kinds.length)for(const kind of kinds)node('small',labels[kind],status,'risk-sdlc-chip risk-sdlc-'+kind);
   else node('small','—',status,'risk-sdlc-unmapped');
   btn.setAttribute('aria-pressed',String(stage.id===selectedStage));
   btn.addEventListener('click',()=>{
     selectedStage=stage.id;
     hostStages.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===selectedStage)));
     detail();
   });
 }
 detail();
}
root.RiskSdlcTrace={render,scenarios};
})(typeof window!=='undefined'?window:globalThis);
