// Groq API Service with SSE Streaming & Telemetry

export const GROQ_MODELS = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B (Flagship)',
    context: 131072,
    maxTokens: 65536,
    hasReasoning: true,
    description: 'Most powerful open model on Groq. Built-in reasoning, structured outputs, code & deep logic.',
    badge: 'Flagship Reasoning',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B (Lightning)',
    context: 131072,
    maxTokens: 65536,
    hasReasoning: true,
    description: 'Blazing fast inference with chain-of-thought reasoning and high accuracy.',
    badge: 'Fast & Smart',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    context: 131072,
    maxTokens: 16384,
    hasReasoning: false,
    description: 'State-of-the-art multilingual & multimodal foundation model from Alibaba Cloud.',
    badge: 'Multilingual',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'allam-2-7b',
    name: 'ALLaM 2.0 7B',
    context: 4096,
    maxTokens: 4096,
    hasReasoning: false,
    description: 'Compact high-performance model specialized for Arabic and English instruction following.',
    badge: 'Compact',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-86m',
    name: 'Prompt Guard 2 86M',
    context: 512,
    maxTokens: 512,
    hasReasoning: false,
    description: 'Dedicated classifier to detect prompt injections and jailbreak attacks.',
    badge: 'Security',
    color: 'from-rose-500 to-pink-500'
  }
];

export const SYSTEM_PROMPTS = [
  {
    title: 'Helpful AI Assistant',
    content: 'You are an ultra-fast, helpful, and highly intelligent AI assistant powered by Groq LPUs. Provide clear, concise, and structured answers.'
  },
  {
    title: 'Code Architect & Engineer',
    content: 'You are an expert Principal Software Engineer. Provide robust, clean, idiomatic code with clear explanations, architectural insights, and edge-case handling.'
  },
  {
    title: 'LLM Mechanics Professor',
    content: 'You are a renowned AI researcher and professor. Explain large language models, transformers, self-attention, tokenization, and vector embeddings with clear conceptual clarity, mathematical formulas, and intuitive analogies.'
  },
  {
    title: 'Step-by-Step Reasoner',
    content: 'Think step-by-step before answering. Break down complex reasoning into logical numbered steps and state your assumptions explicitly.'
  },
  {
    title: 'Concise & Direct',
    content: 'Give extremely concise, direct answers without unnecessary preamble or fluff. Get straight to the core insight.'
  }
];

export async function streamGroqChat({
  apiKey,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 1024,
  topP = 1.0,
  frequencyPenalty = 0,
  presencePenalty = 0,
  onChunk,
  onReasoning,
  onUsage,
  signal
}) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const startTime = performance.now();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: true
    }),
    signal
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.error?.message || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullContent = '';
  let fullReasoning = '';
  let usageData = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;

      if (trimmed === 'data: [DONE]') {
        const totalDurationSec = (performance.now() - startTime) / 1000;
        if (usageData) {
          usageData.totalClientDurationSec = totalDurationSec;
          if (usageData.completion_tokens && totalDurationSec > 0) {
            usageData.clientTokensPerSec = (usageData.completion_tokens / totalDurationSec).toFixed(1);
          }
        }
        continue;
      }

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const choice = parsed.choices?.[0];
          
          if (choice?.delta) {
            if (choice.delta.content) {
              fullContent += choice.delta.content;
              onChunk?.(choice.delta.content, fullContent);
            }
            if (choice.delta.reasoning) {
              fullReasoning += choice.delta.reasoning;
              onReasoning?.(choice.delta.reasoning, fullReasoning);
            }
          }

          if (parsed.usage) {
            usageData = {
              ...parsed.usage,
              queueTime: parsed.usage.queue_time ?? parsed.x_groq?.usage?.queue_time,
              promptTime: parsed.usage.prompt_time ?? parsed.x_groq?.usage?.prompt_time,
              completionTime: parsed.usage.completion_time ?? parsed.x_groq?.usage?.completion_time,
              totalTime: parsed.usage.total_time ?? parsed.x_groq?.usage?.total_time,
            };
            if (usageData.completion_tokens && usageData.completion_time > 0) {
              usageData.groqTokensPerSec = (usageData.completion_tokens / usageData.completion_time).toFixed(1);
            }
            onUsage?.(usageData);
          }
        } catch (e) {
          // ignore partial chunk json parse errors
        }
      }
    }
  }

  const clientDurationSec = (performance.now() - startTime) / 1000;
  return {
    content: fullContent,
    reasoning: fullReasoning,
    usage: usageData,
    durationSec: clientDurationSec
  };
}
