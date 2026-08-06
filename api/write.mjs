import processCatalog from '../data/world-process-catalog.json' with { type: 'json' };
import { buildWriterDraft } from '../lib/writer.mjs';
import { compactUsage, deepseekConfig, deepseekToolJSON } from '../lib/deepseekClient.mjs';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-research-token',
  );
  res.setHeader('Access-Control-Max-Age', '86400');
}

function json(res, status, value) {
  setCors(res);
  return res.status(status).json(value);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.status = 400;
    throw error;
  }
}

const nonEmptyString = {
  type: 'string',
  minLength: 1,
};

const localizedPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'cover',
    'question',
    'signals',
    'pattern',
    'insight',
    'observe',
  ],
  properties: {
    cover: {
      type: 'object',
      additionalProperties: false,
      required: [
        'eyebrow',
        'secondaryEyebrow',
        'title',
        'summary',
      ],
      properties: {
        eyebrow: nonEmptyString,
        secondaryEyebrow: nonEmptyString,
        title: nonEmptyString,
        summary: nonEmptyString,
      },
    },
    question: {
      type: 'object',
      additionalProperties: false,
      required: ['lead', 'title', 'footnote'],
      properties: {
        lead: nonEmptyString,
        title: nonEmptyString,
        footnote: nonEmptyString,
      },
    },
    signals: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'sourceNote', 'items'],
      properties: {
        title: nonEmptyString,
        sourceNote: nonEmptyString,
        items: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'label',
              'title',
              'body',
              'whyImportant',
              'evidence',
            ],
            properties: {
              label: nonEmptyString,
              title: nonEmptyString,
              body: nonEmptyString,
              whyImportant: nonEmptyString,
              evidence: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'title',
                  'description',
                  'confidence',
                  'sourceIds',
                ],
                properties: {
                  title: nonEmptyString,
                  description: nonEmptyString,
                  confidence: {
                    type: 'string',
                    enum: [
                      'verified',
                      'developing',
                      'hypothesis',
                    ],
                  },
                  sourceIds: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 6,
                    items: nonEmptyString,
                  },
                },
              },
            },
          },
        },
      },
    },
    pattern: {
      type: 'object',
      additionalProperties: false,
      required: [
        'title',
        'before',
        'shift',
        'now',
        'conclusion',
      ],
      properties: {
        title: nonEmptyString,
        before: nonEmptyString,
        shift: nonEmptyString,
        now: nonEmptyString,
        conclusion: nonEmptyString,
      },
    },
    insight: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'formula', 'explanation'],
      properties: {
        title: nonEmptyString,
        formula: nonEmptyString,
        explanation: nonEmptyString,
      },
    },
    observe: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'items', 'ending'],
      properties: {
        title: nonEmptyString,
        items: {
          type: 'array',
          minItems: 3,
          maxItems: 4,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['label', 'prompt', 'meta'],
            properties: {
              label: nonEmptyString,
              prompt: nonEmptyString,
              meta: nonEmptyString,
            },
          },
        },
        ending: nonEmptyString,
      },
    },
  },
};

const dailyCopySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'label',
    'decisionTitle',
    'decisionSummary',
    'thresholdReason',
    'observeNext',
  ],
  properties: {
    label: nonEmptyString,
    decisionTitle: nonEmptyString,
    decisionSummary: nonEmptyString,
    thresholdReason: nonEmptyString,
    observeNext: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: nonEmptyString,
    },
  },
};

const evolutionCopySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'implication'],
  properties: {
    title: nonEmptyString,
    description: nonEmptyString,
    implication: nonEmptyString,
  },
};

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'insightId',
    'slug',
    'parentInsightId',
    'previousInsightId',
    'en',
    'zh',
    'ja',
    'dailyState',
    'processUpdate',
  ],
  properties: {
    insightId: {
      type: ['string', 'null'],
    },
    slug: nonEmptyString,
    parentInsightId: {
      type: ['string', 'null'],
    },
    previousInsightId: {
      type: ['string', 'null'],
    },
    en: localizedPageSchema,
    zh: localizedPageSchema,
    ja: localizedPageSchema,
    dailyState: {
      type: 'object',
      additionalProperties: false,
      required: ['en', 'zh', 'ja'],
      properties: {
        en: dailyCopySchema,
        zh: dailyCopySchema,
        ja: dailyCopySchema,
      },
    },
    processUpdate: {
      type: 'object',
      additionalProperties: false,
      required: [
        'stage',
        'content',
        'nextQuestion',
        'observeNext',
      ],
      properties: {
        stage: {
          type: 'string',
          enum: [
            'signal',
            'emerging',
            'accelerating',
            'structural',
            'maturing',
            'uncertain',
            'declining',
          ],
        },
        content: {
          type: 'object',
          additionalProperties: false,
          required: ['en', 'zh', 'ja'],
          properties: {
            en: evolutionCopySchema,
            zh: evolutionCopySchema,
            ja: evolutionCopySchema,
          },
        },
        nextQuestion: {
          type: 'object',
          additionalProperties: false,
          required: ['en', 'zh', 'ja'],
          properties: {
            en: nonEmptyString,
            zh: nonEmptyString,
            ja: nonEmptyString,
          },
        },
        observeNext: {
          type: 'object',
          additionalProperties: false,
          required: ['en', 'zh', 'ja'],
          properties: {
            en: {
              type: 'array',
              minItems: 3,
              maxItems: 4,
              items: nonEmptyString,
            },
            zh: {
              type: 'array',
              minItems: 3,
              maxItems: 4,
              items: nonEmptyString,
            },
            ja: {
              type: 'array',
              minItems: 3,
              maxItems: 4,
              items: nonEmptyString,
            },
          },
        },
      },
    },
  },
};


const PLACEHOLDER_TEXTS = new Set([
  '无字段',
  '沒有欄位',
  '没有字段',
  '未填写',
  '未填寫',
  '待补充',
  '待補充',
  '暂无内容',
  '暫無內容',
  'no field',
  'no fields',
  'missing field',
  'not available',
  'n/a',
  '未入力',
  '項目なし',
  'フィールドなし',
]);

function isMeaningfulText(value) {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && !PLACEHOLDER_TEXTS.has(normalized);
}

function findMissingPatternFields(generated) {
  const missing = [];

  for (const language of ['en', 'zh', 'ja']) {
    const pattern = generated?.[language]?.pattern;

    for (const field of [
      'title',
      'before',
      'shift',
      'now',
      'conclusion',
    ]) {
      if (!isMeaningfulText(pattern?.[field])) {
        missing.push(`${language}.pattern.${field}`);
      }
    }
  }

  return missing;
}

async function requestWriter({
  researchDraft,
  candidate,
  matchedProcess,
  retryReason,
}) {
  const sourceIds = (candidate.sources || []).map((source) => source.id).filter(Boolean);
  const instructions = [
    'You are the AI Writer for Insight, a daily world-process cognition product.',
    'Write a complete six-page Insight draft in English, Simplified Chinese, and Japanese.',
    'Every required string must contain meaningful evidence-grounded text.',
    'Page 4 is mandatory in all three languages: title, before, shift, now, conclusion.',
    'Never use placeholders such as 无字段, 没有字段, 待补充, 暂无内容, No field, Missing field, N/A, 未入力, 項目なし, フィールドなし.',
    'Use only facts and source IDs supplied in the candidate. Do not invent URLs, dates, quotes, or numbers.',
    'Do not place URLs, Markdown links, citations, or publisher names in narrative copy.',
    'The first page is concise; Page 2 asks the structural question; Page 3 separates signals; Page 5 gives one memorable insight; Page 6 gives testable observations.',
    'Use cautious language for inference. Return the required tool JSON only.',
    retryReason ? `The previous attempt failed these fields: ${retryReason}. Rewrite the complete draft and repair all of them.` : '',
  ].filter(Boolean).join(' ');
  const input = {
    researchDraftId: researchDraft.id,
    researchDate: researchDraft.researchDate,
    candidate,
    matchedProcess: matchedProcess || null,
    allowedSourceIds: sourceIds,
  };
  const config = deepseekConfig();
  const result = await deepseekToolJSON({
    model: config.writeModel,
    system: instructions,
    user: JSON.stringify(input),
    toolName: 'submit_insight_writer_draft',
    schema: outputSchema,
    reasoningEffort: 'max',
    maxTokens: 42000,
  });
  return { model: result.model, generated: result.data, usage: result.usage };
}

