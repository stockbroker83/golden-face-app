interface ClaudeCallOptions {
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
}

const DEFAULT_MODEL = import.meta.env.VITE_CLAUDE_MODEL || "claude-opus-4.6";
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TIMEOUT_MS = 20_000;
const CLAUDE_PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL || "";

interface ClaudeProxyResponse {
  text?: string;
  error?: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Claude 요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function callClaude(
  message: string,
  options: ClaudeCallOptions = {}
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("질문 내용을 입력해 주세요.");
  }

  if (!CLAUDE_PROXY_URL) {
    throw new Error("VITE_CLAUDE_PROXY_URL이 설정되지 않았습니다.");
  }

  const response = await withTimeout(
    fetch(CLAUDE_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: trimmed,
        model: options.model || DEFAULT_MODEL,
        max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      }),
    }),
    options.timeoutMs || DEFAULT_TIMEOUT_MS
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude 프록시 호출 실패: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as ClaudeProxyResponse;
  if (data.error) {
    throw new Error(data.error);
  }

  const answer = data.text?.trim();
  if (!answer) {
    throw new Error("Claude 응답이 비어 있습니다.");
  }

  return answer;
}
