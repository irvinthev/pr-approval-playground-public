/* Presentation-only tabs for public Risk Assessment v0.4. */
(function(){
'use strict';
const tabs=[...document.querySelectorAll('[data-risk-tab]')],panels=[...document.querySelectorAll('.risk-tab-panel')];
if(!tabs.length)return;
function activate(name,focus=false){
 const target=tabs.find(t=>t.dataset.riskTab===name);if(!target)return;
 for(const tab of tabs){const selected=tab===target;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
 for(const panel of panels)panel.hidden=panel.id!=='risk-tab-'+name;
 if(focus)target.focus();
}
tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>activate(tab.dataset.riskTab));
 tab.addEventListener('keydown',event=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
  event.preventDefault();let i=index;
  if(event.key==='ArrowRight')i=(index+1)%tabs.length;
  else if(event.key==='ArrowLeft')i=(index+tabs.length-1)%tabs.length;
  else if(event.key==='Home')i=0;
  else i=tabs.length-1;
  activate(tabs[i].dataset.riskTab,true);
 });
});
function tabForHash(hash){
 if(!hash||hash==='#main-content')return null;
 const id=decodeURIComponent(hash.slice(1));
 const target=document.getElementById(id);
 if(!target)return null;
 const panel=target.closest('.risk-tab-panel');
 return panel?panel.id.replace('risk-tab-',''):null;
}
function revealHashTarget(){
 const panel=tabForHash(location.hash);
 if(!panel)return false;
 activate(panel);
 requestAnimationFrame(()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)target.scrollIntoView({block:'start',behavior:'auto'});});
 return true;
}
const initial=new URLSearchParams(location.search).get('view');
if(!revealHashTarget())activate(['register','inventory','model','guidance'].includes(initial)?initial:'register');
window.addEventListener('hashchange',revealHashTarget);
})();
