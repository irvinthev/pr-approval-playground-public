/* Field Guide V3.2: local, session-only educational investigation context; no network storage. */
(function(){
 'use strict';
 const KEY='field-guide-v3-investigation';
 const domains={
 R01:['AS-01','AS-05'],R02:['AS-04','AS-01'],R03:['AS-02','AS-05'],R04:['AS-05'],R05:['AS-04','AS-03'],
 R06:['AS-06'],R07:['AS-05','AS-08'],R08:['AS-01','AS-04'],R09:['AS-08','AS-07'],
 R10:['AS-01','AS-03'],R11:['AS-01'],R12:['AS-02','AS-06'],R13:['AS-02','AS-01'],
 R14:['AS-03'],R15:['AS-03'],R16:['AS-04'],R17:['AS-04','AS-07'],R18:['AS-03','AS-05'],
 R19:['AS-05','AS-07'],R20:['AS-07','AS-02'],R21:['AS-07','AS-08'],R22:['AS-03','AS-04']
 };
 function read(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');return x&&x.version===1?x:null;}catch{return null;}}
 function save(data){try{sessionStorage.setItem(KEY,JSON.stringify({version:1,...data}));return true;}catch{return false;}}
 function saveDecision(decision){const current=read()||{};return save({...current,decision});}
 function readDecision(){return read()?.decision||null;}
 function clear(){try{sessionStorage.removeItem(KEY);}catch{}}
 function selectedRisk(){const p=new URLSearchParams(location.search),id=p.get('risk')||(location.hash.match(/R\d{2}/)||[])[0];return /^R(?:0[1-9]|1\d|2[01])$/.test(id||'')?id:null;}
 function contextBar(){
  const state=read(),id=selectedRisk();if(!state&&!id)return;
  const el=document.createElement('aside');el.setAttribute('aria-label','Active investigation');el.className='fg-context';
  const title=id?'Investigating '+id:'Active assessment';
  const subtitle=state?.profile?.activities?.length?state.profile.activities.join(' · '):'Illustrative SDLC investigation';
  el.innerHTML='<strong>'+title+'</strong> <span class="fg-context-detail"></span> <a href="./sdlc-assessment.html">Return to assessment</a>'+(id&&location.pathname.endsWith('risk-control-library.html')?' <a href="./assurance.html?risk='+id+'#'+domains[id][0]+'">Relevant assurance →</a>':'');
  el.querySelector('.fg-context-detail').textContent=subtitle;
  const main=document.querySelector('main');if(main)main.prepend(el);
 }
 window.FGSession={read,save,saveDecision,readDecision,clear,selectedRisk,domains,contextBar};
 document.addEventListener('DOMContentLoaded',contextBar);
})();