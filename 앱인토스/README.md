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

2. `.env.local`에 Claude API 키를 추가합니다:

```
VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
```

Claude API 키는 [Anthropic Console](https://console.anthropic.com)에서 얻을 수 있습니다.

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
