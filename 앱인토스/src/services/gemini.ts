import { FreeAnalysisResult, PremiumAnalysisResult, UserData, DailyFortuneResult, CompatibilityResult, PsychTestResult } from "../types";
import type { TarotResult } from "../pages/TarotReading";
import type { TojeongResult } from "../pages/TojeongBigyeol";
import type { DreamResult } from "../pages/DreamInterpretation";
import type { SajuAnalysis, FourPillars } from "../utils/sajuCalculator";
import { formatSajuForPrompt } from "../utils/sajuCalculator";
import { callGeminiViaProxy } from "./geminiProxy";
import {
  FreeAnalysisSchema,
  PremiumAnalysisSchema,
  DailyFortuneSchema,
  CompatibilitySchema,
  PsychTestSchema,
} from "../types/schemas";

const GEMINI_PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";
const HAS_GEMINI_PROXY = Boolean(GEMINI_PROXY_URL);

async function requestGeminiText(
  prompt: string,
  options: { imageData?: string; mimeType?: string; timeoutMs?: number } = {}
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("TIMEOUT")), options.timeoutMs ?? 30000);
  });

  const apiPromise = callGeminiViaProxy(prompt, options.imageData, options.mimeType);
  return Promise.race([apiPromise, timeoutPromise]);
}

export async function analyzeFaceFree(
  imageFile: File,
  userData: UserData
): Promise<FreeAnalysisResult> {
  if (!HAS_GEMINI_PROXY) return createMockFreeAnalysis();

  try {
    // 파일 검증
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('이미지 크기가 너무 큽니다.');
    }
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    const imageBase64 = await fileToBase64(imageFile);

    const prompt = `
당신은 30년 경력의 최고급 동양 관상/사주 명리학자입니다. 수천 명의 관상을 본 베테랑으로, 구체적이고 실용적인 조언을 제공합니다.

분석 대상
- 생년월일: ${userData.birth_date}
- 성별: ${userData.gender === "male" ? "남성" : "여성"}
- 양음력: ${userData.lunar ? "음력" : "양력"}

무료 분석 (5가지 핵심 관상)
1. 이마 (額相) - 지혜와 명예운, 초년운
2. 눈 (眼相) - 재물과 인간관계운, 판단력
3. 코 (鼻相) - 재물과 사업운, 자존감
4. 입 (口相) - 복록과 자손운, 표현력
5. 귀 (耳相) - 수명과 조상복, 장기운

⭐ 각 항목 작성 규칙 (품질 10배 향상):
- **점수 (0~100)**: 정확한 근거 기반 점수
- **제목**: 3-5단어로 핵심 특징 표현
- **설명 (description)**: 4-5문장으로 상세 분석
  * 1문장: 관상 외형 특징 (예: "이마가 넓고 광택이 있어")
  * 2문장: 성격/기질 해석 (예: "판단력이 뛰어나고 학습 능력이 높습니다")
  * 1-2문장: 실제 삶에서의 영향 (예: "업무에서 전략적 사고가 돋보이며...")
- **조언 (advice)**: 2-3문장으로 실천 가능한 구체적 행동
  * 반드시 "~하세요", "~추천합니다" 같은 실행 가능한 문장
  * 추상적 표현 금지 (예: "노력하세요" ❌ → "주 3회 독서 시간을 30분씩 확보하세요" ✅)
- **추가 필드**: 
  * daily_tip: 오늘 당장 실천할 수 있는 간단한 팁 (1문장)
  * confidence_reason: 이 점수를 준 근거 (1문장)

반드시 JSON 형식으로만 출력하세요.
{
  "overall_score": 85,
  "face_type": "귀인상",
  "overall_impression": "전체적으로 복이 많고 인덕이 좋습니다.",
  "emoji": "✨",
  "forehead": { 
    "score": 90, 
    "title": "넓고 빛나는 이마", 
    "description": "이마가 넓고 균형이 잘 잡혀 있어 사고력과 판단력이 뛰어납니다. 이는 학습 능력이 높고 전략적 사고가 가능하다는 의미입니다. 업무나 학업에서 복잡한 문제를 체계적으로 풀어내는 능력이 강하며, 장기적 계획 수립에도 강점을 보입니다. 초년운이 안정적이며 명예를 얻기 쉬운 상입니다.",
    "advice": "지혜를 더 발전시키려면 매일 아침 10분 명상으로 집중력을 높이세요. 주 2-3회는 새로운 분야의 책이나 강의를 접하면 사고의 폭이 넓어집니다. 중요한 결정은 하루 숙려 후 내리면 성공률이 높아집니다.",
    "daily_tip": "오늘은 아침에 가벼운 스트레칭으로 두뇌 혈류를 촉진하세요",
    "confidence_reason": "이마의 비율과 광택이 상위 15%에 속해 높은 점수 부여"
  },
  "eyes": { "score": 84, "title": "또렷한 눈매", "description": "...", "advice": "...", "daily_tip": "...", "confidence_reason": "..." },
  "nose": { "score": 82, "title": "균형잡힌 코", "description": "...", "advice": "...", "daily_tip": "...", "confidence_reason": "..." },
  "mouth": { "score": 88, "title": "상양 입꼬리", "description": "...", "advice": "...", "daily_tip": "...", "confidence_reason": "..." },
  "ears": { "score": 86, "title": "복스러운 귀", "description": "...", "advice": "...", "daily_tip": "...", "confidence_reason": "..." }
}
`;

    const text = await requestGeminiText(prompt, {
      imageData: imageBase64,
      mimeType: imageFile.type || "image/jpeg",
      timeoutMs: 30000,
    });
    const parsed = parseJson<FreeAnalysisResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    const validated = FreeAnalysisSchema.safeParse(parsed);
    if (!validated.success) throw new Error("FREE_SCHEMA_INVALID");

    return sanitizeFree(validated.data);
  } catch (error: any) {
    console.error("무료 분석 실패:", error);
    
    // 에러 메시지 매핑
    const errorMsg = error?.message || '';

    if (errorMsg.includes('이미지 크기가 너무 큽니다') || errorMsg.includes('이미지 파일만 업로드 가능합니다')) {
      throw error;
    }

    if (errorMsg.includes('quota') || errorMsg.includes('QUOTA')) {
      console.warn('무료 분석 쿼터 초과로 mock 결과를 반환합니다.');
      return createMockFreeAnalysis();
    }
    if (errorMsg.includes('SAFETY') || errorMsg.includes('blocked')) {
      console.warn('안전 정책 차단으로 mock 결과를 반환합니다.');
      return createMockFreeAnalysis();
    }
    if (errorMsg === 'TIMEOUT') {
      console.warn('요청 타임아웃으로 mock 결과를 반환합니다.');
      return createMockFreeAnalysis();
    }

    console.warn('무료 분석 API 오류로 mock 결과를 반환합니다.');
    return createMockFreeAnalysis();
  }
}

export async function analyzeFacePremium(
  imageFile: File,
  userData: UserData
): Promise<PremiumAnalysisResult> {
  if (!HAS_GEMINI_PROXY) return createMockPremiumAnalysis();

  const readingTone = (import.meta.env.VITE_READING_TONE || "warm").toLowerCase();

  try {
    // 파일 검증
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('이미지 크기가 너무 큽니다.');
    }
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    const imageBase64 = await fileToBase64(imageFile);

    const prompt = `
당신은 30년 경력의 최고급 동양 관상/사주 명리학자입니다.

분석 대상
- 생년월일: ${userData.birth_date}
- 성별: ${userData.gender === "male" ? "남성" : "여성"}
- 양음력: ${userData.lunar ? "음력" : "양력"}

프리미엄 전체 분석 (12가지 + 사주 + 타로)

관상 12가지
1. 이마 2. 눈 3. 코 4. 입 5. 귀 6. 턱 7. 광대 8. 눈썹 9. 인중 10. 얼굴형 11. 이마선 12. 법령선
- 각 항목: 점수 + 제목 + 설명 6~8문장 + 조언 4~6문장
- 설명은 "성격 경향 → 대인관계/일/금전 영향 → 주의 포인트" 순서로 서술
- 조언은 반드시 실천 가능한 행동 단위(주간 루틴/습관/체크포인트)로 작성

사주 4대운 (각 5~7문장)
- 연애운, 재물운, 건강운, 직장운
- 각 운세는 반드시 "상반기 흐름", "하반기 흐름", "실행 팁"을 포함

귀인/악연 관상
- helpful, harmful
- 각각 최소 4문장 이상, 외형 특징 + 관계에서의 행동 패턴 + 거리 조절 팁 포함

맞춤 타로 조언
- present, future, action
- 각 항목 최소 5문장 이상, 모호한 표현 대신 구체적인 행동/판단 기준 제시

전체 작성 스타일
- 사용자가 읽을 때 "스토리형 리딩"처럼 느껴지게 자연스럽고 구체적으로 작성
- 같은 단어 반복을 피하고, 각 문단에 새로운 정보가 들어가도록 작성
- 결과 텍스트는 짧은 한 줄 요약이 아니라 충분히 읽을 만한 분량으로 작성
- 톤은 아래 지시를 반드시 따를 것: ${getToneInstruction(readingTone)}

반드시 JSON 형식으로만 출력하세요.
{
  "overall_score": 88,
  "face_type": "귀인상",
  "overall_impression": "...",
  "emoji": "🔮",
  "features": {
    "forehead": { "score": 92, "title": "...", "description": "...", "advice": "..." },
    "eyes": { "score": 88, "title": "...", "description": "...", "advice": "..." },
    "nose": { "score": 85, "title": "...", "description": "...", "advice": "..." },
    "mouth": { "score": 84, "title": "...", "description": "...", "advice": "..." },
    "ears": { "score": 86, "title": "...", "description": "...", "advice": "..." },
    "chin": { "score": 83, "title": "...", "description": "...", "advice": "..." },
    "cheekbones": { "score": 82, "title": "...", "description": "...", "advice": "..." },
    "eyebrows": { "score": 87, "title": "...", "description": "...", "advice": "..." },
    "philtrum": { "score": 81, "title": "...", "description": "...", "advice": "..." },
    "face_shape": { "score": 89, "title": "...", "description": "...", "advice": "..." },
    "hairline": { "score": 80, "title": "...", "description": "...", "advice": "..." },
    "nasolabial_folds": { "score": 84, "title": "...", "description": "...", "advice": "..." }
  },
  "saju": { "love": "...", "money": "...", "health": "...", "career": "..." },
  "relations": { "helpful": "...", "harmful": "..." },
  "tarot": { "present": "...", "future": "...", "action": "..." },
  "iching": { "gua": "천화동인", "interpretation": "...", "advice": "..." }
}
`;

    const text = await requestGeminiText(prompt, {
      imageData: imageBase64,
      mimeType: imageFile.type || "image/jpeg",
      timeoutMs: 30000,
    });
    const parsed = parseJson<PremiumAnalysisResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    const validated = PremiumAnalysisSchema.safeParse(parsed);
    if (!validated.success) throw new Error("PREMIUM_SCHEMA_INVALID");

    return sanitizePremium(validated.data);
  } catch (error: any) {
    console.error("프리미엄 분석 실패:", error);
    
    // 에러 메시지 매핑
    const errorMsg = error?.message || '';

    if (errorMsg.includes('이미지 크기가 너무 큽니다') || errorMsg.includes('이미지 파일만 업로드 가능합니다')) {
      throw error;
    }

    if (errorMsg.includes('quota') || errorMsg.includes('QUOTA')) {
      console.warn('프리미엄 분석 쿼터 초과로 mock 결과를 반환합니다.');
      return createMockPremiumAnalysis();
    }
    if (errorMsg.includes('SAFETY') || errorMsg.includes('blocked')) {
      console.warn('프리미엄 안전 정책 차단으로 mock 결과를 반환합니다.');
      return createMockPremiumAnalysis();
    }
    if (errorMsg === 'TIMEOUT') {
      console.warn('프리미엄 요청 타임아웃으로 mock 결과를 반환합니다.');
      return createMockPremiumAnalysis();
    }

    console.warn('프리미엄 분석 API 오류로 mock 결과를 반환합니다.');
    return createMockPremiumAnalysis();
  }
}