async function callWriter({
  researchDraft,
  candidate,
  matchedProcess,
}) {
  const first = await requestWriter({
    researchDraft,
    candidate,
    matchedProcess,
  });

  const missing = findMissingPatternFields(first.generated);

  if (missing.length === 0) {
    return first;
  }

  const second = await requestWriter({
    researchDraft,
    candidate,
    matchedProcess,
    retryReason: missing.join(', '),
  });

  const stillMissing = findMissingPatternFields(second.generated);

  if (stillMissing.length > 0) {
    const error = new Error(
      `Writer returned an incomplete Page 04 after retry: ${stillMissing.join(', ')}`,
    );
    error.status = 422;
    throw error;
  }

  return second;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, {
      ok: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    if (!globalThis.process.env.DEEPSEEK_API_KEY) {
      return json(res, 500, {
        ok: false,
        error: 'DEEPSEEK_API_KEY is not configured.',
      });
    }

    if (!globalThis.process.env.RESEARCH_API_TOKEN) {
      return json(res, 500, {
        ok: false,
        error: 'RESEARCH_API_TOKEN is not configured.',
      });
    }

    if (
      req.headers?.['x-research-token'] !==
      globalThis.process.env.RESEARCH_API_TOKEN
    ) {
      return json(res, 401, {
        ok: false,
        error: 'Unauthorized.',
      });
    }

    const body = parseBody(req);
    const researchDraft = body.researchDraft || body.draft;
    const candidateId = body.candidateId;

    if (
      !researchDraft?.id ||
      !Array.isArray(researchDraft?.candidates)
    ) {
      return json(res, 400, {
        ok: false,
        error: 'researchDraft with candidates is required.',
      });
    }

    const candidate =
      researchDraft.candidates.find(
        (item) => item.id === candidateId,
      ) || researchDraft.candidates[0];

    if (!candidate) {
      return json(res, 400, {
        ok: false,
        error: 'Candidate was not found.',
      });
    }

    if (!candidate.analysis) {
      return json(res, 422, {
        ok: false,
        error:
          'Candidate must be analyzed by Build011.3 first.',
      });
    }

    if (
      !candidate.analysis.publishThresholdMet &&
      body.force !== true
    ) {
      return json(res, 422, {
        ok: false,
        error:
          'Candidate does not meet the publication threshold.',
        dailyState: candidate.analysis.dailyState,
        warnings: candidate.analysis.warnings,
      });
    }

    const processId =
      candidate.analysis.matchedProcessId ||
      candidate.suggestedProcessId;

    const matchedProcess = processCatalog.find(
      (item) => item.id === processId,
    );

    const { model, generated, usage } = await callWriter({
      researchDraft,
      candidate,
      matchedProcess,
    });

    const writerDraft = {
      ...buildWriterDraft({ researchDraft, candidate, model, generated, process: matchedProcess }),
      provider: 'deepseek',
      usage: compactUsage(usage),
    };

    const missingAfterBuild = findMissingPatternFields({
      en: writerDraft?.insight?.content?.en,
      zh: writerDraft?.insight?.content?.zh,
      ja: writerDraft?.insight?.content?.ja,
    });

    if (missingAfterBuild.length > 0) {
      return json(res, 422, {
        ok: false,
        error:
          'Writer Draft mapping removed or emptied Page 04 fields.',
        missingFields: missingAfterBuild,
      });
    }

    return json(res, 200, {
      ok: true,
      writerDraft,
    });
  } catch (error) {
    console.error('Writer API failed:', error);

    const status =
      Number.isInteger(error?.status) ? error.status : 500;

    return json(res, status, {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown writer error.',
    });
  }
}
