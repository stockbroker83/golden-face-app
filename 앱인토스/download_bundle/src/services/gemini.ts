import { GoogleGenerativeAI } from "@google/generative-ai";
import { FreeAnalysisResult, PremiumAnalysisResult, UserData } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

function getModel() {
  if (!API_KEY) return null;
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export async function analyzeFaceFree(
  imageFile: File,
  userData: UserData
): Promise<FreeAnalysisResult> {
  const model = getModel();
  if (!model) return createMockFreeAnalysis();

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

무료 분석 (5가지만 간략하게)
1. 이마 (額相) - 지혜와 명예운
2. 눈 (眼相) - 재물과 인간관계운
3. 코 (鼻相) - 재물과 사업운
4. 입 (口相) - 복록과 자손운
5. 귀 (耳相) - 수명과 조상복

각 항목은 다음을 포함하세요.
- 점수 (0~100)
- 짧은 제목
- 설명 2문장
- 조언 1문장

반드시 JSON 형식으로만 출력하세요.
{
  "overall_score": 85,
  "face_type": "귀인상",
  "overall_impression": "전체적으로 복이 많고 인덕이 좋습니다.",
  "emoji": "✨",
  "forehead": { "score": 90, "title": "넓은 이마", "description": "...", "advice": "..." },
  "eyes": { "score": 84, "title": "또렷한 눈매", "description": "...", "advice": "..." },
  "nose": { "score": 82, "title": "균형잡힌 코", "description": "...", "advice": "..." },
  "mouth": { "score": 88, "title": "상양 입꼬리", "description": "...", "advice": "..." },
  "ears": { "score": 86, "title": "복스러운 귀", "description": "...", "advice": "..." }
}
`;

    // 30초 타임아웃
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 30000);
    });

    const apiPromise = model.generateContent([
      { inlineData: { mimeType: imageFile.type || "image/jpeg", data: imageBase64 } },
      { text: prompt },
    ]);

    const result = await Promise.race([apiPromise, timeoutPromise]);

    const text = result.response.text();
    const parsed = parseJson<FreeAnalysisResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    return sanitizeFree(parsed);
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
  const model = getModel();
  if (!model) return createMockPremiumAnalysis();

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
- 각 항목: 점수 + 제목 + 설명 5문장 + 조언 3문장

사주 4대운 (각 3문장)
- 연애운, 재물운, 건강운, 직장운

귀인/악연 관상
- helpful, harmful

맞춤 타로 조언
- present, future, action

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

    // 30초 타임아웃
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 30000);
    });

    const apiPromise = model.generateContent([
      { inlineData: { mimeType: imageFile.type || "image/jpeg", data: imageBase64 } },
      { text: prompt },
    ]);

    const result = await Promise.race([apiPromise, timeoutPromise]);

    const text = result.response.text();
    const parsed = parseJson<PremiumAnalysisResult>(text);
    if (!parsed) throw new Error("JSON 형식 오류");

    return sanitizePremium(parsed);
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

function sanitizeFeature(feature: any) {
  return {
    score: clampScore(feature?.score),
    title: String(feature?.title ?? "균형 잡힌 특징"),
    description: String(feature?.description ?? "안정적인 흐름이 보입니다."),
    advice: String(feature?.advice ?? "현재의 장점을 꾸준히 유지해 보세요."),
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
    overall_impression: String(data.overall_impression ?? "전반적으로 상승 기류가 강한 프리미엄 상입니다."),
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
      love: String(data.saju?.love ?? "2026년에는 관계의 폭이 넓어지며 진중한 인연이 들어옵니다."),
      money: String(data.saju?.money ?? "상반기에는 지출 관리, 하반기에는 수익 확장 흐름이 강합니다."),
      health: String(data.saju?.health ?? "수면 패턴과 소화기 관리에 집중하면 전체 컨디션이 안정됩니다."),
      career: String(data.saju?.career ?? "협업 프로젝트에서 성과가 두드러지며 역할 확장이 유리합니다."),
    },
    relations: {
      helpful: String(data.relations?.helpful ?? "온화한 인상과 안정적인 말투를 가진 사람이 귀인으로 작용합니다."),
      harmful: String(data.relations?.harmful ?? "극단적으로 단정적이고 조급한 성향의 사람과는 거리 조절이 필요합니다."),
    },
    tarot: {
      present: String(data.tarot?.present ?? "지금은 기반을 단단히 다지는 시기입니다."),
      future: String(data.tarot?.future ?? "가까운 시기에 선택의 폭이 넓어지고 좋은 기회가 열립니다."),
      action: String(data.tarot?.action ?? "우선순위를 3개로 줄이고 실행 속도를 높이세요."),
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