function parseJson<T>(rawText: string): T | null {
  try {
    const normalized = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = normalized.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}

function clampScore(value: unknown, fallback = 80) {
  const score = Number(value);
  if (!Number.isFinite(score)) return fallback;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function ensureNarrative(text: unknown, supplement: string, minLength = 140) {
  const base = String(text ?? "").trim();
  if (!base) return supplement;

  let narrative = base;
  while (narrative.length < minLength) {
    narrative = `${narrative} ${supplement}`;
  }
  return narrative;
}

function getToneInstruction(tone: string) {
  if (tone === "coach") {
    return "단호한 코치 톤의 존댓말로 작성하세요. 핵심을 짚고 바로 실행할 수 있게 문장을 명확하게 마무리하세요.";
  }

  if (tone === "calm") {
    return "차분하고 신뢰감 있는 상담가 톤의 존댓말로 작성하세요. 과장 없이 안정적으로 안내하되 공감 문장을 포함하세요.";
  }

  return "따뜻하고 친근한 상담가 톤의 존댓말로 작성하세요. 읽는 사람이 '내 얘기를 이해받는다'고 느끼게 썰 풀듯 자연스럽게 설명하고, 마지막은 실행 팁으로 마무리하세요.";
}

function sanitizeFeature(feature: any) {
  return {
    score: clampScore(feature?.score),
    title: String(feature?.title ?? "균형 잡힌 특징"),
    description: ensureNarrative(
      feature?.description ?? "안정적인 흐름이 보입니다.",
      "쉽게 말해 지금은 한 번의 큰 승부보다 작은 성공을 꾸준히 쌓을수록 운이 더 크게 열리는 구간입니다. 생활·관계·업무에서 기준을 일정하게 가져가면 체감되는 흐름이 훨씬 안정적으로 좋아집니다.",
      170
    ),
    advice: ensureNarrative(
      feature?.advice ?? "현재의 장점을 꾸준히 유지해 보세요.",
      "실천 팁은 어렵지 않습니다. 주간 체크리스트를 3개 이하로 줄이고, 매주 같은 시간에 점검해 보세요. 이 리듬만 잡혀도 운의 들쭉날쭉함이 눈에 띄게 줄어듭니다.",
      140
    ),
    daily_tip: String(feature?.daily_tip ?? ""),
    confidence_reason: String(feature?.confidence_reason ?? ""),
  };
}

function sanitizeFree(data: Partial<FreeAnalysisResult>): FreeAnalysisResult {
  return {
    overall_score: clampScore(data.overall_score, 85),
    face_type: String(data.face_type ?? "귀인상"),
    overall_impression: String(data.overall_impression ?? "전체적으로 균형이 좋고 인덕이 따르는 상입니다."),
    emoji: String(data.emoji ?? "✨"),
    forehead: sanitizeFeature((data as any).forehead),
    eyes: sanitizeFeature((data as any).eyes),
    nose: sanitizeFeature((data as any).nose),
    mouth: sanitizeFeature((data as any).mouth),
    ears: sanitizeFeature((data as any).ears),
  };
}

function sanitizePremium(data: Partial<PremiumAnalysisResult>): PremiumAnalysisResult {
  const features = (data.features ?? {}) as any;
  return {
    overall_score: clampScore(data.overall_score, 88),
    face_type: String(data.face_type ?? "귀인상"),
    overall_impression: ensureNarrative(
      data.overall_impression ?? "전반적으로 상승 기류가 강한 프리미엄 상입니다.",
      "전체 흐름을 한마디로 정리하면 '강점은 밀고, 약점은 관리하는 전략'이 잘 맞는 타입입니다. 욕심을 넓게 펼치기보다 핵심 축을 먼저 세우면 상승 흐름을 더 길게 가져갈 수 있습니다.",
      180
    ),
    emoji: String(data.emoji ?? "🔮"),
    features: {
      forehead: sanitizeFeature(features.forehead),
      eyes: sanitizeFeature(features.eyes),
      nose: sanitizeFeature(features.nose),
      mouth: sanitizeFeature(features.mouth),
      ears: sanitizeFeature(features.ears),
      chin: sanitizeFeature(features.chin),
      cheekbones: sanitizeFeature(features.cheekbones),
      eyebrows: sanitizeFeature(features.eyebrows),
      philtrum: sanitizeFeature(features.philtrum),
      face_shape: sanitizeFeature(features.face_shape),
      hairline: sanitizeFeature(features.hairline),
      nasolabial_folds: sanitizeFeature(features.nasolabial_folds),
    },
    saju: {
      love: ensureNarrative(
        data.saju?.love ?? "2026년에는 관계의 폭이 넓어지며 진중한 인연이 들어옵니다.",
        "연애운은 빠르게 뜨거워지는 관계보다 천천히 깊어지는 관계에서 훨씬 좋게 작동합니다. 대화 횟수보다 대화의 밀도를 높이면 안정감과 만족도가 함께 올라갑니다.",
        180
      ),
      money: ensureNarrative(
        data.saju?.money ?? "상반기에는 지출 관리, 하반기에는 수익 확장 흐름이 강합니다.",
        "재물운은 의외로 '버는 일'보다 '새는 돈 막기'에서 먼저 좋아집니다. 고정비를 정리하고 소액 분산을 습관화해 두면, 하반기 확장 기회를 훨씬 안정적으로 잡을 수 있습니다.",
        180
      ),
      health: ensureNarrative(
        data.saju?.health ?? "수면 패턴과 소화기 관리에 집중하면 전체 컨디션이 안정됩니다.",
        "건강운은 무리한 목표보다 꾸준한 리듬에서 답이 나옵니다. 수면·수분·가벼운 운동만 일정하게 유지해도 회복력과 집중력이 함께 올라오는 흐름을 만들 수 있습니다.",
        180
      ),
      career: ensureNarrative(
        data.saju?.career ?? "협업 프로젝트에서 성과가 두드러지며 역할 확장이 유리합니다.",
        "직장운은 실적과 신뢰를 같이 쌓을 때 가장 크게 열립니다. 결과를 숫자로 남기는 습관을 들이면 승진·이직·프로젝트 확장 시점에 협상력이 확실히 높아집니다.",
        180
      ),
    },
    relations: {
      helpful: ensureNarrative(
        data.relations?.helpful ?? "온화한 인상과 안정적인 말투를 가진 사람이 귀인으로 작용합니다.",
        "이런 유형과는 큰 이벤트보다 작은 약속을 꾸준히 지키는 방식이 가장 잘 통합니다. 진행 상황을 투명하게 공유하면 시간이 갈수록 더 강한 지원으로 돌아오는 흐름이 만들어집니다.",
        170
      ),
      harmful: ensureNarrative(
        data.relations?.harmful ?? "극단적으로 단정적이고 조급한 성향의 사람과는 거리 조절이 필요합니다.",
        "관계 초반에는 정보·금전·감정의 경계를 분명히 두는 것이 안전합니다. 중요한 결정은 즉답하지 말고 하루만 숙고해도 불필요한 갈등과 손실을 크게 줄일 수 있습니다.",
        170
      ),
    },
    tarot: {
      present: ensureNarrative(
        data.tarot?.present ?? "지금은 기반을 단단히 다지는 시기입니다.",
        "현재 카드는 선택지를 넓히기보다 핵심 과제에 집중하라고 말해줍니다. 완벽한 계획보다 반복 가능한 실행 루틴을 먼저 만드는 쪽이 운의 상승 폭을 훨씬 크게 만듭니다.",
        170
      ),
      future: ensureNarrative(
        data.tarot?.future ?? "가까운 시기에 선택의 폭이 넓어지고 좋은 기회가 열립니다.",
        "미래 카드는 기회가 왔을 때 머뭇거림이 가장 큰 리스크가 된다고 알려줍니다. 기준을 미리 정해 두고 70% 확신이 들면 실행하는 방식이 가장 유리합니다.",
        170
      ),
      action: ensureNarrative(
        data.tarot?.action ?? "우선순위를 3개로 줄이고 실행 속도를 높이세요.",
        "실행 카드는 목표를 주간 단위로 쪼개서 완료 증거를 남기라고 말합니다. 작은 성공을 빠르게 쌓을수록 전체 흐름이 안정적으로 가속되는 패턴이 강하게 나타납니다.",
        170
      ),
    },
    iching: {
      gua: String(data.iching?.gua ?? "천화동인(天火同人)"),
      interpretation: String(data.iching?.interpretation ?? "사람과 협력할수록 길이 열리는 괘입니다."),
      advice: String(data.iching?.advice ?? "혼자 해결하려 하지 말고 신뢰할 팀을 만들어 추진하세요."),
    },
  };
}

function createMockFreeAnalysis(): FreeAnalysisResult {
  return sanitizeFree({
    overall_score: 86,
    face_type: "귀인상",
    overall_impression: "전체적으로 복이 많고 인복이 강한 흐름입니다.",
    emoji: "✨",
    forehead: {
      score: 89,
      title: "넓고 맑은 이마",
      description: "이마의 균형이 좋아 판단력이 안정적입니다. 학습과 계획 실행에서 강점이 드러납니다.",
      advice: "수면 루틴을 일정하게 유지해 집중력을 높이세요.",
    },
    eyes: {
      score: 85,
      title: "또렷한 눈매",
      description: "눈빛이 선명해 대인 신뢰를 얻기 쉽습니다. 실무에서 판단 속도가 빠른 편입니다.",
      advice: "중요한 결정 전에는 하루만 더 검토해 완성도를 높이세요.",
    },
    nose: {
      score: 83,
      title: "균형 잡힌 코",
      description: "재물 흐름을 안정적으로 관리하는 상입니다. 수입과 지출의 균형 감각이 좋습니다.",
      advice: "정기 자동저축 비율을 조금만 올려보세요.",
    },
    mouth: {
      score: 87,
      title: "상양 입꼬리",
      description: "표현력이 좋아 관계 운이 강해집니다. 긍정적인 커뮤니케이션이 강점입니다.",
      advice: "핵심 메시지를 짧게 정리해 전달하면 더 유리합니다.",
    },
    ears: {
      score: 86,
      title: "복스러운 귀",
      description: "귀 라인이 안정적이라 장기운이 좋습니다. 지원을 받는 흐름이 자주 들어옵니다.",
      advice: "도움을 받았을 때 빠르게 피드백을 전해 인연을 이어가세요.",
    },
  });
}

function createMockPremiumAnalysis(): PremiumAnalysisResult {
  return sanitizePremium({
    overall_score: 90,
    face_type: "귀인상",
    overall_impression: "관상과 운세 흐름이 고르게 상승하는 프리미엄 상입니다.",
    emoji: "🔮",
    features: {
      forehead: { score: 92, title: "명예운 이마", description: "지혜와 학습운이 높습니다.", advice: "전문성 강화 학습을 이어가세요." },
      eyes: { score: 89, title: "관계운 눈매", description: "신뢰를 주는 인상입니다.", advice: "협업 기회를 넓히세요." },
      nose: { score: 87, title: "재물운 코", description: "재물 보존력이 좋습니다.", advice: "현금흐름표를 습관화하세요." },
      mouth: { score: 88, title: "복록운 입", description: "언복이 강합니다.", advice: "중요 발표를 주도해 보세요." },
      ears: { score: 86, title: "장수운 귀", description: "꾸준함이 강점입니다.", advice: "생활 리듬을 고정하세요." },
      chin: { score: 84, title: "만년운 턱", description: "후반 운이 안정적입니다.", advice: "장기 포트폴리오를 구축하세요." },
      cheekbones: { score: 83, title: "실행력 광대", description: "추진력이 좋습니다.", advice: "분기 목표를 수치화하세요." },
      eyebrows: { score: 85, title: "사교운 눈썹", description: "인맥 확장에 유리합니다.", advice: "한 달 2회 네트워킹을 고정하세요." },
      philtrum: { score: 82, title: "균형 인중", description: "컨디션 관리가 안정적입니다.", advice: "수분 섭취와 호흡 운동을 병행하세요." },
      face_shape: { score: 90, title: "조화 얼굴형", description: "전체 균형이 뛰어납니다.", advice: "핵심 강점을 브랜딩하세요." },
      hairline: { score: 81, title: "초년운 이마선", description: "초반 운의 기복이 줄어듭니다.", advice: "새 루틴을 4주 유지해 보세요." },
      nasolabial_folds: { score: 84, title: "권위 법령선", description: "중년 이후 영향력이 커집니다.", advice: "전문 분야 레퍼런스를 쌓으세요." },
    },
  });
}

// ═══════════════════════════════════════════
// 새 기능 1: 오늘의 관상 (데일리)
// ═══════════════════════════════════════════

export async function analyzeDailyFortune(
  userData: UserData
): Promise<DailyFortuneResult> {
  const today = new Date().toISOString().split("T")[0];
  const dayName = new Date().toLocaleDateString("ko-KR", { weekday: "long" });

  if (!HAS_GEMINI_PROXY) return createMockDailyFortune(today);

  try {
    const prompt = `
당신은 30년 경력의 동양 관상/사주 명리학자입니다. 시간과 날짜의 천간지지를 정확히 계산하여 오늘의 운세를 풀이합니다.

분석 대상:
- 생년월일: ${userData.birth_date}
- 성별: ${userData.gender === "male" ? "남성" : "여성"}
- 양음력: ${userData.lunar ? "음력" : "양력"}
- 오늘 날짜: ${today} (${dayName})

⭐ 오늘의 운세 작성 규칙 (품질 10배 향상):

**4대 운세 (각 3-4문장)**:
1. **연애운**: 상반기/하반기 흐름 + 구체적 행동 가이드
   - 예: "오전에는 연락을 먼저 하면 좋은 반응을 얻습니다. 저녁에는..."
2. **재물운**: 수입/지출 포인트 + 실천 팁
   - 예: "오늘은 충동구매를 피하고, 저축 계좌에 소액이라도 입금하세요"
3. **건강운**: 신체 부위별 주의사항 + 실천 루틴
   - 예: "목과 어깨가 뭉칠 수 있으니 시간마다 스트레칭 3분"
4. **대인관계**: 만날 사람 유형 + 대화 팁
   - 예: "나이 많은 분과의 대화에서 귀인운이 열립니다"

**시간대별 상세 해석 (각 2-3문장)**:
- **오전 (6-12시)**: 에너지 흐름 + 최적 행동 + 주의사항
- **오후 (12-18시)**: 기회 포착 포인트 + 실행 전략
- **저녁 (18-22시)**: 관계/휴식 가이드 + 마무리 팁
- **밤 (22-6시)**: 수면/회복 조언 + 내일 준비

**추가 필드**:
- hidden_opportunity: 오늘의 숨은 기회 (1-2문장)
- avoid_actions: 오늘 피해야 할 행동 3가지 (배열)
- best_time: 오늘 가장 좋은 시간대 (예: "14:00-16:00")
- energy_pattern: 에너지 흐름 패턴 (예: "오전 상승 → 오후 유지 → 저녁 하락")

반드시 JSON 형식으로만 출력하세요.
{
  "date": "${today}",
  "mood_score": 85,
  "mood_emoji": "😊",
  "mood_title": "활기찬 하루",
  "love_score": 80,
  "love_text": "오전에는 기존 인연과의 대화에서 새로운 감정이 싹틀 수 있습니다. 연락을 먼저 하면 좋은 반응을 얻으며, 특히 점심시간 전후가 좋습니다. 저녁에는 너무 무리하게 감정을 표현하기보다 자연스럽게 시간을 보내는 것이 유리합니다.",
  "money_score": 75,
  "money_text": "오늘은 계획하지 않은 지출이 발생할 수 있으니 사전에 예산을 정해두세요. 오후에 금전 관련 좋은 소식이 들려올 가능성이 있으며, 투자보다는 저축이 유리한 날입니다. 충동구매를 피하고 필요한 것만 구매하세요.",
  "health_score": 88,
  "health_text": "전체적으로 컨디션이 좋은 날이지만 목과 어깨가 뭉칠 수 있습니다. 매 시간 5분씩 가벼운 스트레칭을 하면 피로가 쌓이지 않습니다. 수분 섭취를 평소보다 20% 늘리고, 저녁 식사는 가볍게 하세요.",
  "social_score": 82,
  "social_text": "오늘은 나이가 많은 선배나 멘토와의 대화에서 좋은 조언을 얻을 수 있습니다. 경청하는 자세가 귀인운을 불러오니 먼저 듣고 나중에 말하세요. SNS보다 직접 대면 소통이 더 좋은 결과를 만듭니다.",
  "lucky_color": "파란색",
  "lucky_number": 7,
  "lucky_direction": "남동쪽",
  "lucky_food": "두부된장국",
  "lucky_item": "파란색 손수건",
  "lucky_keyword": "신뢰",
  "star_rating": 4,
  "today_advice": "오늘은 서두르지 말고 한 걸음씩 차근차근 진행하세요. 계획을 3개 이하로 줄이고 각각에 집중하면 성공률이 2배 높아집니다.",
  "hidden_opportunity": "오후 2-4시 사이에 예상치 못한 좋은 제안이나 연락이 올 수 있습니다. 이 시간대에는 전화를 받고 메시지를 바로 확인하세요.",
  "avoid_actions": ["중요한 계약서 서명", "큰 금액 송금", "감정적인 대화"],
  "best_time": "14:00-16:00",
  "energy_pattern": "오전 완만 상승 → 오후 최고조 → 저녁 유지 → 밤 회복",
  "hourly_fortune": {
    "morning": "오전에는 두뇌 회전이 빠르고 판단력이 좋습니다. 중요한 결정이나 창의적인 작업은 이 시간대에 하세요. 단, 서두르지 말고 체크리스트를 활용하면 실수를 줄일 수 있습니다.",
    "afternoon": "오후는 오늘의 하이라이트 시간입니다. 사람을 만나거나 중요한 미팅을 잡기에 최적이며, 협상이나 제안도 좋은 결과를 얻을 수 있습니다. 커피보다 물을 마시면 집중력이 더 오래 유지됩니다.",
    "evening": "저녁에는 가까운 사람들과 편안한 대화를 나누면 관계가 깊어집니다. 새로운 일을 시작하기보다 마무리에 집중하세요. 가벼운 산책이나 스트레칭으로 하루의 긴장을 풀어주세요.",
    "night": "밤에는 충분한 휴식이 내일의 운을 키웁니다. 스마트폰은 잠들기 1시간 전에 내려놓고, 따뜻한 차를 마시며 하루를 정리하세요. 내일 할 일 3가지만 메모해두면 숙면에 도움이 됩니다."
  }
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 30000 });
    const parsed = parseJson<DailyFortuneResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    const validated = DailyFortuneSchema.safeParse(parsed);
    if (!validated.success) throw new Error("DAILY_SCHEMA_INVALID");

    return sanitizeDailyFortune(validated.data, today);
  } catch (error) {
    console.error("데일리 운세 실패:", error);
    return createMockDailyFortune(today);
  }
}

function sanitizeDailyFortune(data: Partial<DailyFortuneResult>, today: string): DailyFortuneResult {
  return {
    date: today,
    mood_score: clampScore(data.mood_score, 80),
    mood_emoji: String(data.mood_emoji ?? "😊"),
    mood_title: String(data.mood_title ?? "균형 잡힌 하루"),
    love_score: clampScore(data.love_score, 75),
    love_text: String(data.love_text ?? "오늘은 관계에서 새로운 발견이 있을 수 있어요."),
    money_score: clampScore(data.money_score, 72),
    money_text: String(data.money_text ?? "작은 지출에 유의하면 재물 흐름이 안정돼요."),
    health_score: clampScore(data.health_score, 82),
    health_text: String(data.health_text ?? "가벼운 스트레칭으로 컨디션을 유지하세요."),
    social_score: clampScore(data.social_score, 78),
    social_text: String(data.social_text ?? "주변 사람들에게 감사를 표현하면 좋은 기운이 돌아와요."),
    lucky_color: String(data.lucky_color ?? "파란색"),
    lucky_number: Number(data.lucky_number) || 7,
    lucky_direction: String(data.lucky_direction ?? "남동쪽"),
    lucky_food: data.lucky_food ? String(data.lucky_food) : undefined,
    lucky_item: data.lucky_item ? String(data.lucky_item) : undefined,
    lucky_keyword: data.lucky_keyword ? String(data.lucky_keyword) : undefined,
    star_rating: data.star_rating ? Math.min(5, Math.max(1, Number(data.star_rating))) : undefined,
    today_advice: String(data.today_advice ?? "오늘 하루 긍정적인 마음을 유지하면 좋은 기회가 찾아올 거예요."),
    hidden_opportunity: String(data.hidden_opportunity ?? ""),
    avoid_actions: Array.isArray(data.avoid_actions) ? data.avoid_actions.map(String) : [],
    best_time: String(data.best_time ?? ""),
    energy_pattern: String(data.energy_pattern ?? ""),
    hourly_fortune: {
      morning: String(data.hourly_fortune?.morning ?? "오전에는 중요한 결정을 내리기 좋은 시간이에요."),
      afternoon: String(data.hourly_fortune?.afternoon ?? "오후에는 사람을 만나면 좋은 소식이 있을 수 있어요."),
      evening: String(data.hourly_fortune?.evening ?? "저녁에는 가까운 사람과의 대화가 행운을 불러와요."),
      night: String(data.hourly_fortune?.night ?? "밤에는 충분한 휴식이 내일의 운을 키워줘요."),
    },
  };
}

function createMockDailyFortune(today: string): DailyFortuneResult {
  return sanitizeDailyFortune({ date: today, mood_score: 83, mood_emoji: "✨", mood_title: "기운이 상승하는 날" }, today);
}

// ═══════════════════════════════════════════
// 새 기능 2: 궁합 분석
// ═══════════════════════════════════════════
export async function analyzeCompatibility(
  myData: UserData,
  partnerData: UserData
): Promise<CompatibilityResult> {
  if (!HAS_GEMINI_PROXY) return createMockCompatibility();

  try {
    const prompt = `
당신은 30년 경력의 동양 관상/사주 명리학자이며 커플 상담 전문가입니다. 사주 오행 분석과 실전 관계 조언을 결합합니다.

궁합 분석 대상:
- 본인: 생년월일 ${myData.birth_date}, ${myData.gender === "male" ? "남성" : "여성"}, ${myData.lunar ? "음력" : "양력"}
- 상대: 생년월일 ${partnerData.birth_date}, ${partnerData.gender === "male" ? "남성" : "여성"}, ${partnerData.lunar ? "음력" : "양력"}

⭐ 궁합 분석 작성 규칙 (최고 품질):

**8가지 궁합 항목 (각 4-5문장, 초구체적)**:
1. **연애 궁합**: 감정 표현 스타일 차이(직접적 vs 은근) + 스킨십 선호도 + 데이트 빈도/장소 취향 + 기념일 중요도 + 질투/소유욕 수준
2. **우정 궁합**: 친구 사귀는 속도(빠름 vs 느림) + 갈등 시 거리두기/즉시해결 패턴 + 비밀 공유 깊이 + 장기 우정 유지 가능성
3. **업무 궁합**: 의사결정 속도(즉결 vs 숙고) + 리더십 스타일(수평 vs 수직) + 마감 압박 대처법 + 성과 vs 과정 중시도 + 피드백 선호 방식
4. **대화 궁합**: 말하기/듣기 비율 + 논쟁 시 논리 vs 감정 우선 + SNS vs 음성통화 선호 + 침묵의 편안함 + 유머 코드 일치도
5. **가치관 궁합**: 돈(쓰기 vs 모으기) + 시간(효율 vs 여유) + 가족(독립 vs 밀착) + 성공관(명예 vs 평온) + 미래 계획(장기 vs 단기)
6. **취미 궁합**: 활동적 vs 정적 취미 + 혼자/함께 시간 배분 + 새로운 시도 적극성 + 취미 투자 금액 + 서로 취미 시간 존중도
7. **성장 궁합**: 서로에게 배우는 점(예: 용기, 인내) + 단점 지적 vs 격려 스타일 + 자기계발 동행 여부 + 과거 트라우마 치유 도움
8. **갈등해결 궁합**: 화났을 때 침묵 vs 즉시토론 + 사과 방식(말 vs 행동) + 냉각기 필요 시간(1시간 vs 1일) + 제3자 개입 허용도 + 과거 실수 재언급 빈도

**상세 조언 (구체적 액션 포함)**:
- **complementary**: 서로 보완하는 점 5-6문장 (구체적 예시 4가지 + 실제 상황 묘사)
  예: "본인의 추진력과 상대의 신중함 → 의사결정 시 본인이 '이거 어때?'라고 제안하면 상대가 '장단점을 따져보니...'라고 보완"
- **warning**: 주의할 점 5-6문장 (충돌 시나리오 3가지 + 각각의 예방법)
  예: "금전 문제: 큰 지출(30만원 이상) 전 반드시 상의 → 각자 월 10만원 자유 예산 설정"
- **advice**: 관계 개선 실천 가이드 7-8문장 (시간대/빈도/방법까지 구체화)
  예: "매주 일요일 저녁 8시 '우리 시간' 30분 → 스마트폰 끄고 이번주 감사한 점 3가지씩 공유"

**추가 필드 (더욱 실용적으로)**:
- conflict_resolution: "1단계: 감정 진정 (각자 2시간 쿨타임, 산책/샤워 추천) → 2단계: I-message로 경청 타임 (각각 5분씩 방해 없이 말하기, 타이머 사용) → 3단계: 브레인스토밍 (해결책 5가지 적고 함께 선택, 1주일 후 재평가)"
- growth_potential: ["매일 아침 운동 30분 (체력 향상 + 대화 시간)", "월 1회 재테크 공부 (투자 vs 저축 균형)", "분기별 여행 계획 (새로운 경험 공유)"]
- date_recommendations: ["조용한 북카페에서 각자 책 읽다가 감상 나누기 (지적 교감)", "주말 아침 동네 시장 장보기 후 함께 요리 (일상 협력)", "드라이브하며 서로 좋아하는 음악 플레이리스트 공유 (취향 이해)"]
- communication_tips: ["중요한 이야기는 배고프지 않고 피곤하지 않을 때 (저녁 8시쯤 권장)", "'너는 왜' 대신 '나는 ~하게 느꼈어' I-message 사용", "잔소리 3번 참았으면 1번은 직접 말하기 (누적 방지)", "칭찬은 구체적으로 (좋았어 → 네가 ~해줘서 정말 고마웠어)", "침묵이 길어지면 '지금 뭐 생각해?' 가볍게 물어보기"]
- long_term_forecast: "1년 후: 서로의 생활 패턴을 완전히 이해하고 편안한 루틴 확립. 갈등 시 해결 시간이 초기 대비 70% 단축됨. 3년 후: 인생의 중요한 선택(이직, 이사 등)을 자연스럽게 함께 상의하는 파트너로 자리잡음. 5년 후: 서로의 장단점을 있는 그대로 수용하며, 각자의 성장이 함께하는 관계의 가치로 연결됨. 함께한 추억이 쌓여 갈등보다 감사가 먼저 떠오르는 관계."

반드시 JSON 형식으로만 출력하세요.
{
  "overall_score": 82,
  "chemistry_emoji": "💕",
  "chemistry_title": "상생의 인연",
  "chemistry_description": "두 분은 서로 다른 에너지를 가졌지만 조화롭게 섞여 시너지를 만드는 궁합입니다. 오행상 한 쪽이 부족한 기운을 다른 쪽이 채워주는 구조로, 함께 있을 때 각자의 단점이 보완되고 장점이 증폭됩니다.",
  "love_score": 85,
  "love_text": "연애 초반에는 서로 다른 매력에 끌리며 열정적으로 시작됩니다. 본인은 감정 표현이 직접적인 반면 상대는 은근하게 표현하는 스타일로, 이 차이를 이해하면 관계가 깊어집니다. 데이트는 활동적인 것과 조용한 것을 번갈아 하면 만족도가 높아집니다. 갈등 시 본인이 먼저 대화를 제안하면 상대가 마음을 열기 쉽습니다.",
  "friendship_score": 78,
  "friendship_text": "우정으로는 서로 다른 관점을 존중하며 오래 유지됩니다. 본인은 즉흥적이고 상대는 계획적이라 여행이나 프로젝트를 함께 할 때 역할이 명확히 나뉩니다. 정기적으로 만나는 약속(월 1회 식사 등)을 정해두면 관계가 더 돈독해집니다. 작은 오해는 즉시 풀고 넘어가는 것이 중요합니다.",
  "work_score": 80,
  "work_text": "업무 상으로는 본인이 아이디어를 내고 상대가 실행을 체계화하는 역할이 잘 맞습니다. 의사결정 시 본인은 빠르고 상대는 신중하므로, 중요한 결정은 하루 정도 숙고 시간을 주면 좋습니다. 정기 미팅을 통해 진행상황을 공유하면 신뢰가 쌓입니다. 성과는 함께 축하하고 실패는 원인 분석에 집중하세요.",
  "communication_score": 83,
  "communication_text": "대화 리듬이 대체로 잘 맞는 편입니다. 본인은 결론부터 말하고 상대는 과정을 설명하는 스타일이므로, 서로의 방식을 인정하면 오해가 줄어듭니다. 중요한 대화는 저녁보다 오전이나 점심시간이 효과적이며, SNS보다 직접 대화가 더 좋습니다. 경청할 때는 고개를 끄덕이거나 짧은 맞장구를 치면 상대가 더 편안해합니다.",
  "values_score": 75,
  "values_text": "인생 목표에서는 60-70% 정도 일치하며, 금전관은 조율이 필요합니다. 본인은 현재를 즐기는 성향, 상대는 미래를 준비하는 성향이므로 예산을 '즐김 70% + 저축 30%'로 나누면 타협점을 찾을 수 있습니다.",
  "hobby_score": 72,
  "hobby_text": "취미가 서로 다르지만 존중하는 태도가 중요합니다. 주말에는 각자의 취미 시간(토요일 오전)과 함께하는 시간(토요일 저녁)을 나누면 만족도가 높아집니다. 가끔 상대의 취미에 동참하면 새로운 재미를 발견할 수 있습니다.",
  "growth_score": 88,
  "growth_text": "서로에게 긍정적인 영향을 주며 함께 성장하는 관계입니다. 본인은 상대에게 도전 정신과 용기를, 상대는 본인에게 안정감과 인내심을 선물합니다. 함께 새로운 분야를 배우면(예: 요리, 언어, 운동) 유대감이 더 강해집니다.",
  "conflict_score": 70,
  "conflict_text": "갈등 해결 방식이 달라 초반에는 어려움이 있을 수 있습니다. 본인은 즉시 해결하려 하고 상대는 시간을 두고 생각하려 합니다. 다툼 후 2시간 정도 쿨타임을 준 뒤 대화하면 효과적이며, 상대방의 감정을 먼저 들어주는 쪽이 먼저 화해를 제안하세요.",
  "complementary": "본인의 추진력과 상대의 신중함이 만나 균형 잡힌 의사결정을 만듭니다. 구체적으로 본인이 '이 식당 가자!'라고 하면 상대가 '리뷰를 보니 이 메뉴가 맛있대'라고 보완하는 식입니다. 또한 본인의 낙천성이 상대의 걱정을 줄여주고, 상대의 계획성이 본인의 충동성을 조절해 줍니다. 금전 관리에서는 본인이 수입 확대에, 상대가 지출 관리에 집중하면 재정이 안정됩니다. 정서적으로는 본인이 힘들 때 상대의 차분한 위로가 큰 힘이 되고, 상대가 지칠 때 본인의 유머가 분위기를 반전시킵니다.",
  "warning": "본인의 즉흥성과 상대의 계획성이 충돌할 수 있습니다. 예를 들어 주말에 본인이 갑자기 여행을 가자고 하면 상대는 당황할 수 있으니, 최소 1주일 전에는 제안하세요. 또한 본인은 감정을 즉시 표현하지만 상대는 생각을 정리한 후 말하므로, 상대가 침묵한다고 무관심한 게 아니라 생각 중임을 이해하세요. 금전 문제에서는 큰 지출(30만원 이상)은 반드시 상의하고, 각자 용돈 계좌를 분리해 자율성을 보장하면 마찰이 줄어듭니다. 가족 행사나 친구 모임 빈도도 사전에 조율이 필요합니다.",
  "advice": "관계를 더 좋게 만들려면 다음을 실천하세요. 1) 매주 일요일 저녁 30분은 '우리 시간'으로 정해 일주일 돌아보기와 다음 주 계획을 공유하세요. 2) 감사 일기를 각자 쓰되, 주 1회는 상대에게 고마운 점 3가지를 말로 전하세요. 3) 갈등이 생기면 '너는 왜 그래' 대신 '나는 ~하게 느꼈어'라는 I-message를 사용하세요. 4) 분기에 한 번은 함께 새로운 것(새로운 식당, 새로운 동네 산책, 새로운 취미)을 시도해 신선함을 유지하세요. 5) 상대의 애정 언어(신체접촉, 칭찬, 선물, 시간, 행동)를 파악해 맞춤형 표현을 하세요.",
  "conflict_resolution": "1단계: 감정 진정 (각자 2시간 쿨타임) → 2단계: 경청 타임 (각각 3분씩 방해 없이 말하기) → 3단계: 해결책 찾기 (타협점 3가지 제시하고 선택)",
  "growth_potential": ["함께 운동하며 건강 개선", "재테크 공부로 경제적 안정", "여행 계획으로 추억 쌓기"],
  "date_recommendations": ["조용한 카페에서 보드게임", "근교 드라이브와 맛집 탐방", "집에서 요리하며 영화 보기"],
  "communication_tips": ["중요한 이야기는 식사 후 여유 있을 때", "비판보다 제안 형식으로 말하기", "작은 변화도 즉시 칭찬하기"],
  "long_term_forecast": "1년 후: 서로의 패턴을 이해하며 안정기 진입. 3년 후: 신뢰가 깊어지며 중요한 결정을 함께 내림. 5년 후: 서로의 성장 파트너로 확고히 자리잡음."
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 30000 });
    const parsed = parseJson<CompatibilityResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    const validated = CompatibilitySchema.safeParse(parsed);
    if (!validated.success) throw new Error("COMPAT_SCHEMA_INVALID");

    return sanitizeCompatibility(validated.data);
  } catch (error) {
    console.error("궁합 분석 실패:", error);
    return createMockCompatibility();
  }
}

function sanitizeCompatibility(data: Partial<CompatibilityResult>): CompatibilityResult {
  return {
    overall_score: clampScore(data.overall_score, 78),
    chemistry_emoji: String(data.chemistry_emoji ?? "💕"),
    chemistry_title: String(data.chemistry_title ?? "조화로운 인연"),
    chemistry_description: String(data.chemistry_description ?? "두 분의 오행이 서로 보완하며 조화를 이루고 있어요."),
    love_score: clampScore(data.love_score, 80),
    love_text: String(data.love_text ?? "감정적으로 통하는 부분이 많아 연애 궁합이 좋아요."),
    friendship_score: clampScore(data.friendship_score, 75),
    friendship_text: String(data.friendship_text ?? "서로 다른 장점을 가져 우정이 오래 유지될 수 있어요."),
    work_score: clampScore(data.work_score, 72),
    work_text: String(data.work_text ?? "업무 스타일이 달라 보완적으로 협업할 수 있어요."),
    communication_score: clampScore(data.communication_score, 78),
    communication_text: String(data.communication_text ?? "대화 리듬이 맞아 소통이 원활해요."),
    values_score: data.values_score !== undefined ? clampScore(data.values_score) : undefined,
    values_text: data.values_text !== undefined ? String(data.values_text) : undefined,
    hobby_score: data.hobby_score !== undefined ? clampScore(data.hobby_score) : undefined,
    hobby_text: data.hobby_text !== undefined ? String(data.hobby_text) : undefined,
    growth_score: data.growth_score !== undefined ? clampScore(data.growth_score) : undefined,
    growth_text: data.growth_text !== undefined ? String(data.growth_text) : undefined,
    conflict_score: data.conflict_score !== undefined ? clampScore(data.conflict_score) : undefined,
    conflict_text: data.conflict_text !== undefined ? String(data.conflict_text) : undefined,
    complementary: String(data.complementary ?? "한 쪽의 부족한 에너지를 다른 쪽이 채워주는 좋은 구조예요."),
    warning: String(data.warning ?? "서로의 페이스를 존중하지 않으면 마찰이 생길 수 있어요."),
    advice: String(data.advice ?? "정기적으로 함께하는 취미를 만들면 관계가 더 깊어져요."),
    conflict_resolution: data.conflict_resolution !== undefined ? String(data.conflict_resolution) : undefined,
    growth_potential: Array.isArray(data.growth_potential) ? data.growth_potential.map(String) : undefined,
    date_recommendations: Array.isArray(data.date_recommendations) ? data.date_recommendations.map(String) : undefined,
    communication_tips: Array.isArray(data.communication_tips) ? data.communication_tips.map(String) : undefined,
    long_term_forecast: data.long_term_forecast !== undefined ? String(data.long_term_forecast) : undefined,
  };
}

function createMockCompatibility(): CompatibilityResult {
  return sanitizeCompatibility({});
}

// ═══════════════════════════════════════════
// 새 기능 3: 심리테스트 분석
// ═══════════════════════════════════════════
export async function analyzePsychTest(
  userData: UserData,
  answers: string[]
): Promise<PsychTestResult> {

  // 오행 집계
  const counts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  answers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

  if (!HAS_GEMINI_PROXY) return createMockPsychResult(dominant);

  try {
    const prompt = `
당신은 30년 경력의 동양 사주 명리학자이자 심리 분석가입니다.

분석 대상:
- 생년월일: ${userData.birth_date}
- 성별: ${userData.gender === "male" ? "남성" : "여성"}
- 심리테스트 오행 결과: 목(wood)=${counts.wood}, 화(fire)=${counts.fire}, 토(earth)=${counts.earth}, 금(metal)=${counts.metal}, 수(water)=${counts.water}
- 주요 기운: ${dominant}

사주 오행 기반 성격 유형을 분석해주세요.

반드시 JSON 형식으로만 출력하세요.
{
  "type_name": "...",
  "type_emoji": "...",
  "type_description": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "compatible_type": "...",
  "advice": "...",
  "percentage": 15
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 30000 });
    const parsed = parseJson<PsychTestResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    const validated = PsychTestSchema.safeParse(parsed);
    if (!validated.success) throw new Error("PSYCH_SCHEMA_INVALID");

    return sanitizePsychResult(validated.data);
  } catch (error) {
    console.error("심리테스트 분석 실패:", error);
    return createMockPsychResult(dominant);
  }
}

function sanitizePsychResult(data: Partial<PsychTestResult>): PsychTestResult {
  return {
    type_name: String(data.type_name ?? "조화로운 균형가"),
    type_emoji: String(data.type_emoji ?? "🌿"),
    type_description: String(data.type_description ?? "균형 잡힌 성격으로 다양한 상황에 잘 적응하는 유형이에요."),
    strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : ["적응력이 뛰어남", "감성과 이성의 균형", "사람들과 잘 어울림"],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses.map(String) : ["결정을 내리는 데 시간이 걸림", "자기 주장이 약할 수 있음", "스트레스를 내면에 쌓는 경향"],
    compatible_type: String(data.compatible_type ?? "열정적이고 추진력 있는 화(火) 기운의 사람과 잘 맞아요."),
    advice: String(data.advice ?? "자신의 직관을 더 신뢰하고, 작은 결정부터 빠르게 내리는 연습을 해보세요."),
    percentage: Math.min(100, Math.max(1, Number(data.percentage) || 15)),
  };
}

function createMockPsychResult(dominant: string): PsychTestResult {
  const types: Record<string, Partial<PsychTestResult>> = {
    wood: {
      type_name: "성장하는 선구자",
      type_emoji: "🌱",
      type_description: "새로운 것을 시작하고 성장하는 것에 에너지를 얻는 목(木) 기운의 소유자예요.",
      strengths: ["창의력이 뛰어남", "도전을 두려워하지 않음", "빠른 판단력"],
      weaknesses: ["인내심이 부족할 수 있음", "너무 많은 일을 벌림", "감정 기복이 있을 수 있음"],
    },
    fire: {
      type_name: "열정의 리더",
      type_emoji: "🔥",
      type_description: "열정과 에너지로 주변을 밝히는 화(火) 기운의 소유자예요.",
      strengths: ["카리스마 있는 리더십", "긍정적인 에너지", "소통 능력이 탁월함"],
      weaknesses: ["충동적인 결정을 할 수 있음", "체력 관리에 유의", "너무 급하게 추진하는 경향"],
    },
    earth: {
      type_name: "든든한 조율가",
      type_emoji: "🏔️",
      type_description: "안정감과 신뢰를 주는 토(土) 기운의 소유자예요.",
      strengths: ["신뢰감을 주는 성격", "포용력이 넓음", "꾸준하고 성실함"],
      weaknesses: ["변화에 느리게 적응", "자기 의견을 내세우기 어려움", "걱정이 많을 수 있음"],
    },
    metal: {
      type_name: "완벽한 실행가",
      type_emoji: "⚔️",
      type_description: "원칙과 완벽함을 추구하는 금(金) 기운의 소유자예요.",
      strengths: ["분석력이 뛰어남", "체계적인 실행력", "디테일에 강함"],
      weaknesses: ["유연성이 부족할 수 있음", "타인에게 높은 기대", "감정 표현이 서투를 수 있음"],
    },
    water: {
      type_name: "깊은 통찰가",
      type_emoji: "🌊",
      type_description: "깊은 사고와 직관을 가진 수(水) 기운의 소유자예요.",
      strengths: ["직관력이 뛰어남", "깊은 공감 능력", "상황을 꿰뚫어보는 눈"],
      weaknesses: ["감정에 빠지기 쉬움", "결단력이 부족할 수 있음", "에너지 소모가 클 수 있음"],
    },
  };

  return sanitizePsychResult(types[dominant] || types.earth);
}

export async function analyzeTojeong(
  userData: UserData
): Promise<TojeongResult> {
  if (!HAS_GEMINI_PROXY) return createMockTojeong();

  try {
    const prompt = `
당신은 30년 경력의 동양 사주/토정비결 전문가입니다.

분석 대상:
- 생년월일: ${userData.birth_date}
- 성별: ${userData.gender === "male" ? "남성" : "여성"}
- 양음력: ${userData.lunar ? "음력" : "양력"}

2026년 병오년(丙午年) 토정비결을 분석해주세요.
144괘 기반으로 한 해 흐름과 월별 운세를 풀이합니다.

반드시 JSON 형식으로만 출력하세요.
{
  "gua_number": "제42괘",
  "gua_name": "풍뢰익(風雷益)",
  "year_summary": "올해는 ...",
  "monthly": [
    { "month": 1, "title": "새 출발의 달", "fortune": "...", "score": 80 },
    { "month": 2, "title": "...", "fortune": "...", "score": 75 },
    ... (1~12월 모두)
  ],
  "best_month": 5,
  "worst_month": 9,
  "year_advice": "..."
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 30000 });
    const parsed = parseJson<TojeongResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");
    return sanitizeTojeong(parsed);
  } catch (error) {
    console.error("토정비결 분석 실패:", error);
    return createMockTojeong();
  }
}

