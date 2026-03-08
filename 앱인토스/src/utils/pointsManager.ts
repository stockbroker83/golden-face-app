import { PointsData, PointHistory } from "../types";

const STORAGE_KEY = "golden_face_points";

export function loadPoints(): PointsData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PointsData;
  } catch {
    return null;
  }
}

export function savePoints(data: PointsData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addPoints(
  current: PointsData,
  amount: number,
  action: string,
  emoji: string
): PointsData {
  const today = new Date().toISOString().split("T")[0];
  const entry: PointHistory = { date: today, action, points: amount, emoji };
  const isNewDay = current.last_daily_claim !== today;

  return {
    ...current,
    total_points: current.total_points + amount,
    today_earned: isNewDay ? amount : current.today_earned + amount,
    last_daily_claim: today,
    history: [entry, ...current.history].slice(0, 50),
  };
}

export function checkStreak(current: PointsData) {
  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  const last = current.last_streak_date || "";
  const alreadyClaimed = last === today;

  if (alreadyClaimed) {
    return {
      canClaim: false,
      nextStreak: current.streak_days,
      reset: false,
    };
  }

  if (last === yesterday) {
    return {
      canClaim: true,
      nextStreak: current.streak_days + 1,
      reset: false,
    };
  }

  return {
    canClaim: true,
    nextStreak: 1,
    reset: Boolean(last),
  };
}

// ==========================================
// Streak Reward Configuration
// ==========================================
export const STREAK_REWARDS = [
  { day: 3, points: 10, badge: '🔥 3일 연속', emoji: '🔥', description: '꾸준함의 시작!' },
  { day: 7, points: 30, badge: '⭐ 7일 연속', emoji: '⭐', description: '일주일 달성!' },
  { day: 14, points: 100, badge: '💎 14일 연속', emoji: '💎', description: '2주 연속 멋져요!' },
  { day: 30, points: 0, badge: '👑 30일 연속', emoji: '👑', description: '프리미엄 1개월 무료!' },
];

// ==========================================
// Points Earning Methods
// ==========================================
export const POINTS_METHODS = {
  dailyCheckIn: { points: 5, label: '출석 체크', emoji: '📅' },
  faceAnalysis: { points: 10, label: '관상 분석', emoji: '🔮' },
  dailyFortune: { points: 10, label: '일일 운세', emoji: '🌟' },
  compatibility: { points: 15, label: '궁합 분석', emoji: '❤️' },
  psychTest: { points: 20, label: '심리 테스트', emoji: '🧪' },
  share: { points: 5, label: '결과 공유', emoji: '📤' },
  firstPurchase: { points: 100, label: '첫 구매 보너스', emoji: '🎁' },
  referral: { points: 50, label: '친구 초대', emoji: '👥' },
};

// ==========================================
// Points Exchange Shop
// ==========================================
export const POINTS_SHOP = [
  { id: 'premium_trial', name: '프리미엄 무료 체험', points: 500, emoji: '👑' },
  { id: 'compatibility_extra', name: '궁합 분석 추가권', points: 200, emoji: '❤️' },
  { id: 'special_amulet', name: '특별 부적', points: 100, emoji: '🧿' },
  { id: 'premium_fortune', name: '특급 운세', points: 50, emoji: '⭐' },
  { id: 'custom_analysis', name: '맞춤 분석', points: 300, emoji: '🔮' },
];

export interface StreakReward {
  bonusPoints: number;
  rewardLabel: string;
  emoji: string;
  unlockedPremium: boolean;
  streakDay: number;
}

export function addStreak(current: PointsData) {
  const today = new Date().toISOString().split("T")[0];
  const streakInfo = checkStreak(current);

  if (!streakInfo.canClaim) {
    return { 
      updated: current, 
      bonusPoints: 0, 
      rewardLabel: '', 
      emoji: '', 
      unlockedPremium: false,
      streakDay: current.streak_days 
    };
  }

  // Check for milestone rewards
  const milestone = STREAK_REWARDS.find(r => r.day === streakInfo.nextStreak);
  let bonusPoints = 0;
  let rewardLabel = "";
  let rewardEmoji = "";
  let unlockedPremium = false;

  if (milestone) {
    bonusPoints = milestone.points;
    rewardLabel = milestone.badge;
    rewardEmoji = milestone.emoji;

    // Special handling for 30-day streak
    if (milestone.day === 30) {
      unlockedPremium = true;
      localStorage.setItem(
        "golden_face_vip",
        JSON.stringify({
          user_id: `streak_${Date.now()}`,
          is_vip: true,
          purchased_at: new Date().toISOString(),
          order_id: "STREAK_30_REWARD",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      );
    }
  }

  // Add base check-in points
  const baseUpdated = addPoints(current, POINTS_METHODS.dailyCheckIn.points, "출석 체크", "📅");
  
  // Add bonus points if milestone reached
  const withBonus = bonusPoints > 0 
    ? addPoints(baseUpdated, bonusPoints, rewardLabel, rewardEmoji) 
    : baseUpdated;

  const updated: PointsData = {
    ...withBonus,
    streak_days: streakInfo.nextStreak,
    last_streak_date: today,
    longest_streak: Math.max(withBonus.longest_streak || 0, streakInfo.nextStreak),
  };

  return { 
    updated, 
    bonusPoints, 
    rewardLabel, 
    emoji: rewardEmoji, 
    unlockedPremium,
    streakDay: streakInfo.nextStreak 
  };
}

export function canClaimDaily(current: PointsData): boolean {
  return checkStreak(current).canClaim;
}

// ==========================================
// Points Deduction
// ==========================================
export function deductPoints(
  current: PointsData,
  amount: number,
  reason: string,
  emoji: string
): PointsData | null {
  if (current.total_points < amount) {
    return null; // Insufficient points
  }

  const today = new Date().toISOString().split("T")[0];
  const entry: PointHistory = { 
    date: today, 
    action: reason, 
    points: -amount, 
    emoji 
  };

  return {
    ...current,
    total_points: current.total_points - amount,
    history: [entry, ...current.history].slice(0, 50),
  };
}

// ==========================================
// Points Exchange
// ==========================================
export interface ExchangeResult {
  success: boolean;
  message: string;
  updatedPoints?: PointsData;
  itemId?: string;
}

export function exchangePoints(
  current: PointsData,
  itemId: string
): ExchangeResult {
  const item = POINTS_SHOP.find(i => i.id === itemId);
  
  if (!item) {
    return {
      success: false,
      message: '존재하지 않는 상품입니다.',
    };
  }

  const updated = deductPoints(current, item.points, `${item.name} 교환`, item.emoji);
  
  if (!updated) {
    return {
      success: false,
      message: `포인트가 부족합니다. (필요: ${item.points}P, 보유: ${current.total_points}P)`,
    };
  }

  // Handle special items
  if (itemId === 'premium_trial') {
    localStorage.setItem(
      "golden_face_vip",
      JSON.stringify({
        user_id: `points_exchange_${Date.now()}`,
        is_vip: true,
        purchased_at: new Date().toISOString(),
        order_id: `POINTS_EXCHANGE_${itemId.toUpperCase()}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
    );
  }

  return {
    success: true,
    message: `${item.name}을(를) 교환했습니다!`,
    updatedPoints: updated,
    itemId,
  };
}

// ==========================================
// Get Next Streak Reward Info
// ==========================================
export function getNextStreakReward(currentStreak: number) {
  const nextReward = STREAK_REWARDS.find(r => r.day > currentStreak);
  
  if (!nextReward) {
    return {
      hasNext: false,
      daysUntil: 0,
      reward: null,
    };
  }

  return {
    hasNext: true,
    daysUntil: nextReward.day - currentStreak,
    reward: nextReward,
  };
}

// ==========================================
// Initialize Default Points Data
// ==========================================
export function getDefaultPointsData(): PointsData {
  return {
    total_points: 0,
    today_earned: 0,
    streak_days: 0,
    longest_streak: 0,
    last_daily_claim: "",
    last_streak_date: "",
    history: [],
    daily_usage: {
      date: "",
      daily_fortune: 0,
      compatibility: 0,
      psych_test: 0,
      saju: 0,
      tarot_chat: 0,
      face_reading_12: 0,
    },
  };
}

// ==========================================
// Daily Usage Limits & Checks
// ==========================================
export const USAGE_LIMITS = {
  daily_fortune: { cost: 50, limit: 5 },
  compatibility: { cost: 100, limit: 3 },
  psych_test: { cost: 50, limit: 5 },
  saju: { cost: 100, limit: 2 },
  tarot_chat: { cost: 50, limit: 10 },
  face_reading_12: { cost: 200, limit: 1 },
};

export type UsageType = keyof typeof USAGE_LIMITS;

/**
 * 일일 사용 가능 여부 확인
 */
export function canUseFeature(
  points: PointsData,
  featureType: UsageType,
  isPremium: boolean = false
): { allowed: boolean; reason?: string } {
  // 프리미엄은 무제한
  if (isPremium) {
    return { allowed: true };
  }

  const config = USAGE_LIMITS[featureType];
  const today = new Date().toISOString().split("T")[0];

  // 포인트 부족 체크
  if (points.total_points < config.cost) {
    return {
      allowed: false,
      reason: `복주머니가 부족합니다. (필요: ${config.cost}개, 보유: ${points.total_points}개)`,
    };
  }

  // 일일 사용 횟수 체크
  const usage = points.daily_usage;
  if (!usage || usage.date !== today) {
    // 오늘 첫 사용
    return { allowed: true };
  }

  const usedCount = usage[featureType] || 0;
  if (usedCount >= config.limit) {
    return {
      allowed: false,
      reason: `오늘의 사용 한도(${config.limit}회)를 모두 사용했습니다. 내일 다시 이용해주세요!`,
    };
  }

  return { allowed: true };
}

/**
 * 기능 사용 (포인트 차감 + 사용 횟수 증가)
 */
export function useFeature(
  points: PointsData,
  featureType: UsageType,
  isPremium: boolean = false
): PointsData | null {
  // 프리미엄은 포인트 차감 없이 사용만 기록
  if (isPremium) {
    return points; // 그냥 통과
  }

  const config = USAGE_LIMITS[featureType];
  const today = new Date().toISOString().split("T")[0];

  // 사용 가능 체크
  const check = canUseFeature(points, featureType, isPremium);
  if (!check.allowed) {
    return null;
  }

  // 포인트 차감
  const deducted = deductPoints(points, config.cost, getFeatureName(featureType), "🎯");
  if (!deducted) {
    return null;
  }

  // 일일 사용 횟수 업데이트
  const usage = deducted.daily_usage;
  const isNewDay = !usage || usage.date !== today;

  return {
    ...deducted,
    daily_usage: {
      date: today,
      daily_fortune: isNewDay ? 0 : usage!.daily_fortune,
      compatibility: isNewDay ? 0 : usage!.compatibility,
      psych_test: isNewDay ? 0 : usage!.psych_test,
      saju: isNewDay ? 0 : usage!.saju,
      tarot_chat: isNewDay ? 0 : usage!.tarot_chat,
      face_reading_12: isNewDay ? 0 : usage!.face_reading_12,
      [featureType]: (isNewDay ? 0 : usage![featureType]) + 1,
    },
  };
}

/**
 * 기능 이름 반환
 */
function getFeatureName(featureType: UsageType): string {
  const names: Record<UsageType, string> = {
    daily_fortune: "오늘의 관상",
    compatibility: "궁합 분석",
    psych_test: "심리테스트",
    saju: "사주 분석",
    tarot_chat: "타로 채팅",
    face_reading_12: "12관상 분석",
  };
  return names[featureType];
}

/**
 * 오늘 남은 사용 횟수
 */
export function getRemainingUses(
  points: PointsData,
  featureType: UsageType
): number {
  const config = USAGE_LIMITS[featureType];
  const today = new Date().toISOString().split("T")[0];
  const usage = points.daily_usage;

  if (!usage || usage.date !== today) {
    return config.limit;
  }

  const used = usage[featureType] || 0;
  return Math.max(0, config.limit - used);
}
