# Gemini API 보안 설정 가이드

## ⚠️ 보안 문제

현재 `VITE_GEMINI_API_KEY`는 클라이언트 빌드에 포함되어 누구나 확인 가능합니다.
프로덕션 배포 시 반드시 Supabase Edge Function 프록시를 사용하세요.

## 🔒 해결 방법: Supabase Edge Function 프록시

### 1단계: Supabase 시크릿 설정

```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 로그인
supabase login

# 프로젝트에 시크릿 설정
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key
```

### 2단계: Gemini Proxy Function 배포

```bash
# supabase/functions/gemini-proxy 폴더가 이미 생성되어 있습니다

# 함수 배포
supabase functions deploy gemini-proxy
```

배포 후 URL이 출력됩니다:
```
https://abcdefghijk.supabase.co/functions/v1/gemini-proxy
```

### 3단계: 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# 프로덕션용: Supabase Function URL (보안)
VITE_GEMINI_PROXY_URL=https://abcdefghijk.supabase.co/functions/v1/gemini-proxy

# 개발용: 직접 API 키 (로컬 테스트만)
VITE_GEMINI_API_KEY=your_dev_api_key
```

### 4단계: 코드 수정 (선택사항)

`src/services/gemini.ts`에서 프록시 사용으로 전환하려면:

```typescript
import { callGeminiViaProxy, fileToBase64Clean } from "./geminiProxy";

// 기존 코드:
// const model = getModel();
// const result = await model.generateContent([...]);

// 프록시 사용:
const imageBase64 = await fileToBase64Clean(imageFile);
const resultText = await callGeminiViaProxy(prompt, imageBase64, imageFile.type);
const jsonMatch = resultText.match(/\{[\s\S]*\}/);
const parsed = JSON.parse(jsonMatch[0]);
```

## 📊 비교

| 방법 | 보안 | 설정 난이도 | 비용 |
|------|------|------------|------|
| 직접 API (현재) | ❌ 위험 | ✅ 쉬움 | ✅ 무료 |
| Supabase Proxy | ✅ 안전 | ⚠️ 중간 | ⚠️ Function 호출 비용 |

## 🚀 권장 사항

- **로컬 개발**: `VITE_GEMINI_API_KEY` 사용 (빠름)
- **프로덕션 배포**: `VITE_GEMINI_PROXY_URL` 사용 (보안)
- **.ait 빌드 전**: 프록시 설정 완료 필수

## 📝 참고

- Supabase Functions 무료 티어: 월 500,000 호출
- Gemini API 무료 티어: 일 1,500 요청
- 프록시 추가 지연시간: ~100-200ms
