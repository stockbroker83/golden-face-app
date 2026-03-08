// ─── 기존 타입 ───
export interface UserData {
  birth_date: string;
  birth_time?: string;
  gender: "male" | "female";
  lunar: boolean;
  name?: string;
}

export interface FeatureAnalysis {
  score: number;
  title: string;
  description: string;
  advice: string;
  daily_tip?: string;
  confidence_reason?: string;
}

export interface FreeAnalysisResult {
  overall_score: number;
  face_type: string;
  overall_impression: string;
  emoji: string;
  forehead: FeatureAnalysis;
  eyes: FeatureAnalysis;
  nose: FeatureAnalysis;
  mouth: FeatureAnalysis;
  ears: FeatureAnalysis;
}

export interface PremiumAnalysisResult {
  overall_score: number;
  face_type: string;
  overall_impression: string;
  emoji: string;
  features: {
    forehead: FeatureAnalysis;
    eyes: FeatureAnalysis;
    nose: FeatureAnalysis;
    mouth: FeatureAnalysis;
    ears: FeatureAnalysis;
    chin: FeatureAnalysis;
    cheekbones: FeatureAnalysis;
    eyebrows: FeatureAnalysis;
    philtrum: FeatureAnalysis;
    face_shape: FeatureAnalysis;
    hairline: FeatureAnalysis;
    nasolabial_folds: FeatureAnalysis;
  };
  saju: {
    love: string;
    money: string;
    health: string;
    career: string;
  };
  relations: {
    helpful: string;
    harmful: string;
  };
  tarot: {
    present: string;
    future: string;
    action: string;
  };
  iching: {
    gua: string;
    interpretation: string;
    advice: string;
  };
}

export interface VIPMembership {
  user_id: string;
  is_vip: boolean;
  purchased_at: string;
  order_id?: string;
}

export interface FaceData {
  image_file?: File;
  image_url?: string;
  free_analysis?: FreeAnalysisResult;
  premium_analysis?: PremiumAnalysisResult;
}

export type FaceAnalysisResult = FreeAnalysisResult;

// ─── 새 타입: 데일리 관상 ───
export interface DailyFortuneResult {
  date: string;
  mood_score: number;
  mood_emoji: string;
  mood_title: string;
  love_score: number;
  love_text: string;
  money_score: number;
  money_text: string;
  health_score: number;
  health_text: string;
  social_score: number;
  social_text: string;
  lucky_color: string;
  lucky_number: number;
  lucky_direction: string;
  today_advice: string;
  hidden_opportunity?: string;
  avoid_actions?: string[];
  best_time?: string;
  energy_pattern?: string;
  hourly_fortune: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
}

// ─── 새 타입: 궁합 분석 ───
export interface CompatibilityResult {
  overall_score: number;
  chemistry_emoji: string;
  chemistry_title: string;
  chemistry_description: string;
  love_score: number;
  love_text: string;
  friendship_score: number;
  friendship_text: string;
  work_score: number;
  work_text: string;
  communication_score: number;
  communication_text: string;
  values_score?: number;
  values_text?: string;
  hobby_score?: number;
  hobby_text?: string;
  growth_score?: number;
  growth_text?: string;
  conflict_score?: number;
  conflict_text?: string;
  complementary: string;
  warning: string;
  advice: string;
  conflict_resolution?: string;
  growth_potential?: string[];
  date_recommendations?: string[];
  communication_tips?: string[];
  long_term_forecast?: string;
}

// ─── 새 타입: 심리테스트 ───
export interface PsychTestQuestion {
  id: number;
  question: string;
  emoji: string;
  options: {
    text: string;
    value: string;
  }[];
}

export interface PsychTestResult {
  type_name: string;
  type_emoji: string;
  type_description: string;
  strengths: string[];
  weaknesses: string[];
  compatible_type: string;
  advice: string;
  percentage: number;
}

// ─── 새 타입: 포인트/복주머니 시스템 ───
export interface PointsData {
  total_points: number;
  today_earned: number;
  streak_days: number;
  last_daily_claim: string;
  last_streak_date?: string;
  longest_streak?: number;
  history: PointHistory[];
  daily_usage?: DailyUsage;
}

export interface DailyUsage {
  date: string;
  daily_fortune: number;
  compatibility: number;
  psych_test: number;
  saju: number;
  tarot_chat: number;
  face_reading_12: number;
}

export interface StreakData {
  current_streak: number;
  last_check_date: string;
  longest_streak: number;
}

export interface PointHistory {
  date: string;
  action: string;
  points: number;
  emoji: string;
}

// ─── 앱 상태 확장 ───
export type AppStep =
  | "notice"
  | "userinfo"
  | "hub"
  | "upload"
  | "analyzing"
  | "free"
  | "payment"
  | "premium_analyzing"
  | "premium"
  | "daily"
  | "compatibility"
  | "compatibility_result"
  | "psychtest"
  | "psychtest_result"
  | "points"
  | "lucky_numbers"
  | "charm"
  | "wish_wall"
  | "tojeong"
  | "dream"
  | "lucky_style"
  | "saju"
  | "saju_compatibility";

export interface AppState {
  user_data: UserData | null;
  face_data: FaceData | null;
  is_paid: boolean;
  current_step: AppStep;
  daily_fortune: DailyFortuneResult | null;
  compatibility: CompatibilityResult | null;
  compatibility_partner: UserData | null;
  psych_test_result: PsychTestResult | null;
  points: PointsData;
}
