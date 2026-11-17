import { sourceCatalog } from './framework-source-catalog.js';
import './control-crosswalk.js';
(() => {
  'use strict';
  const x = window.ControlCrosswalk;
  if (!x || !sourceCatalog) return;
  const p = new Map(sourceCatalog.provisions.map(v => [v.id,v]));
  const s = new Map(sourceCatalog.sources.map(v => [v.id,v]));
  const m = new Map();
  for (const v of sourceCatalog.mappings) { const a=m.get(v.controlId)||[]; a.push(v); m.set(v.controlId,a); }
  const w = new Map(x.webSafeguards.map(v=>[v.id,v]));
  const byObj = new Map();
  for (const wb of x.workbookControls) for (const id of wb.objectives) { const a=byObj.get(id)||[]; a.push(wb); byObj.set(id,a); }
  const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
  for (const o of x.objectives) {
    const row=document.getElementById('control-'+o.legacyId), cell=row&&row.lastElementChild;
    if(!cell)continue;
    const wbs=byObj.get(o.id)||[], webIds=[...new Set(wbs.flatMap(v=>v.webIds))], refs=new Map();
    for(const id of webIds)for(const map of m.get(id)||[]){const prov=p.get(map.provisionId),src=prov&&s.get(prov.sourceId);if(prov&&src&&!refs.has(prov.id))refs.set(prov.id,{map,prov,src,id});}
    const d=el('details','catalog-basis');
    d.append(el('summary','','Reference library basis · '+refs.size+' linked sources'));
    d.append(el('p','catalog-note','Trace: '+(wbs.length?[...new Set(wbs.map(v=>v.id))].join(', '):'no source-qualified workbook mapping')+' → related web safeguards → catalog references. These mappings describe related intent; they do not establish implementation, operating effectiveness, or equivalence.'));
    if(!refs.size)d.append(el('p','catalog-empty','No source-qualified reference mapping is linked to this objective in the current catalog.'));
    else {
      const ul=el('ul','catalog-list');
      for(const {map,prov,src,id} of refs.values()){
        const li=el('li','catalog-item'),head=el('div','catalog-head');
        head.append(el('strong','',prov.title));
        const a=el('a','',src.title+' · '+prov.provisionId+' ↗'),url=prov.url||src.url||'';
        a.href=url.startsWith('https://')?url:'#';a.target='_blank';a.rel='noopener noreferrer';head.append(a);li.append(head);
        li.append(el('p','catalog-meta',src.issuer+' · '+src.version+' · '+src.status+' · reviewed '+(prov.reviewedAsOf||src.reviewedAsOf||'date not listed')));
        const ws=w.get(id);
        li.append(el('p','catalog-meta','Related safeguard: '+id+(ws?' · '+ws.title:'')+' · mapping '+map.reviewStatus+' · support '+map.support));
        li.append(el('p','catalog-rationale',map.rationale));
        if(prov.qualification)li.append(el('p','catalog-limit','Reference limit: '+prov.qualification));
        if(src.limitations)li.append(el('p','catalog-limit','Source limit: '+src.limitations));
        ul.append(li);
      }
      d.append(ul);
    }
    cell.append(d);
  }
})();