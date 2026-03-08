# 앱인토스 - Claude API React App

Claude Opus 4.6 API를 사용하는 React/TypeScript 애플리케이션입니다.

## 설치

```bash
npm install
# 또는
bun install
```

## 환경 설정

1. `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

2. `.env.local`에 API 키/결제 키를 추가합니다:

```
VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
VITE_TOSS_CLIENT_KEY=your_toss_client_key
VITE_TOSS_CONFIRM_API_URL=/api/toss/confirm
TOSS_SECRET_KEY=your_toss_secret_key
```

Claude API 키는 [Anthropic Console](https://console.anthropic.com)에서 얻을 수 있습니다.

토스페이먼츠 키는 Toss Payments 개발자센터에서 발급받을 수 있습니다.

## 토스 결제 승인 API

프로젝트에는 서버 승인 엔드포인트가 포함되어 있습니다.

- 경로: `api/toss/confirm.js`
- 역할: `paymentKey`, `orderId`, `amount`를 받아 토스 결제 승인 API를 서버에서 호출
- 필수 서버 환경변수: `TOSS_SECRET_KEY`

현재 이 프로젝트의 기본 배포(`.github/workflows/deploy.yml`)는 GitHub Pages(정적 호스팅)입니다.
GitHub Pages에서는 `api/toss/confirm.js` 같은 서버 라우트가 실행되지 않으므로,
운영 결제를 사용하려면 아래 중 하나가 필요합니다.

- 별도 백엔드(Cloud Run, Vercel Functions, Supabase Edge Functions 등)에 승인 API 배포
- 또는 서버 런타임을 지원하는 호스팅으로 전체 이전

프론트 환경변수 `VITE_TOSS_CONFIRM_API_URL`에는 위 백엔드의 실제 URL을 설정해야 합니다.

### GitHub Pages 배포 시 필수 설정

GitHub 저장소 `Settings > Secrets and variables > Actions`에 아래 시크릿을 추가하세요.

- `VITE_TOSS_CLIENT_KEY` = 토스 클라이언트 키
- `VITE_TOSS_CONFIRM_API_URL` = 배포한 승인 API URL

이 시크릿이 없으면 배포 워크플로우가 실패하도록 설정되어 있습니다.

주의: `TOSS_SECRET_KEY`는 절대 `VITE_` 접두사로 프론트에 노출하면 안 됩니다.

## 개발 서버 실행

```bash
npm run dev
# 또는
bun dev
```

브라우저에서 `http://localhost:5173`으로 접속하면 됩니다.

## 프로젝트 구조

```
appintos/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── services/       # API 서비스 (Claude)
│   ├── App.tsx         # 메인 앱 컴포넌트
│   └── main.tsx        # 진입점
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## 빌드

```bash
npm run build
# 또는
bun run build
```

## 사용 방법

1. 텍스트 입력 필드에 Claude에게 할 질문을 입력합니다
2. "전송" 버튼을 클릭합니다
3. Claude의 응답을 받습니다

## 주요 기능

- ✨ Claude Opus 4.6 API 통합
- 🚀 Vite를 사용한 빠른 개발 환경
- 📦 TypeScript 지원
- 🎨 모던한 UI/UX
