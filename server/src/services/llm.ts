// LLM Service Layer — supports Anthropic (Claude) and OpenAI via raw fetch

export interface LLMConfig {
  provider: 'anthropic' | 'openai';
  apiKey: string;
  model?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: { inputTokens: number; outputTokens: number };
}

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
};

export async function callLLM(config: LLMConfig, messages: LLMMessage[]): Promise<LLMResponse> {
  if (config.provider === 'anthropic') {
    return callAnthropic(config, messages);
  }
  return callOpenAI(config, messages);
}

async function callAnthropic(config: LLMConfig, messages: LLMMessage[]): Promise<LLMResponse> {
  const model = config.model || DEFAULT_MODELS.anthropic;

  // Separate system message from conversation messages
  const systemMessages = messages.filter((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const body: Record<string, unknown> = {
    model,
    max_tokens: 8192,
    messages: conversationMessages.map((m) => ({ role: m.role, content: m.content })),
  };

  if (systemMessages.length > 0) {
    body.system = systemMessages.map((m) => m.content).join('\n\n');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
    usage: { input_tokens: number; output_tokens: number };
  };

  const textContent = data.content.find((c) => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in Anthropic response');
  }

  return {
    content: textContent.text,
    usage: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
    },
  };
}

async function callOpenAI(config: LLMConfig, messages: LLMMessage[]): Promise<LLMResponse> {
  const model = config.model || DEFAULT_MODELS.openai;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 8192,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage: { prompt_tokens: number; completion_tokens: number };
  };

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices in OpenAI response');
  }

  return {
    content: data.choices[0]!.message.content,
    usage: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
    },
  };
}

/**
 * Extract JSON from an LLM response that may contain markdown code fences.
 */
export function extractJSON<T>(raw: string): T {
  // Try direct parse first
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try extracting from code fences
    const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1]!) as T;
    }
    throw new Error('Could not parse JSON from LLM response');
  }
}
