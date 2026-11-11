/* Static fictional risk-library browser. No AI scoring or external data persistence. */
(function(){
'use strict';
const D=window.SdlcRiskRegister,host=document.getElementById('sdlc-risk-register');
if(!D||!host)return;
const n=(tag,txt,cls)=>{const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;if(cls)x.className=cls;return x;};
const link=(label,url)=>{const a=n('a',label);a.href=url;return a;};
const controls=n('div',undefined,'register-filters');
const ff=n('select'),aa=n('select');ff.id='register-function';aa.id='register-authority';
for(const val of ['all','Govern','Map','Measure','Manage']){const o=n('option',val==='all'?'All NIST AI RMF functions':val);o.value=val;ff.append(o);}
for(const [v,label] of [['all','All authority levels'],['review','AI review / advisory focus'],['automated','Automated authorization focus'],['production','Production authority focus']]){const o=n('option',label);o.value=v;aa.append(o);}
const fl=n('label','NIST AI RMF function'),al=n('label','AI authority focus');fl.htmlFor=ff.id;al.htmlFor=aa.id;fl.append(ff);al.append(aa);controls.append(fl,al);
const count=n('p',undefined,'register-count');count.setAttribute('aria-live','polite');
const list=n('div',undefined,'register-list');
const dl=n('button','Download illustrative risk register (.csv)','register-download');dl.type='button';
dl.addEventListener('click',()=>{
 const blob=new Blob([D.csv()],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='AI_SDLC_Illustrative_Risk_Register.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
function render(){
 const rows=D.select(ff.value,aa.value);count.textContent=rows.length+' of '+D.risks.length+' illustrative risk scenarios';
 list.replaceChildren();
 for(const r of rows){
  const article=n('details',undefined,'register-risk');article.id='risk-'+r.id;
  const summary=n('summary');summary.append(n('span',r.id,'register-id'),n('strong',r.title),n('span',r.functions.join(' · '),'register-functions'));article.append(summary);
  const body=n('div',undefined,'register-risk-body');
  const fields=[['What could go wrong?',r.event+' '+r.failure],['Control objective',r.objective],['Example safeguard',r.safeguard],['Evidence to obtain',r.evidence],['Negative / challenge test',r.test],['Question to resolve',r.question]];
  for(const [label,val] of fields){const row=n('section');row.append(n('h4',label),n('p',val));body.append(row);}
  const related=n('p',undefined,'register-related');related.append(n('strong','Illustrative RCM mapping · '));
  r.rcm.forEach((id,i)=>{if(i)related.append(document.createTextNode(' · '));related.append(link('WEB15:'+id,'./rcm-view.html#control-'+id));});
  body.append(related,n('p','Not assessed: no likelihood, impact, control effectiveness, or residual risk has been determined.','register-unknown'));article.append(body);list.append(article);
 }
 if(location.hash.startsWith('#risk-')){const target=list.querySelector('[id="'+location.hash.slice(1)+'"]');if(target)target.open=true;}
}
ff.addEventListener('change',render);aa.addEventListener('change',render);
host.append(controls,count,list,dl);
render();
})();