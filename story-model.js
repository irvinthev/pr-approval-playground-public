/* Invented guided scenarios; shares the financial lab's decision engine. */
(function(root){
 'use strict';
 const F=typeof module!=='undefined'&&module.exports?require('./financial-engine'):root.FinancialDemo;
 function initial(scenario='shared'){return {scenario,step:0,revision:1,ci:true,approval:null,share:20,months:1,visibility:'known',feedback:''};}
 function evaluate(state){
  const scenarioId=state.scenario==='outside'?'docs':state.scenario==='billingImpact'?'shared':state.scenario==='unknown'?'unknown':state.scenario;
  const change=F.makeChange(scenarioId,{repoAllowlisted:state.scenario!=='outside',sha:'demo-story-'+state.revision,ci:state.ci,assumptions:{...F.scenarios.shared.assumptions,affected:state.share,months:state.months}});
  const technical=F.assessTechnicalEligibility(change);let financial=F.assessFinancialImpact(change);
  if(state.scenario==='billingImpact'&&state.visibility==='unknown')financial={...financial,status:'UNRESOLVED',requiredRole:null,reason:'Dependency mapping unavailable: downstream financial relevance cannot be established.',exposure:{status:'UNKNOWN',reason:'Mapping unavailable.'}};
  if(state.scenario==='billingImpact'&&state.visibility==='none')financial={...financial,status:'ELIGIBLE',requiredRole:null,reason:'Hypothetical complete mapping identifies no protected downstream consumer.',exposure:{status:'NOT_APPLICABLE',reason:'No protected financial dependency in this hypothetical map.'}};
  return {change,technical,financial,decision:F.resolveAuthorization(technical,financial,change,state.approval)};
 }
 function transition(state,event,value){
  let next={...state};
  if(event==='scenario')return initial(['shared','docs','unknown','outside','billingImpact'].includes(value)?value:'shared');
  if(event==='reset')return initial(state.scenario);
  if(event==='goto'&&Number.isInteger(value)&&value>=0&&value<=4)next.step=value;
  if(event==='next')next.step=Math.min(4,state.step+1);
  if(event==='back')next.step=Math.max(0,state.step-1);
  if(event==='override')next.feedback=F.attemptPolicyChange('approval-bot').message;
  if(event==='push'){next.revision++;next.ci=false;next.approval=null;next.feedback='The new revision needs fresh technical checks and any required authorization.';}
  if(event==='recheck'){next.ci=true;next.feedback='Technical checks passed for the new revision. Required independent review still applies.';}
  if(event==='visibility'){next.visibility=['known','unknown','none'].includes(value)?value:'known';next.approval=null;next.feedback='Dependency evidence changed; authorization recalculated.';}
  if(event==='share'||event==='months'){next[event]=value;next.approval=null;next.feedback='What-if assumptions changed. Simulated approval cleared; protected review remains required.';}
  if(event==='approve'){
   const x=evaluate(state);
   if(x.technical.eligible&&x.financial.status==='REVIEW_REQUIRED'{
    next.approval=F.approve(x.change,x.financial);next.feedback='Independent reviewer authorized this revision under the current mapping and policy. This was human authorization, not automatic approval.';
   }else next.feedback=x.financial.status==='UNRESOLVED'?'An approval cannot substitute for missing scope. Resolve the dependency mapping first.':'No independent financial review can be added until applicable requirements are established and technical checks pass.';
  }
  return next;
 }
 const api={initial,evaluate,transition};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StoryDemo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
