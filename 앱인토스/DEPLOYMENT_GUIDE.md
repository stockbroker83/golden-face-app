# 앱인토스 배포 완전 가이드

## 📋 배포 전 체크리스트

### ✅ 완료된 항목
- [x] granite.config.ts 권한 설정 (IAP, Storage, Notification)
- [x] Gemini API 보안 개선 (프록시 준비)
- [x] 결제 시스템 구현 (IAP + 토스페이먼츠 폴백)
- [x] 포인트 시스템 구현
- [x] VIP 프리미엄 기능 구현

### ⚠️ 필수 작업 (배포 전)

#### 1. 앱인토스 콘솔에 IAP 상품 등록 ⭐ 가장 중요!

**위치**: 앱인토스 개발자 콘솔 > 상품 관리 > 상품 등록

**등록할 상품 (총 5개)**:

| SKU 코드 | 상품명 | 가격 | 설명 |
|---------|--------|------|------|
| `points_starter_100` | 입문팩 | ₩1,000 | 포인트 100개 |
| `points_popular_600` | 인기팩 | ₩5,000 | 포인트 600개 (보너스 100) |
| `points_premium_1300` | 프리미엄팩 | ₩10,000 | 포인트 1,300개 (보너스 300) |
| `points_mega_4200` | 메가팩 | ₩30,000 | 포인트 4,200개 (보너스 1,200) |
| `premium_fortune` | 프리미엄 운세 리포트 | ₩9,900 | 관상 12가지+사주+타로+궁합 |

**등록 방법**:
1. 앱인토스 개발자 콘솔 로그인
2. "상품 관리" 메뉴 선택
3. "상품 등록" 버튼 클릭
4. 각 상품 정보 입력:
   - **상품 코드**: 위 표의 SKU 코드 (정확히 동일하게!)
   - **상품명**: 위 표의 상품명
   - **가격**: 위 표의 가격
   - **상품 설명**: 위 표의 설명
   - **상품 타입**: 소비성 (포인트) 또는 비소비성 (프리미엄)
5. 5개 상품 모두 등록 완료

#### 2. 앱 아이콘 준비

**필요 파일**:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px) 권장

**위치**: `앱인토스/public/` 폴더

**생성 방법**:
1. 온라인 아이콘 생성 도구 사용 (예: Canva, Figma)
2. 금빛관상 테마로 디자인:
   - 색상: #F5C842 (골드)
   - 아이콘: 얼굴 윤곽 + 별 + 동양 문양
3. 파일 저장 후 public 폴더에 추가

#### 3. Gemini API 보안 설정 (프로덕션 배포 시)

**현재 상태**: ✅ 프록시 전용 구성 권장 (클라이언트 키 저장 금지)

**프로덕션 배포 전 필수**:
- [ ] Supabase Edge Function 배포
- [ ] VITE_GEMINI_PROXY_URL 환경 변수 설정
- [ ] VITE_CLAUDE_PROXY_URL 환경 변수 설정
- [ ] Supabase 시크릿에 GEMINI_API_KEY 등록
- [ ] Supabase 시크릿에 ANTHROPIC_API_KEY 등록

자세한 방법: [GEMINI_SECURITY.md](./GEMINI_SECURITY.md) 참고

#### 4. 환경 변수 설정 확인

`.env.local` 파일 체크:

```bash
# 클라이언트에는 프록시 URL만 설정
VITE_CLAUDE_PROXY_URL=https://xxx.supabase.co/functions/v1/claude-proxy
VITE_GEMINI_PROXY_URL=https://xxx.supabase.co/functions/v1/gemini-proxy
VITE_TOSS_CLIENT_KEY=test_ck_...

# 프로덕션 추가 필요
VITE_TOSS_CONFIRM_API_URL=https://xxx.supabase.co/functions/v1/confirm-payment
VITE_ACCOUNT_API_BASE_URL=https://xxx.supabase.co/functions/v1
```

---

## 🚀 배포 프로세스

### 1단계: .ait 파일 빌드

```bash
# 앱인토스 폴더로 이동
cd 앱인토스

# 빌드 실행
npm run ait:build
```

