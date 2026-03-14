import { callGeminiViaProxy } from "./geminiProxy";

interface ClaudeCallOptions {
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
  retryCount?: number;
}

const DEFAULT_MODEL = import.meta.env.VITE_CLAUDE_MODEL || "claude-opus-4.6";
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_CLAUDE_TIMEOUT_MS || 20_000);
const DEFAULT_RETRY_COUNT = Number(import.meta.env.VITE_CLAUDE_RETRY_COUNT || 2);
const RETRY_BASE_DELAY_MS = Number(import.meta.env.VITE_CLAUDE_RETRY_BASE_DELAY_MS || 800);
const CLAUDE_PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL || "";

interface ClaudeProxyResponse {
  text?: string;
  error?: string;
}

class ClaudeServiceError extends Error {
  retryable: boolean;

  constructor(message: string, retryable = false) {
    super(message);
    this.name = "ClaudeServiceError";
    this.retryable = retryable;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calcBackoffDelay(attempt: number) {
  const jitter = Math.floor(Math.random() * 250);
  return RETRY_BASE_DELAY_MS * Math.pow(2, attempt) + jitter;
}

function normalizeProxyError(status: number, errorText: string): ClaudeServiceError {
  if (status === 429) {
    return new ClaudeServiceError("Claude 요청이 많아 잠시 대기 후 다시 시도합니다.", true);
  }

  if ([408, 425, 500, 502, 503, 504].includes(status)) {
    return new ClaudeServiceError(
      `Claude 서버 응답이 불안정합니다 (${status}). 잠시 후 다시 시도합니다.`,
      true
    );
  }

  return new ClaudeServiceError(`Claude 프록시 호출 실패: ${status} - ${errorText}`);
}

async function callClaudeProxyOnce(
  message: string,
  options: Required<Pick<ClaudeCallOptions, "model" | "maxTokens" | "timeoutMs">>
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(CLAUDE_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        model: options.model,
        max_tokens: options.maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw normalizeProxyError(response.status, errorText);
    }

    const data = (await response.json()) as ClaudeProxyResponse;
    if (data.error) {
      const lower = data.error.toLowerCase();
      const retryable =
        lower.includes("rate") ||
        lower.includes("quota") ||
        lower.includes("timeout") ||
        lower.includes("temporar") ||
        lower.includes("unavailable");
      throw new ClaudeServiceError(data.error, retryable);
    }

    const answer = data.text?.trim();
    if (!answer) {
      throw new ClaudeServiceError("Claude 응답이 비어 있습니다.");
    }

    return answer;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new ClaudeServiceError("Claude 요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.", true);
    }

    if (error instanceof ClaudeServiceError) {
      throw error;
    }

    throw new ClaudeServiceError("네트워크가 불안정해 Claude 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.", true);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function callClaude(
  message: string,
  options: ClaudeCallOptions = {}
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("질문 내용을 입력해 주세요.");
  }

  const effectiveOptions = {
    model: options.model || DEFAULT_MODEL,
    maxTokens: options.maxTokens || DEFAULT_MAX_TOKENS,
    timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
    retryCount: options.retryCount ?? DEFAULT_RETRY_COUNT,
  };

  const canUseClaude = Boolean(CLAUDE_PROXY_URL);
  const canUseGeminiFallback = Boolean(import.meta.env.VITE_GEMINI_PROXY_URL);

  if (!canUseClaude && !canUseGeminiFallback) {
    throw new Error("VITE_CLAUDE_PROXY_URL 또는 VITE_GEMINI_PROXY_URL 설정이 필요합니다.");
  }

  if (canUseClaude) {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= effectiveOptions.retryCount; attempt += 1) {
      try {
        return await callClaudeProxyOnce(trimmed, effectiveOptions);
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const retryable = error instanceof ClaudeServiceError && error.retryable;
        const hasNextAttempt = attempt < effectiveOptions.retryCount;

        if (!retryable || !hasNextAttempt) {
          break;
        }

        await sleep(calcBackoffDelay(attempt));
      }
    }

    if (!canUseGeminiFallback) {
      throw lastError || new Error("Claude 호출에 실패했습니다.");
    }
  }

  try {
    return await callGeminiViaProxy(trimmed);
  } catch {
    throw new Error("AI 요청이 일시적으로 혼잡합니다. 잠시 후 다시 시도해 주세요.");
  }
}
