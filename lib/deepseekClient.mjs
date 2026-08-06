const DEFAULT_BASE_URL = 'https://api.deepseek.com';

function env(name, fallback) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function deepseekConfig() {
  return {
    apiKey: env('DEEPSEEK_API_KEY'),
    baseUrl: env('DEEPSEEK_BASE_URL', DEFAULT_BASE_URL).replace(/\/$/, ''),
    researchModel: env('DEEPSEEK_RESEARCH_MODEL', 'deepseek-v4-flash'),
    analyzeModel: env('DEEPSEEK_ANALYZE_MODEL', 'deepseek-v4-pro'),
    writeModel: env('DEEPSEEK_WRITE_MODEL', 'deepseek-v4-pro'),
  };
}

function requireKey() {
  const config = deepseekConfig();
  if (!config.apiKey) {
    const error = new Error('DEEPSEEK_API_KEY is not configured.');
    error.status = 500;
    throw error;
  }
  return config;
}

async function request(url, body, timeoutMs = 240_000) {
  const { apiKey } = requireKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const raw = await response.text();
    let payload;
    try { payload = raw ? JSON.parse(raw) : {}; }
    catch {
      const error = new Error(`DeepSeek returned non-JSON (${response.status}): ${raw.slice(0, 400)}`);
      error.status = response.status;
      throw error;
    }
    if (!response.ok) {
      const message = payload?.error?.message || payload?.error || `DeepSeek request failed (${response.status}).`;
      const error = new Error(String(message));
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeout = new Error('DeepSeek request timed out. Please retry.');
      timeout.status = 504;
      throw timeout;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function extractResponsesText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) return payload.output_text;
  for (const item of payload?.output || []) {
    if (item?.type !== 'message') continue;
    for (const part of item.content || []) {
      if (part?.type === 'output_text' && typeof part.text === 'string' && part.text.trim()) return part.text;
    }
  }
  throw new Error('DeepSeek Responses API returned no output_text.');
}

function extractToolArguments(payload, toolName) {
  for (const choice of payload?.choices || []) {
    for (const call of choice?.message?.tool_calls || []) {
      if (call?.function?.name === toolName && typeof call.function.arguments === 'string') {
        return call.function.arguments;
      }
    }
  }
  throw new Error(`DeepSeek did not call required tool: ${toolName}.`);
}

export async function deepseekResponsesJSON({
  model,
  instructions,
  input,
  schema,
  schemaName,
  webSearch = false,
  maxOutputTokens = 24_000,
}) {
  const config = requireKey();
  const endpoint = `${config.baseUrl}/responses`;
  const tools = webSearch ? [{ type: 'web_search' }] : undefined;
  const body = {
    model,
    instructions,
    input,
    tools,
    tool_choice: webSearch ? 'auto' : undefined,
    max_output_tokens: maxOutputTokens,
    text: {
      format: {
        type: 'json_schema',
        name: schemaName,
        strict: true,
        schema,
      },
    },
  };
  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
  let payload;
  try {
    payload = await request(endpoint, body);
  } catch (error) {
    // Compatibility fallback if a Responses deployment rejects text.format.
    if (![400, 422].includes(error?.status)) throw error;
    const fallback = {
      model,
      instructions: `${instructions}\nReturn only valid JSON matching this schema: ${JSON.stringify(schema)}`,
      input,
      tools,
      tool_choice: webSearch ? 'auto' : undefined,
      max_output_tokens: maxOutputTokens,
    };
    Object.keys(fallback).forEach((key) => fallback[key] === undefined && delete fallback[key]);
    payload = await request(endpoint, fallback);
  }
  const outputText = extractResponsesText(payload);
  let data;
  try { data = JSON.parse(outputText); }
  catch { throw new Error(`DeepSeek structured output was not valid JSON: ${outputText.slice(0, 400)}`); }
  return { data, model: payload.model || model, usage: payload.usage || null };
}

export async function deepseekToolJSON({
  model,
  system,
  user,
  toolName,
  schema,
  reasoningEffort = 'high',
  maxTokens = 32_000,
}) {
  const config = requireKey();
  const payload = await request(`${config.baseUrl}/chat/completions`, {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    thinking: { type: 'enabled' },
    reasoning_effort: reasoningEffort,
    max_tokens: maxTokens,
    stream: false,
    tools: [{
      type: 'function',
      function: {
        name: toolName,
        description: 'Submit the complete validated JSON result.',
        strict: true,
        parameters: schema,
      },
    }],
    tool_choice: { type: 'function', function: { name: toolName } },
  });
  const args = extractToolArguments(payload, toolName);
  let data;
  try { data = JSON.parse(args); }
  catch { throw new Error(`DeepSeek tool arguments were not valid JSON: ${args.slice(0, 400)}`); }
  return { data, model: payload.model || model, usage: payload.usage || null };
}

export function compactUsage(usage) {
  if (!usage) return undefined;
  return {
    inputTokens: usage.input_tokens ?? usage.prompt_tokens ?? 0,
    outputTokens: usage.output_tokens ?? usage.completion_tokens ?? 0,
    cachedInputTokens:
      usage.input_tokens_details?.cached_tokens ??
      usage.prompt_cache_hit_tokens ??
      usage.prompt_tokens_details?.cached_tokens ?? 0,
  };
}
