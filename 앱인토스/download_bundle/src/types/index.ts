export interface UserData {
  birth_date: string;
  birth_time?: string;
  gender: "male" | "female";
  lunar: boolean;
}

export interface FeatureAnalysis {
  score: number;
  title: string;
  description: string;
  advice: string;
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

export interface AppState {
  user_data: UserData | null;
  face_data: FaceData | null;
  is_paid: boolean;
  current_step:
    | "notice"
    | "userinfo"
    | "upload"
    | "analyzing"
    | "free"
    | "payment"
    | "premium_analyzing"
    | "premium";
}

export type FaceAnalysisResult = FreeAnalysisResult;
