/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_MODEL?: string;
  readonly VITE_CLAUDE_PROXY_URL?: string;
  readonly VITE_CLAUDE_TIMEOUT_MS?: string;
  readonly VITE_CLAUDE_RETRY_COUNT?: string;
  readonly VITE_CLAUDE_RETRY_BASE_DELAY_MS?: string;
  readonly VITE_GEMINI_PROXY_URL?: string;
  readonly VITE_TOSS_CLIENT_KEY?: string;
  readonly VITE_TOSS_CONFIRM_API_URL?: string;
  readonly VITE_ACCOUNT_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