function sanitizeTojeong(data: Partial<TojeongResult>): TojeongResult {
  const defaultMonthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    title: "안정의 달",
    fortune: "큰 변동 없이 안정적인 흐름이 이어집니다.",
    score: 70 + Math.round(Math.random() * 20),
  }));

  const monthly = Array.isArray(data.monthly) && data.monthly.length === 12
    ? data.monthly.map((m: any, i: number) => ({
        month: i + 1,
        title: String(m?.title ?? defaultMonthly[i].title),
        fortune: String(m?.fortune ?? defaultMonthly[i].fortune),
        score: clampScore(m?.score, defaultMonthly[i].score),
      }))
    : defaultMonthly;

  return {
    gua_number: String(data.gua_number ?? "제42괘"),
    gua_name: String(data.gua_name ?? "풍뢰익(風雷益)"),
    year_summary: String(data.year_summary ?? "2026년은 꾸준한 노력이 결실을 맺는 해입니다. 상반기에 기반을 다지고 하반기에 성과를 거두세요."),
    monthly,
    best_month: Number(data.best_month) || 5,
    worst_month: Number(data.worst_month) || 9,
    year_advice: String(data.year_advice ?? "올해는 급하게 서두르기보다 차분하게 준비하는 자세가 중요합니다."),
  };
}

