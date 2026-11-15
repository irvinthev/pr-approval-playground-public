// Find the Vercel deployment for the exact PR head SHA using GitHub's Deployments API.
// No Vercel API token required. Outputs only an allowlisted deployment host.
import { appendFile } from 'node:fs/promises';

const expected=/^ai-sdlc-challenge-agent-[a-z0-9-]+-irvlife23\.vercel\.app$/;
function verified(input){
  if(!input)return '';
  try{
    const value=new URL(input.startsWith('https://')?input:'https://'+input);
    if(value.protocol!=='https:'||!expected.test(value.hostname)||value.port||value.username||value.password)return '';
    return value.origin;
  }catch{return ''}
}
const provided=verified(process.env.UX_MANUAL_URL||'');
const secretAvailable=Boolean(process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
const output=process.env.GITHUB_OUTPUT;
const summary=process.env.GITHUB_STEP_SUMMARY;
async function note(message){
  console.log(message);
  if(summary)await appendFile(summary,'\n### Vercel UX capture\n'+message+'\n');
}
if(!secretAvailable){
  await note('Skipped deployed screenshots: configure repository Actions secret VERCEL_AUTOMATION_BYPASS_SECRET for this private Vercel project. Local screenshot QA remains available.');
  process.exit(0);
}
if(provided){
  if(output)await appendFile(output,'url='+provided+'\n');
  await note('Using verified manual Vercel deployment: '+new URL(provided).hostname);
  process.exit(0);
}
if(process.env.UX_MANUAL_URL)throw new Error('Manual URL is not an allowed Vercel project deployment');
const token=process.env.GH_TOKEN;
const sha=process.env.PR_HEAD_SHA;
const repo=process.env.GITHUB_REPOSITORY;
if(!token||!sha||!repo)throw new Error('PR head SHA, GitHub repository and GitHub token required');
const api='https://api.github.com/repos/'+repo;
const headers={
  accept:'application/vnd.github+json',
  authorization:'Bearer '+token,
  'x-github-api-version':'2022-11-28',
  'user-agent':'challenge-lab-vercel-ux-capture'
};
async function fetchJson(endpoint){
 const response=await fetch(api+endpoint,{headers,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('GitHub deployment metadata lookup returned '+response.status);
 return response.json();
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let result='';
for(let attempt=0;attempt<18 && !result;attempt++){
  const deployments=await fetchJson('/deployments?sha='+encodeURIComponent(sha)+'&per_page=30');
  for(const deployment of deployments){
    if(deployment.sha!==sha || (deployment.environment||'').toLowerCase().includes('production'))continue;
    const statuses=await fetchJson('/deployments/'+deployment.id+'/statuses?per_page=15');
    for(const status of statuses){
      if(status.state!=='success')continue;
      // Vercel's GitHub integration publishes its URL in the successful deployment status.
      result=verified(status.environment_url||status.target_url||'');
      if(result)break;
    }
    if(result)break;
  }
  if(!result && attempt<17)await sleep(10000);
}
if(result){
  if(output)await appendFile(output,'url='+result+'\n');
  await note('Resolved deployed Vercel Preview for PR head '+sha.slice(0,10)+': '+new URL(result).hostname);
}else{
  await note('No successful matching Vercel deployment was found for PR commit '+sha.slice(0,10)+'. Use manual screenshot dispatch after the workflow is on the default branch.');
}
