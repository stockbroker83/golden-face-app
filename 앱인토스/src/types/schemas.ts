import { z } from "zod";

const featureSchema = z.object({
  score: z.number().min(0).max(100),
  title: z.string(),
  description: z.string(),
  advice: z.string(),
});

export const FreeAnalysisSchema = z.object({
  overall_score: z.number().min(0).max(100),
  face_type: z.string(),
  overall_impression: z.string(),
  emoji: z.string(),
  forehead: featureSchema,
  eyes: featureSchema,
  nose: featureSchema,
  mouth: featureSchema,
  ears: featureSchema,
});

export const PremiumAnalysisSchema = z.object({
  overall_score: z.number().min(0).max(100),
  face_type: z.string(),
  overall_impression: z.string(),
  emoji: z.string(),
  features: z.object({
    forehead: featureSchema,
    eyes: featureSchema,
    nose: featureSchema,
    mouth: featureSchema,
    ears: featureSchema,
    chin: featureSchema,
    cheekbones: featureSchema,
    eyebrows: featureSchema,
    philtrum: featureSchema,
    face_shape: featureSchema,
    hairline: featureSchema,
    nasolabial_folds: featureSchema,
  }),
  saju: z.object({
    love: z.string(),
    money: z.string(),
    health: z.string(),
    career: z.string(),
  }),
  relations: z.object({ helpful: z.string(), harmful: z.string() }),
  tarot: z.object({ present: z.string(), future: z.string(), action: z.string() }),
  iching: z.object({ gua: z.string(), interpretation: z.string(), advice: z.string() }),
});

export const DailyFortuneSchema = z.object({
  date: z.string(),
  mood_score: z.number().min(0).max(100),
  mood_emoji: z.string(),
  mood_title: z.string(),
  love_score: z.number().min(0).max(100),
  love_text: z.string(),
  money_score: z.number().min(0).max(100),
  money_text: z.string(),
  health_score: z.number().min(0).max(100),
  health_text: z.string(),
  social_score: z.number().min(0).max(100),
  social_text: z.string(),
  lucky_color: z.string(),
  lucky_number: z.number(),
  lucky_direction: z.string(),
  today_advice: z.string(),
  hourly_fortune: z.object({
    morning: z.string(),
    afternoon: z.string(),
    evening: z.string(),
    night: z.string(),
  }),
});

export const CompatibilitySchema = z.object({
  overall_score: z.number().min(0).max(100),
  chemistry_emoji: z.string(),
  chemistry_title: z.string(),
  chemistry_description: z.string(),
  love_score: z.number().min(0).max(100),
  love_text: z.string(),
  friendship_score: z.number().min(0).max(100),
  friendship_text: z.string(),
  work_score: z.number().min(0).max(100),
  work_text: z.string(),
  communication_score: z.number().min(0).max(100),
  communication_text: z.string(),
  complementary: z.string(),
  warning: z.string(),
  advice: z.string(),
});

export const PsychTestSchema = z.object({
  type_name: z.string(),
  type_emoji: z.string(),
  type_description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  compatible_type: z.string(),
  advice: z.string(),
  percentage: z.number().min(1).max(100),
});
