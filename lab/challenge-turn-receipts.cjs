'use strict';
// Server-signed, bounded snapshots of model responses for private follow-up context.
// Signing proves the text came from an earlier validated API response, not that it is true.
const {createHmac,createHash,timingSafeEqual}=require('node:crypto');
const MAX_RECEIPTS=3, MAX_RECEIPT_CHARS=2200, MAX_AGE_SECONDS=8*60*60;
const short=(s,n)=>typeof s==='string'?s.slice(0,n):'';
const secret=()=>process.env.CHALLENGE_API_TOKEN;
const digest=s=>createHash('sha256').update(s).digest('hex');
function sign(payload){
  if(!secret())throw new Error('Challenge Lab token is not configured');
  return createHmac('sha256',secret()).update('challenge-lab/turn/v1:'+payload).digest('hex');
}
function snapshot(data){
  const main=Array.isArray(data.conclusions)?data.conclusions[0]:null;
  return {
    answer:short(main?.application,500),
    question:short(main?.openQuestion,250),
    options:Array.isArray(data.alternatives)?data.alternatives.slice(0,2).map(x=>short(x,180)).filter(Boolean):[]
  };
}
function issueReceipt(data,scenarioText,now=Math.floor(Date.now()/1000)){
  const payload=Buffer.from(JSON.stringify({
    v:1,at:now,scenario:digest(scenarioText),prior:snapshot(data)
  })).toString('base64url');
  const receipt=payload+'.'+sign(payload);
  if(receipt.length>MAX_RECEIPT_CHARS)throw new Error('Continuity receipt exceeds limit');
  return receipt;
}
function decodeReceipt(receipt,scenarioText,now=Math.floor(Date.now()/1000)){
  if(typeof receipt!=='string'||receipt.length>MAX_RECEIPT_CHARS)return null;
  const match=/^([A-Za-z0-9_-]+)\.([a-f0-9]{64})$/.exec(receipt);
  if(!match || !secret())return null;
  const expected=Buffer.from(sign(match[1]),'hex'),actual=Buffer.from(match[2],'hex');
  if(!timingSafeEqual(expected,actual))return null;
  let data;
  try{data=JSON.parse(Buffer.from(match[1],'base64url').toString('utf8'))}catch{return null}
  if(!data||data.v!==1||!Number.isSafeInteger(data.at)||
    data.at>now+30||data.at<now-MAX_AGE_SECONDS||data.scenario!==digest(scenarioText))return null;
  if(!data.prior||typeof data.prior.answer!=='string'||data.prior.answer.length>500||
    typeof data.prior.question!=='string'||data.prior.question.length>250||
    !Array.isArray(data.prior.options)||data.prior.options.length>2||
    data.prior.options.some(x=>typeof x!=='string'||x.length>180))return null;
  return data.prior;
}
function verifiedHistory(receipts,scenarioText){
  if(!Array.isArray(receipts)||receipts.length>MAX_RECEIPTS)return null;
  const entries=[];
  for(const item of receipts){
    const entry=decodeReceipt(item,scenarioText);
    if(!entry)return null;
    entries.push(entry);
  }
  return entries;
}
module.exports={MAX_RECEIPTS,MAX_RECEIPT_CHARS,issueReceipt,decodeReceipt,verifiedHistory};
