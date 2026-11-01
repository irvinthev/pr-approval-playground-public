(function(root){
  'use strict';
  function initialStage(search,data){
    const params=new URLSearchParams(search),stage=params.get('stage');
    if(/^[0-6]$/.test(stage||''))return Number(stage);
    const legacy=data.legacy[params.get('area')];
    return Number.isInteger(legacy)?legacy:0;
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={initialStage};return;}
  const data=root.AssuranceData,$=id=>document.getElementById(id);
  let active=initialStage(location.search,data);
  function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
  function source(id){const ref=data.references[id],link=el('a',ref.label+' ↗','source-link');link.href=ref.url;return link;}
  function render(){
    const stage=data.stages[active];
    $('stage-index').textContent='STAGE '+(active+1)+' / 7';
    for(const [id,key] of [['stage-title','title'],['stage-subtitle','subtitle'],['scenario','scenario'],['risk','risk'],['concern','concern'],['principle','principle']])$(id).textContent=stage[key];
    $('framework-guidance').replaceChildren(...stage.guidance.map(g=>{const row=el('div',null,'framework-row');row.append(source(g.ref),el('p',g.text));return row;}));
    $('test-cards').replaceChildren(...stage.tests.map((test,i)=>{
      const card=el('article',null,'test-card');card.append(el('span','TEST '+(i+1),'test-number'),el('h4',test.title));
      for(const [label,key] of [['Test approach','action'],['Expected result','expect'],['Evidence to inspect','evidence']])card.append(el('h5',label),el('p',test[key]));
      const refs=el('div',null,'test-refs');refs.append(...test.refs.map(source));card.append(refs);return card;
    }));
    $('pipeline-link').href='./experience.html?stage='+active+'#pipeline-section';
    $('control-links').replaceChildren(...stage.controls.map(id=>{const a=el('a',id+' · View control →');a.href='./control-matrix.html#control-'+id;return a;}));
    $('test-detail').open=false;
    $('procedures').replaceChildren(...stage.areas.map(id=>{
      const area=data.areas.find(a=>a.id===id),group=el('section',null,'procedure-group');group.append(el('h4',area.title));
      const list=el('ol');list.append(...area.steps.map(s=>el('li',s)));group.append(list,el('p','Evidence: '+area.evidence),el('p','Further challenge: '+area.blind));return group;
    }));
    [...$('stage-pickers').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
    $('stage-status').textContent='Showing assurance for stage '+(active+1)+': '+stage.title;if(window.SharedCaseUI)window.SharedCaseUI.refreshLinks();
  }
  data.stages.forEach((stage,i)=>{
    const b=el('button');b.type='button';b.append(el('span',String(i+1).padStart(2,'0')),document.createTextNode(stage.title));
    b.addEventListener('click',()=>{
      active=i;render();const url=new URL(location.href);url.search='';url.searchParams.set('stage',String(i));if(!url.hash.startsWith('#case='))url.hash='testing-guide';history.replaceState(null,'',url);
      $('stage-title').focus({preventScroll:true});$('testing-guide').scrollIntoView({behavior:'auto',block:'start'});
    });$('stage-pickers').append(b);
  });
  const status=el('p',null,'stage-status');status.id='stage-status';status.setAttribute('role','status');$('stage-pickers').after(status);
  $('reference-list').replaceChildren(...Object.keys(data.references).map(id=>{const p=el('p',null,'reference-item');p.append(source(id));return p;}));
  render();
})(typeof globalThis!=='undefined'?globalThis:this);
