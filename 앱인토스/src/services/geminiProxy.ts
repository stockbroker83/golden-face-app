// Gemini API Proxy Service
// 클라이언트에서 직접 API 키를 노출하지 않고 Supabase Edge Function을 통해 호출

const SUPABASE_FUNCTION_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

interface GeminiProxyRequest {
  prompt: string;
  imageData?: string; // base64 without prefix
  mimeType?: string;
}

interface GeminiProxyResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: string;
}

/**
 * Supabase Edge Function을 통해 Gemini API 호출 (API 키 보안)
 */
export async function callGeminiViaProxy(
  prompt: string,
  imageData?: string,
  mimeType?: string
): Promise<string> {
  // 프록시 URL이 설정되지 않은 경우 에러
  if (!SUPABASE_FUNCTION_URL) {
    throw new Error(
      "VITE_GEMINI_PROXY_URL이 설정되지 않았습니다. " +
      ".env.local에 Supabase Function URL을 추가하세요."
    );
  }

  const requestBody: GeminiProxyRequest = {
    prompt,
    ...(imageData && { imageData, mimeType: mimeType || "image/jpeg" }),
  };

  const response = await fetch(SUPABASE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini 프록시 호출 실패: ${response.status} - ${errorText}`);
  }

  const data: GeminiProxyResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API 오류: ${data.error}`);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Gemini API 응답이 비어있습니다.");
  }

  const text = data.candidates[0].content.parts[0].text;
  return text;
}

/**
 * 이미지를 base64로 변환 (data: prefix 제거)
 */
export async function fileToBase64Clean(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:image/jpeg;base64," 부분 제거
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
