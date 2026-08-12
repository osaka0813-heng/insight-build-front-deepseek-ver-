import { INSIGHT_API_BASE_URL } from '../config/editorial';
import type { InsightScope } from '../types/research';

export type AutoCheckpoint = { research:boolean; analyze:boolean; writeBase:boolean; writeZh:boolean; writeJa:boolean; writer:boolean };
export type AutoScope = { status:string; stage:string; failedStage?:string; message?:string; candidateCount?:number; analyzeType?:string; selectedCandidateId?:string; insightId?:string; checkpoints:AutoCheckpoint };
export type AutoJob = { id:string; status:string; date:string; currentScope:InsightScope; currentStage:string; message?:string; scopes:Record<InsightScope,AutoScope> };

async function post(path:string, researchToken:string, publishToken:string|undefined, body:unknown) {
  const response=await fetch(`${INSIGHT_API_BASE_URL}${path}`,{method:'POST',headers:{'Content-Type':'application/json','x-research-token':researchToken.trim(),...(publishToken?{'x-publish-token':publishToken.trim()}:{})},body:JSON.stringify(body)});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok||!payload?.ok) throw new Error(payload?.error||`Automation request failed (${response.status}).`);
  return payload.job as AutoJob|undefined;
}
export const startAutoJob=(date:string,researchToken:string,publishToken:string)=>post('/api/auto-start',researchToken,publishToken,{date});
export const loadAutoJob=(jobId:string|undefined,researchToken:string,advance=true)=>post('/api/auto-status',researchToken,undefined,{jobId,advance});
export const resumeAutoJob=(jobId:string,researchToken:string,publishToken:string)=>post('/api/auto-resume',researchToken,publishToken,{jobId});