function createMockTojeong(): TojeongResult {
  return sanitizeTojeong({});
}

export async function analyzeDream(
  dreamText: string
): Promise<DreamResult> {
  if (!HAS_GEMINI_PROXY) return createMockDream();

  try {
    const prompt = `
당신은 동양 꿈해몽 전문가입니다.

사용자가 꾼 꿈: "${dreamText}"

이 꿈을 해석해주세요.

반드시 JSON 형식으로만 출력하세요.
{
  "dream_type": "길몽 - 재물의 꿈",
  "dream_emoji": "💰",
  "interpretation": "이 꿈은 ...",
  "fortune_impact": "가까운 시일 내에 ...",
  "lucky_action": "오늘 ...",
  "score": 85
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 30000 });
    const parsed = parseJson<DreamResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");
    return sanitizeDream(parsed);
  } catch (error) {
    console.error("꿈해몽 분석 실패:", error);
    return createMockDream();
  }
}

function sanitizeDream(data: Partial<DreamResult>): DreamResult {
  return {
    dream_type: String(data.dream_type ?? "길몽 - 좋은 징조의 꿈"),
    dream_emoji: String(data.dream_emoji ?? "✨"),
    interpretation: String(data.interpretation ?? "이 꿈은 무의식에서 보내는 긍정적 신호입니다. 새로운 변화와 기회가 다가오고 있음을 암시합니다."),
    fortune_impact: String(data.fortune_impact ?? "가까운 시일 내에 좋은 소식이 있을 수 있으며, 대인관계에서 긍정적인 변화가 예상됩니다."),
    lucky_action: String(data.lucky_action ?? "오늘은 평소 미루던 일을 시작해보세요. 좋은 결과로 이어질 수 있습니다."),
    score: clampScore(data.score, 75),
  };
}

function createMockDream(): DreamResult {
  return sanitizeDream({});
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============= 사주팔자 AI 분석 =============

export interface SajuAIResult {
  personality: string;  // 성격 분석
  strengths: string[];  // 장점 3개
  weaknesses: string[];  // 단점 3개
  love_fortune: string;  // 연애운
  money_fortune: string;  // 재물운
  career_fortune: string;  // 직업운
  health_fortune: string;  // 건강운
  year_2026_fortune: string;  // 2026년 운세
  daeun_analysis: string;  // 현재 대운 해석
  lucky_colors: string[];  // 행운의 색 3개
  lucky_numbers: number[];  // 행운의 숫자 3개
  life_advice: string;  // 인생 조언
}

export interface SajuCompatibilityAIResult {
  compatibility_score: number;  // 궁합 점수
  overall_summary: string;  // 전체 요약
  love_compatibility: string;  // 연애 궁합
  marriage_compatibility: string;  // 결혼 궁합
  work_compatibility: string;  // 업무 궁합
  communication_style: string;  // 의사소통 스타일
  conflict_areas: string[];  // 갈등 요소 3개
  harmony_points: string[];  // 조화 포인트 3개
  advice_for_better_relationship: string;  // 관계 개선 조언
}

export async function analyzeSajuWithAI(
  sajuAnalysis: SajuAnalysis,
  name: string,
  gender: 'male' | 'female'
): Promise<SajuAIResult> {
  if (!HAS_GEMINI_PROXY) return createMockSajuAI();

  const readingTone = (import.meta.env.VITE_READING_TONE || "warm").toLowerCase();

  try {
    const sajuText = formatSajuForPrompt(sajuAnalysis);
    
    const prompt = `
당신은 30년 경력의 최고급 사주명리학 전문가입니다.

분석 대상
- 이름: ${name}
- 성별: ${gender === 'male' ? '남성' : '여성'}

${sajuText}

위 사주팔자를 깊이 있게 분석해주세요.

작성 규칙
- 문장은 짧은 요약이 아니라 스토리형 리딩으로 작성합니다.
- 중복 문구를 피하고, 각 문단에 새로운 정보가 들어가야 합니다.
- 실행 가능한 조언(습관/루틴/의사결정 기준)을 반드시 포함합니다.
- 톤은 다음 지시를 반드시 따르세요: ${getToneInstruction(readingTone)}

반드시 JSON 형식으로만 출력하세요.
{
  "personality": "성격 중심축 + 인간관계 패턴 + 강약점 균형까지 8~10문장",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "love_fortune": "연애운 상세 썰풀이 (6~8문장)",
  "money_fortune": "재물운 상세 썰풀이 (6~8문장)",
  "career_fortune": "직업운 상세 썰풀이 - 추천 분야/일하는 방식 포함 (6~8문장)",
  "health_fortune": "건강운 상세 썰풀이 - 생활 리듬/주의 부위/관리법 포함 (6~8문장)",
  "year_2026_fortune": "2026년 전체 흐름 + 상반기/하반기 + 월별 전략 (8~10문장)",
  "daeun_analysis": "현재 대운 흐름, 기회 구간, 리스크 구간, 실천전략 (6~8문장)",
  "lucky_colors": ["색상1", "색상2", "색상3"],
  "lucky_numbers": [숫자1, 숫자2, 숫자3],
  "life_advice": "인생 전반 조언과 우선순위 가이드 (8~10문장)"
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 40000 });
    const parsed = parseJson<SajuAIResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");
    return sanitizeSajuAI(parsed);
  } catch (error) {
    console.error("사주 AI 분석 실패:", error);
    return createMockSajuAI();
  }
}

