import type {
  FreeAnalysis,
  PremiumAnalysis,
  DailyFortune,
  Compatibility,
  PsychTestResult,
} from '../schemas/analysis.schema';

// ==========================================
// Free Analysis Fallback
// ==========================================
export function getFallbackFreeAnalysis(): FreeAnalysis {
  return {
    totalScore: 75,
    items: [
      {
        category: '이마 (지성)',
        score: 78,
        summary: '넓고 높은 이마는 지혜와 통찰력을 상징합니다. 현재 당신의 지적 능력이 빛을 발하는 시기입니다.',
        emoji: '🧠',
      },
      {
        category: '눈 (직관)',
        score: 72,
        summary: '맑고 생기있는 눈빛에서 강한 직관력이 느껴집니다. 사람을 보는 통찰력이 뛰어난 편입니다.',
        emoji: '👁️',
      },
      {
        category: '코 (재물)',
        score: 75,
        summary: '코의 형태가 안정적이어서 재물운이 꾸준한 편입니다. 금전적으로 안정된 시기가 오고 있습니다.',
        emoji: '💰',
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// ==========================================
// Premium Analysis Fallback
// ==========================================
export function getFallbackPremiumAnalysis(): PremiumAnalysis {
  return {
    totalScore: 85,
    detailedAnalysis: [
      { part: '이마', score: 88, description: '넓고 높은 이마는 지혜와 리더십의 상징. 전략적 사고가 뛰어남', emoji: '🧠' },
      { part: '눈', score: 82, description: '맑고 생기있는 눈빛. 직관력과 통찰력이 뛰어나며 사람을 잘 파악함', emoji: '👁️' },
      { part: '코', score: 85, description: '안정적인 코 형태. 재물운이 좋고 금전 관리 능력이 뛰어남', emoji: '💰' },
      { part: '귀', score: 83, description: '복이 많은 귀 모양. 평생 귀인의 도움을 받는 상', emoji: '👂' },
      { part: '입', score: 80, description: '적당한 입 크기. 말재주가 좋고 대인관계에서 유리함', emoji: '👄' },
      { part: '턱', score: 87, description: '든든한 턱선. 말년운이 좋고 재복이 많은 상', emoji: '🎯' },
      { part: '미간', score: 84, description: '넓은 미간. 도량이 크고 포용력이 있음', emoji: '✨' },
      { part: '광대', score: 81, description: '적당히 발달한 광대. 리더십과 추진력을 갖춤', emoji: '⚡' },
      { part: '인중', score: 79, description: '깊고 뚜렷한 인중. 건강운과 자손운이 좋음', emoji: '🌱' },
      { part: '피부·기색', score: 86, description: '밝고 윤기있는 피부. 현재 기운이 좋고 운이 상승 중', emoji: '✨' },
      { part: '윤곽', score: 88, description: '균형잡힌 얼굴형. 전체적으로 조화로운 인상', emoji: '💎' },
      { part: '전체 인상', score: 90, description: '귀한 상. 큰 성공을 이룰 수 있는 운명', emoji: '👑' },
    ],
    yearlyFortune: [
      { month: 1, fortune: '새로운 시작의 달. 계획한 일을 추진하기 좋은 시기', score: 88 },
      { month: 2, fortune: '인간관계에서 좋은 인연이 찾아옴. 협력이 중요', score: 82 },
      { month: 3, fortune: '재물운 상승. 투자나 사업 기회포착', score: 90 },
      { month: 4, fortune: '건강 관리 필요. 충분한 휴식 취하기', score: 75 },
      { month: 5, fortune: '사랑운 최고조. 감정표현이 중요한 시기', score: 92 },
      { month: 6, fortune: '일운 상승. 승진이나 중요한 성과 기대', score: 85 },
      { month: 7, fortune: '가족과의 화합. 여행운도 좋음', score: 80 },
      { month: 8, fortune: '학업·자기개발 적기. 새로운 분야 도전', score: 87 },
      { month: 9, fortune: '대인관계 주의. 말조심하고 신중하게', score: 72 },
      { month: 10, fortune: '재물운 대길. 큰 수입이나 횡재수', score: 95 },
      { month: 11, fortune: '변화의 시기. 새로운 기회가 다가옴', score: 88 },
      { month: 12, fortune: '마무리와 정리. 내년을 위한 준비', score: 83 },
    ],
    tarotReading: [
      { position: 'past', cardName: '힘 (Strength)', meaning: '과거의 어려움을 극복한 내적 힘', emoji: '💪' },
      { position: 'present', cardName: '별 (The Star)', meaning: '현재 희망과 영감이 가득한 시기', emoji: '⭐' },
      { position: 'future', cardName: '태양 (The Sun)', meaning: '밝은 미래, 성공과 행복이 기다림', emoji: '☀️' },
    ],
    sajuAnalysis: {
      element: 'fire',
      primaryElement: '화(火) - 불의 기운',
      secondaryElement: '목(木) - 나무의 기운',
      balance: '화와 목이 조화를 이루어 발전과 성장의 에너지가 강함',
      luckyElements: ['목(木)', '화(火)', '토(土)'],
    },
    benefactor: {
      appearanceTime: '2026년 3월 ~ 6월 사이',
      characteristics: [
        '10살 이상 연상의 사람',
        '전문직 또는 경영자',
        '밝고 긍정적인 에너지',
        '사회적 영향력이 있는 인물',
      ],
      checklist: [
        '적극적으로 네트워킹 행사 참여',
        '선배나 멘토와의 만남 늘리기',
        '온라인 커뮤니티 활동 활발히',
        '배움의 자세로 겸손하게 임하기',
      ],
      advice: '귀인은 당신의 진정성을 보고 다가옵니다. 항상 성실하고 정직한 태도를 유지하세요.',
    },
    timestamp: new Date().toISOString(),
  };
}

// ==========================================
// Daily Fortune Fallback
// ==========================================
export function getFallbackDailyFortune(): DailyFortune {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    date: today,
    totalScore: 83,
    categories: {
      love: 75,
      money: 88,
      health: 82,
      relationships: 87,
    },
    timeSlots: [
      { time: '06:00-12:00', score: 78, activity: '아침 일찍 중요한 일 처리하기' },
      { time: '12:00-18:00', score: 90, activity: '오후에 중요한 미팅이나 약속 잡기' },
      { time: '18:00-24:00', score: 75, activity: '저녁엔 휴식과 재충전 시간' },
    ],
    luckyColor: '골드',
    luckyNumbers: [7, 29, 42],
    luckyDirection: '남서쪽',
    advice: '오늘은 재물운이 특히 좋은 날입니다. 투자나 중요한 결정을 내리기 좋은 시기입니다.',
    warning: '오후 3시경 감정적인 대화는 피하세요.',
  };
}

// ==========================================
// Compatibility Fallback
// ==========================================
export function getFallbackCompatibility(): Compatibility {
  return {
    totalScore: 78,
    categories: [
      {
        category: 'love',
        score: 85,
        description: '서로에게 강한 끌림이 있으며, 감정적 교감이 깊습니다.',
      },
      {
        category: 'friendship',
        score: 72,
        description: '친구로서도 좋은 관계. 서로를 이해하고 지지합니다.',
      },
      {
        category: 'business',
        score: 80,
        description: '업무적으로도 훌륭한 파트너. 서로의 강점을 살립니다.',
      },
      {
        category: 'communication',
        score: 75,
        description: '대화가 원활하나 가끔 오해 가능. 솔직한 소통 필요.',
      },
    ],
    strengths: [
      '서로를 존중하는 마음',
      '목표를 향한 공동의 비전',
      '감정적 안정감',
      '서로의 장점을 인정',
    ],
    weaknesses: [
      '가끔 소통 부족',
      '고집이 부딪힐 때가 있음',
      '서로 다른 가치관',
    ],
    advice: '서로의 다름을 인정하고 존중하는 것이 중요합니다. 정기적인 대화 시간을 가지고 솔직하게 감정을 나누세요.',
    timestamp: new Date().toISOString(),
  };
}

// ==========================================
// Psychology Test Fallback
// ==========================================
export function getFallbackPsychTestResult(): PsychTestResult {
  return {
    primaryType: 'fire',
    secondaryType: 'earth',
    typeName: '불의 리더형',
    description: '열정적이고 추진력이 강한 당신은 타고난 리더입니다. 목표를 향해 불타오르는 의지가 있으며, 주변 사람들에게 긍정적인 영향을 줍니다.',
    strengths: [
      '강한 추진력과 실행력',
      '타고난 리더십',
      '긍정적이고 낙관적',
      '도전을 즐김',
      '빠른 결단력',
    ],
    weaknesses: [
      '성급한 판단',
      '타인의 의견 무시 경향',
      '인내심 부족',
      '번아웃 위험',
    ],
    advice: [
      '때로는 주변의 조언에 귀 기울이기',
      '충분한 휴식과 재충전 시간 갖기',
      '장기적 계획 세우기',
      '감정 조절 연습하기',
    ],
    famousPeople: ['스티브 잡스', '일론 머스크', '오프라 윈프리'],
    emoji: '🔥',
    timestamp: new Date().toISOString(),
  };
}

// ==========================================
// Error Messages
// ==========================================
export const ERROR_MESSAGES = {
  API_ERROR: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  VALIDATION_ERROR: '데이터 검증에 실패했습니다. 다시 시도해주세요.',
  IMAGE_ERROR: '이미지를 불러올 수 없습니다. 다른 이미지를 선택해주세요.',
  PAYMENT_ERROR: '결제 처리 중 오류가 발생했습니다.',
  INSUFFICIENT_POINTS: '포인트가 부족합니다.',
};