**생성 위치**: `앱인토스/golden-face.ait` (약 2-3 MB)

### 2단계: 앱인토스 콘솔 업로드

1. 앱인토스 개발자 콘솔 로그인
2. 배포 ID: `019ccc82-2f19-7bf5-99ef-275af99c72a7`
3. "버전 등록" 클릭
4. `golden-face.ait` 파일 업로드
5. 버전 정보 입력:
   - 버전명: `20260308-v3` (날짜 + 버전)
   - 변경사항:
     ```
     - IAP 상품 5개 준비
     - Storage/Notification 권한 추가
     - Gemini API 보안 개선
     - 프리미엄 기능 완성
     ```

### 3단계: 버전 활성화

1. 업로드된 버전 선택
2. "버전 활성화" 또는 "테스트 배포" 클릭
3. 상태가 "검토 필요" → "테스트" 또는 "활성"으로 변경 확인

### 4단계: 테스트

**모바일 테스트**:
1. 토스 앱 열기
2. "앱인토스" 메뉴 진입
3. "금빛관상" 검색 또는 QR 코드 스캔
4. 앱 실행 확인

**테스트 항목**:
- [ ] 관상 촬영 및 무료 분석
- [ ] 포인트 충전 (5개 상품 모두 테스트)
- [ ] 프리미엄 운세 결제 (₩9,900)
- [ ] 일일 운세 (포인트 20)
- [ ] 궁합 분석 (포인트 50)
- [ ] 심리테스트 (포인트 30)

---

## 🐛 트러블슈팅

### "결제가 작동하지 않아요"
→ 앱인토스 콘솔에 IAP 상품이 등록되었는지 확인
→ SKU 코드가 정확히 일치하는지 확인

### "Gemini API 오류가 나요"
→ .env.local에 VITE_GEMINI_PROXY_URL 설정 확인
→ Supabase Function 시크릿 GEMINI_API_KEY 확인

### "포인트가 저장되지 않아요"
→ granite.config.ts에 Storage 권한 추가 확인
→ 브라우저 localStorage 지원 확인

### "알림이 안 와요"
→ granite.config.ts에 Notification 권한 추가 확인
→ 토스 앱에서 알림 권한 허용 확인

---

## 📊 현재 앱 상태

### 기능 완성도
- ✅ 관상 분석 (무료 5가지 + 프리미엄 12가지)
- ✅ 포인트 시스템 (충전/사용/히스토리)
- ✅ 결제 시스템 (IAP + 토스페이먼츠)
- ✅ 일일 운세, 궁합, 사주, 타로 등 9가지 메뉴
- ✅ VIP 프리미엄 기능
- ✅ PDF 저장 및 공유

### 보안 상태
- ✅ IAP 권한 추가됨
- ✅ Storage 권한 추가됨
- ✅ Notification 권한 추가됨
- ⚠️ Gemini API 보안 (개발용은 OK, 프로덕션은 프록시 필요)

### 남은 작업
- ⚠️ 앱 아이콘 이미지 파일 제작
- ⚠️ 앱인토스 콘솔에 IAP 상품 5개 등록
- ⚠️ (선택) Gemini API 프록시 배포
- ⚠️ (선택) 결제 승인 서버 배포

---

## 💡 다음 버전 개선 사항

### 단기 (v1.1)
- 회원가입/로그인 시스템 (Supabase Auth)
- 포인트 서버 동기화 (멀티 디바이스)
- 푸시 알림 시스템

### 중기 (v1.5)
- 사용자 리뷰 시스템
- 친구 추천 이벤트
- 포인트 선물 기능

### 장기 (v2.0)
- AI 챗봇 상담사 (실시간 대화)
- 커뮤니티 게시판
- 구독 모델 (월정액)

---

## 📞 지원

문제가 발생하면:
1. [GEMINI_SECURITY.md](./GEMINI_SECURITY.md) 참고
2. 앱인토스 개발자 문서: https://docs.appsintos.com
3. GitHub Issues에 문의

**배포 준비 완료!** 🎉
