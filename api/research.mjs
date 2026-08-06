import { compactUsage, deepseekConfig, deepseekResponsesJSON } from '../lib/deepseekClient.mjs';

const ALLOWED_METHODS = 'POST, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, x-research-token';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.setHeader('Access-Control-Max-Age', '86400');
}
function sendJson(res,status,body) { setCorsHeaders(res); res.status(status); res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(body)); }
function parseBody(req) { if(!req.body) return {}; if(typeof req.body==='object') return req.body; try { return JSON.parse(req.body); } catch { const e=new Error('Request body must be valid JSON.'); e.status=400; throw e; } }

const candidateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['querySummary', 'candidates'],
  properties: {
    querySummary: {
      type: 'string',
    },
    candidates: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'date',
          'domain',
          'tags',
          'suggestedProcessId',
          'processMatchConfidence',
          'importance',
          'novelty',
          'evidenceStrength',
          'independentSourceCount',
          'thesisImpact',
          'relationshipChange',
          'stageChange',
          'contradiction',
          'content',
          'sources',
        ],
        properties: {
          id: { type: 'string' },
          date: { type: 'string' },
          domain: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 10,
          },
          suggestedProcessId: {
            type: ['string', 'null'],
          },
          processMatchConfidence: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          importance: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          novelty: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          evidenceStrength: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          independentSourceCount: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
          },
          thesisImpact: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          relationshipChange: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          stageChange: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          contradiction: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          content: {
            type: 'object',
            additionalProperties: false,
            required: ['en', 'zh', 'ja'],
            properties: {
              en: { $ref: '#/$defs/copy' },
              zh: { $ref: '#/$defs/copy' },
              ja: { $ref: '#/$defs/copy' },
            },
          },
          sources: {
            type: 'array',
            minItems: 2,
            maxItems: 6,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['title', 'url', 'publisher', 'publishedAt', 'kind'],
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
                publisher: { type: 'string' },
                publishedAt: {
                  type: ['string', 'null'],
                },
                kind: {
                  type: 'string',
                  enum: ['primary', 'reliable_media', 'context'],
                },
              },
            },
          },
        },
      },
    },
  },
  $defs: {
    copy: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'coreFact', 'whyItMatters', 'processMatchReason'],
      properties: {
        title: { type: 'string' },
        coreFact: { type: 'string' },
        whyItMatters: { type: 'string' },
        processMatchReason: { type: 'string' },
      },
    },
  },
};

async function callDeepSeek({ date, focus, existingProcesses, maxSignals }) {
  const config = deepseekConfig();
  const processContext = existingProcesses.length ? JSON.stringify(existingProcesses) : 'No existing World Process catalogue was supplied.';
  const instructions = [
    'You are the AI Researcher for Insight.',
    `Research public information published or materially updated near ${date} using server-side web search.`,
    'Find candidate signals, not finished Insights.',
    'Prefer primary sources and high-quality independent reporting.',
    'Every candidate must describe a verifiable change rather than a general trend.',
    'Never invent URLs, titles, publishers, publication dates, quotes, or numeric facts.',
    'Use at least two genuinely independent sources per candidate.',
    'Return English, Simplified Chinese, and Japanese copy.',
    'All output is a draft requiring human approval.',
  ].join(' ');
  const task = [
    `Research date: ${date}`,
    `Research focus: ${focus}`,
    `Existing World Processes: ${processContext}`,
    `Return 1 to ${maxSignals} distinct signals.`,
    'Scores use 0-100. Preserve real source URLs found by web search.',
  ].join('\n');
  return deepseekResponsesJSON({
    model: config.researchModel,
    instructions,
    input: task,
    schema: candidateSchema,
    schemaName: 'insight_research_draft',
    webSearch: true,
    maxOutputTokens: 28000,
  });
}

export default async function handler(req,res) {
  setCorsHeaders(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method!=='POST') return sendJson(res,405,{ok:false,error:'Method not allowed. Use POST.'});
  try {
    if(!process.env.DEEPSEEK_API_KEY) return sendJson(res,500,{ok:false,error:'DEEPSEEK_API_KEY is not configured.'});
    if(!process.env.RESEARCH_API_TOKEN) return sendJson(res,500,{ok:false,error:'RESEARCH_API_TOKEN is not configured.'});
    if(req.headers?.['x-research-token']!==process.env.RESEARCH_API_TOKEN) return sendJson(res,401,{ok:false,error:'Unauthorized.'});
    const body=parseBody(req);
    const date=typeof body.date==='string'&&body.date.trim()?body.date.trim():new Date().toISOString().slice(0,10);
    const focus=typeof body.focus==='string'&&body.focus.trim()?body.focus.trim():'world-process-level changes in technology, energy, macroeconomics, geopolitics, and capital';
    const existingProcesses=Array.isArray(body.existingProcesses)?body.existingProcesses:[];
    const requested=Number(body.maxSignals);
    const maxSignals=Number.isFinite(requested)?Math.min(6,Math.max(1,Math.trunc(requested))):3;
    const result=await callDeepSeek({date,focus,existingProcesses,maxSignals});
    const parsed=result.data;
    const candidates=Array.isArray(parsed.candidates)?parsed.candidates.slice(0,maxSignals):[];
    if(!candidates.length) throw new Error('DeepSeek returned no candidate signals.');
    return sendJson(res,200,{
      ok:true,id:`research-${date}-${Date.now()}`,status:'draft',researchedAt:new Date().toISOString(),researchDate:date,
      provider:'deepseek',model:result.model,usage:compactUsage(result.usage),querySummary:parsed.querySummary,
      candidates:candidates.map((candidate)=>({...candidate,suggestedProcessId:candidate.suggestedProcessId||undefined,sources:Array.isArray(candidate.sources)?candidate.sources.map((source)=>({...source,publishedAt:source.publishedAt||undefined})):[]})),
    });
  } catch(error) { console.error('Research API failed:',error); return sendJson(res,error?.status||500,{ok:false,error:error instanceof Error?error.message:'Unknown research error.'}); }
}