export async function analyzeSajuCompatibilityWithAI(
  saju1: FourPillars,
  saju2: FourPillars,
  name1: string,
  name2: string,
  compatibilityScore: number,
  compatibilityDetails: string[]
): Promise<SajuCompatibilityAIResult> {
  if (!HAS_GEMINI_PROXY) return createMockSajuCompatibilityAI();

  try {
    const prompt = `
당신은 30년 경력의 최고급 사주명리학 궁합 전문가입니다.

첫 번째 사람: ${name1}
- 연주: ${saju1.year.combined} (${saju1.year.stemWuxing}, ${saju1.year.branchWuxing})
- 월주: ${saju1.month.combined} (${saju1.month.stemWuxing}, ${saju1.month.branchWuxing})
- 일주: ${saju1.day.combined} (${saju1.day.stemWuxing}, ${saju1.day.branchWuxing})
- 시주: ${saju1.hour.combined} (${saju1.hour.stemWuxing}, ${saju1.hour.branchWuxing})
- 일간: ${saju1.dayMaster} (${saju1.dayMasterWuxing})

두 번째 사람: ${name2}
- 연주: ${saju2.year.combined} (${saju2.year.stemWuxing}, ${saju2.year.branchWuxing})
- 월주: ${saju2.month.combined} (${saju2.month.stemWuxing}, ${saju2.month.branchWuxing})
- 일주: ${saju2.day.combined} (${saju2.day.stemWuxing}, ${saju2.day.branchWuxing})
- 시주: ${saju2.hour.combined} (${saju2.hour.stemWuxing}, ${saju2.hour.branchWuxing})
- 일간: ${saju2.dayMaster} (${saju2.dayMasterWuxing})

기본 궁합 점수: ${compatibilityScore}점
특이사항: ${compatibilityDetails.join(', ')}

두 사람의 사주 궁합을 깊이 있게 분석해주세요.

반드시 JSON 형식으로만 출력하세요.
{
  "compatibility_score": ${compatibilityScore},
  "overall_summary": "두 사람의 궁합을 종합적으로 설명 (5문장)",
  "love_compatibility": "연애 궁합 상세 분석 (4문장)",
  "marriage_compatibility": "결혼 궁합 상세 분석 (4문장)",
  "work_compatibility": "업무/사업 궁합 분석 (3문장)",
  "communication_style": "두 사람의 소통 방식 분석 (3문장)",
  "conflict_areas": ["갈등요소1", "갈등요소2", "갈등요소3"],
  "harmony_points": ["조화포인트1", "조화포인트2", "조화포인트3"],
  "advice_for_better_relationship": "더 좋은 관계를 위한 구체적 조언 (5문장)"
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 40000 });
    const parsed = parseJson<SajuCompatibilityAIResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");
    return sanitizeSajuCompatibilityAI(parsed);
  } catch (error) {
    console.error("사주 궁합 AI 분석 실패:", error);
    return createMockSajuCompatibilityAI();
  }
}

function sanitizeSajuAI(data: Partial<SajuAIResult>): SajuAIResult {
  return {
    personality: ensureNarrative(
      data.personality ?? "균형잡힌 성격의 소유자로, 내면의 힘이 강하고 목표 지향적입니다.",
      "쉽게 말해 타고난 추진력은 강한데, 감정 에너지를 관리하면 성과 폭이 더 커지는 타입입니다. 관계에서는 속도보다 신뢰를 쌓는 방식이 더 오래가는 흐름을 만듭니다.",
      220
    ),
    strengths: Array.isArray(data.strengths) && data.strengths.length === 3
      ? data.strengths.map(s => String(s))
      : ["책임감이 강함", "인내심이 뛰어남", "리더십이 있음"],
    weaknesses: Array.isArray(data.weaknesses) && data.weaknesses.length === 3
      ? data.weaknesses.map(w => String(w))
      : ["완벽주의 경향", "감정 표현이 서툼", "융통성 부족"],
    love_fortune: ensureNarrative(
      data.love_fortune ?? "진실한 관계를 추구하며, 시간이 지날수록 깊어지는 사랑을 경험합니다.",
      "연애운은 감정 소모를 줄이고 소통의 질을 높일 때 크게 상승합니다. 중요한 대화는 결론만 말하기보다 배경과 감정을 함께 전달하면 관계 만족도가 빠르게 올라갑니다.",
      200
    ),
    money_fortune: ensureNarrative(
      data.money_fortune ?? "꾸준한 재물 축적 운이 있으며, 부동산이나 안정적 투자에 유리합니다.",
      "재물운은 단기 수익보다 지출 통제에서 먼저 좋아지는 타입입니다. 고정비를 다듬고 자산 흐름을 기록하는 습관을 붙이면 하반기 기회를 훨씬 안정적으로 잡을 수 있습니다.",
      200
    ),
    career_fortune: ensureNarrative(
      data.career_fortune ?? "전문직이나 관리직에서 능력을 발휘하며, 중년 이후 크게 성공합니다.",
      "직업운은 실적과 신뢰를 동시에 쌓을 때 강하게 열립니다. 결과를 숫자로 남기고 협업 기여도를 기록해두면 승진·이직·프로젝트 확장에서 유리한 고지를 점할 수 있습니다.",
      200
    ),
    health_fortune: ensureNarrative(
      data.health_fortune ?? "전반적으로 건강하나, 소화기와 스트레스 관리에 주의가 필요합니다.",
      "건강운은 무리한 목표보다 지속 가능한 리듬이 핵심입니다. 수면-수분-가벼운 운동 3요소를 일정하게 유지하면 회복력과 집중력이 함께 올라오는 흐름을 만들 수 있습니다.",
      200
    ),
    year_2026_fortune: ensureNarrative(
      data.year_2026_fortune ?? "2026년은 변화의 해입니다. 새로운 기회가 찾아오며, 상반기에 준비한 것이 하반기에 결실을 맺습니다.",
      "2026년은 상반기 정리, 하반기 확장의 리듬이 선명합니다. 욕심을 넓게 펼치기보다 핵심 과제부터 완성하면 운의 탄력이 훨씬 안정적으로 이어집니다.",
      220
    ),
    daeun_analysis: ensureNarrative(
      data.daeun_analysis ?? "현재 대운은 성장과 발전의 시기입니다. 노력한 만큼 성과가 따르는 좋은 흐름입니다.",
      "대운 흐름에서는 기회가 들어오는 타이밍에 결정 지연이 가장 큰 손실이 될 수 있습니다. 판단 기준을 미리 정해두고 70% 확신 시점에 실행하는 전략이 특히 유효합니다.",
      200
    ),
    lucky_colors: Array.isArray(data.lucky_colors) && data.lucky_colors.length === 3
      ? data.lucky_colors.map(c => String(c))
      : ["청색", "녹색", "흰색"],
    lucky_numbers: Array.isArray(data.lucky_numbers) && data.lucky_numbers.length === 3
      ? data.lucky_numbers.map(n => Number(n) || Math.floor(Math.random() * 9) + 1)
      : [3, 7, 9],
    life_advice: ensureNarrative(
      data.life_advice ?? "자신의 장점을 살리되 단점을 보완하는 노력이 필요합니다. 꾸준함이 성공의 열쇠입니다.",
      "지금 흐름의 핵심은 완벽한 계획보다 반복 가능한 실행입니다. 주간 목표를 3개 이하로 줄이고, 완료 증거를 남기는 루틴을 만들면 사주 해석이 실제 성과로 연결되는 속도가 빨라집니다.",
      220
    ),
  };
}

function sanitizeSajuCompatibilityAI(data: Partial<SajuCompatibilityAIResult>): SajuCompatibilityAIResult {
  return {
    compatibility_score: clampScore(data.compatibility_score, 70),
    overall_summary: String(data.overall_summary ?? "두 사람은 서로를 보완하는 좋은 관계입니다. 시간이 지날수록 이해가 깊어집니다."),
    love_compatibility: String(data.love_compatibility ?? "감정적으로 깊은 교감이 가능하며, 서로를 존중하는 관계를 형성할 수 있습니다."),
    marriage_compatibility: String(data.marriage_compatibility ?? "결혼 생활에서 안정적이고 행복한 가정을 꾸릴 가능성이 높습니다."),
    work_compatibility: String(data.work_compatibility ?? "업무적으로도 좋은 시너지를 낼 수 있으며, 함께 목표를 달성하기에 좋습니다."),
    communication_style: String(data.communication_style ?? "의사소통이 원활하며, 서로의 의견을 경청하는 태도가 돋보입니다."),
    conflict_areas: Array.isArray(data.conflict_areas) && data.conflict_areas.length === 3
      ? data.conflict_areas.map(c => String(c))
      : ["금전 관련 가치관 차이", "가족과의 관계", "생활 패턴 차이"],
    harmony_points: Array.isArray(data.harmony_points) && data.harmony_points.length === 3
      ? data.harmony_points.map(h => String(h))
      : ["서로의 목표 지향성이 비슷함", "감정적 지원을 잘함", "취미와 관심사 공유"],
    advice_for_better_relationship: String(data.advice_for_better_relationship ?? "서로의 차이를 인정하고 존중하는 것이 중요합니다. 소통을 늘리고 이해의 폭을 넓히세요."),
  };
}

function createMockSajuAI(): SajuAIResult {
  return sanitizeSajuAI({});
}

function createMockSajuCompatibilityAI(): SajuCompatibilityAIResult {
  return sanitizeSajuCompatibilityAI({});
}

// ═══════════════════════════════════════════
// 타로 카드 리딩
// ═══════════════════════════════════════════

export async function analyzeTarot(userData: UserData): Promise<TarotResult> {
  const today = new Date().toISOString().split("T")[0];

  if (!HAS_GEMINI_PROXY) return createMockTarot();

  try {
    const prompt = `
당신은 20년 경력의 타로 마스터이자 사주 명리학자입니다. 사주를 기반으로 오늘의 타로 3장을 리딩합니다.

분석 대상:
- 생년월일: ${userData.birth_date}
- 성별: ${userData.gender === "male" ? "남성" : "여성"}
- 오늘 날짜: ${today}

타로 카드 78장 중 사주 에너지에 맞는 3장을 선택해 주세요.
- 카드 1: 현재 상황 (지금 에너지)
- 카드 2: 조언 (나아갈 방향)
- 카드 3: 미래 전망 (앞으로의 흐름)

각 카드 설명은 구체적이고 실용적으로, 2-3문장으로 작성하세요.
카드 이름은 한국어로 (예: "태양", "달", "마법사", "황제", "여황제", "운명의 수레바퀴", "별", "탑", "심판" 등)

반드시 JSON만 출력하세요:
{
  "spread_theme": "오늘 ${userData.name || "당신"}의 타로 리딩",
  "cards": [
    {
      "name": "태양",
      "emoji": "☀️",
      "position": "현재",
      "keyword": "활력, 성공",
      "message": "지금 당신에게는 밝은 에너지가 넘칩니다. 자신감을 갖고 앞으로 나아가세요. 주변 사람들에게 긍정적인 영향을 미치는 시기입니다.",
      "is_positive": true
    },
    {
      "name": "은둔자",
      "emoji": "🏔️",
      "position": "조언",
      "keyword": "성찰, 내면",
      "message": "지금은 혼자만의 시간을 갖고 내면의 소리에 귀 기울이세요. 서두르지 말고 차분히 생각을 정리하는 것이 최선입니다. 깊은 성찰이 새로운 길을 열어줄 거예요.",
      "is_positive": true
    },
    {
      "name": "별",
      "emoji": "⭐",
      "position": "미래",
      "keyword": "희망, 치유",
      "message": "희망과 치유의 에너지가 다가오고 있습니다. 노력한 것들이 빛을 발하며 원하던 방향으로 흘러갈 것입니다. 믿음을 잃지 마세요.",
      "is_positive": true
    }
  ],
  "overall_message": "오늘의 타로는 내면의 힘을 믿고 꾸준히 나아가라는 메시지를 전합니다. 현재의 밝은 에너지를 잘 활용하여 신중하게 행동하면, 앞으로 희망찬 결과가 기다리고 있습니다."
}
`;

    const text = await requestGeminiText(prompt, { timeoutMs: 25000 });
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim()) as TarotResult;
    if (!parsed?.cards || parsed.cards.length !== 3) throw new Error("카드 형식 오류");
    return parsed;
  } catch {
    return createMockTarot();
  }
}

function createMockTarot(): TarotResult {
  return {
    spread_theme: "오늘의 타로 리딩",
    cards: [
      {
        name: "태양",
        emoji: "☀️",
        position: "현재",
        keyword: "활력, 성공",
        message: "지금 당신에게는 밝은 에너지가 가득합니다. 긍정적인 마음으로 하루를 시작하세요. 주변에서 좋은 소식이 들려올 수 있습니다.",
        is_positive: true,
      },
      {
        name: "은둔자",
        emoji: "🏔️",
        position: "조언",
        keyword: "성찰, 내면",
        message: "잠시 멈추고 자신의 내면을 들여다볼 시간입니다. 서두르지 말고 천천히 생각을 정리하세요. 혼자만의 시간이 큰 지혜를 가져다 줄 거예요.",
        is_positive: true,
      },
      {
        name: "별",
        emoji: "⭐",
        position: "미래",
        keyword: "희망, 치유",
        message: "희망과 새로운 가능성이 다가오고 있습니다. 지금의 노력이 반드시 빛을 발할 것입니다. 믿음을 잃지 말고 계속 나아가세요.",
        is_positive: true,
      },
    ],
    overall_message: "오늘의 타로는 내면의 힘을 믿고 꾸준히 나아가라는 메시지를 전합니다. 지금의 밝은 에너지를 잘 활용하여 신중하게 행동하면, 앞으로 희망찬 결과가 기다리고 있습니다.",
  };
}


