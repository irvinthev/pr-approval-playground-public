const common = {repoAllowed:true,pathAllowed:true,ciPassed:true,authorAllowed:true,policyIndependent:true,commitCurrent:true,reviewerA:'LOW',reviewerB:'LOW',evidenceCaptured:true,deploymentHealthy:true,killSwitch:false,policyVersion:'demo-v0.1'};
export const scenarios = [
 {id:'pass',name:'Standard low-risk pass',subtitle:'Two reviewers agree; deterministic scope allows the change',repo:'fictional/docs-site',sha:'c8f2a91',change:'Update API reference copy',inputs:{...common}},
 {id:'split',name:'AI split decision',subtitle:'One AI reviewer flags the change for human review',repo:'fictional/customer-ui',sha:'7d42b0e',change:'Adjust session caching',inputs:{...common,reviewerB:'MEDIUM'}},
 {id:'scope',name:'Hard gate: scope exclusion',subtitle:'High AI confidence cannot authorize excluded code',repo:'fictional/billing-service',sha:'a15d403',change:'Modify invoice logic',inputs:{...common,pathAllowed:false}},
 {id:'canary',name:'Production canary failure',subtitle:'Pre-merge authorization is not release health',repo:'fictional/customer-ui',sha:'f390ad2',change:'Optimize profile-fetch retries',inputs:{...common,deploymentHealthy:false}}
];
export const checkDescriptions = {
repoAllowed:['Repository allowlisted','Repository must appear in approved evaluation scope'],
pathAllowed:['Path passes exclusions','Financial, authentication and deployment paths cannot be overridden by AI'],
ciPassed:['CI checks pass','Required CI status corresponds to this revision'],
authorAllowed:['Author eligible','Automation cannot authorize its own changes'],
policyIndependent:['Independent policy administration','Authors cannot change the approving rules'],
commitCurrent:['Exact commit remains current','New commits must invalidate prior assessment'],
reviewerA:['AI reviewer A','Advisory assessment, not independent authorization'],
reviewerB:['AI reviewer B','Disagreement routes to humans'],
evidenceCaptured:['Evidence captured','Illustrative decision record is available'],
deploymentHealthy:['Canary healthy','Release monitoring is separate from merge eligibility'],
killSwitch:['Emergency shutdown','Disable automated authorization when enabled']
};
