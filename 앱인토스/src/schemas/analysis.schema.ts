import { z } from 'zod';

// ==========================================
// Free Analysis (3 basic items)
// ==========================================
export const FreeAnalysisItemSchema = z.object({
  category: z.string().min(1),
  score: z.number().min(0).max(100),
  summary: z.string().min(1),
  emoji: z.string().optional(),
});

export const FreeAnalysisSchema = z.object({
  totalScore: z.number().min(0).max(100),
  items: z.array(FreeAnalysisItemSchema).length(3),
  timestamp: z.string().optional(),
});

export type FreeAnalysis = z.infer<typeof FreeAnalysisSchema>;

// ==========================================
// Premium Analysis (12 detailed parts)
// ==========================================
export const PremiumPartSchema = z.object({
  part: z.string().min(1),
  score: z.number().min(0).max(100),
  description: z.string().min(1),
  emoji: z.string().optional(),
  advice: z.string().optional(),
});

export const MonthlyFortuneSchema = z.object({
  month: z.number().min(1).max(12),
  fortune: z.string().min(1),
  score: z.number().min(0).max(100).optional(),
  keywords: z.array(z.string()).optional(),
});

export const TarotCardSchema = z.object({
  position: z.enum(['past', 'present', 'future']),
  cardName: z.string(),
  meaning: z.string(),
  emoji: z.string().optional(),
});

export const SajuAnalysisSchema = z.object({
  element: z.enum(['wood', 'fire', 'earth', 'metal', 'water']),
  primaryElement: z.string(),
  secondaryElement: z.string().optional(),
  balance: z.string(),
  luckyElements: z.array(z.string()),
});

export const BenefactorSchema = z.object({
  appearanceTime: z.string(),
  characteristics: z.array(z.string()),
  checklist: z.array(z.string()),
  advice: z.string(),
});

export const PremiumAnalysisSchema = z.object({
  totalScore: z.number().min(0).max(100),
  detailedAnalysis: z.array(PremiumPartSchema).length(12),
  yearlyFortune: z.array(MonthlyFortuneSchema).length(12),
  tarotReading: z.array(TarotCardSchema).length(3),
  sajuAnalysis: SajuAnalysisSchema,
  benefactor: BenefactorSchema,
  timestamp: z.string().optional(),
});

export type PremiumAnalysis = z.infer<typeof PremiumAnalysisSchema>;

// ==========================================
// Daily Fortune
// ==========================================
export const DailyFortuneTimeSlotSchema = z.object({
  time: z.string(),
  score: z.number().min(0).max(100),
  activity: z.string().optional(),
});

export const DailyFortuneCategoriesSchema = z.object({
  love: z.number().min(0).max(100),
  money: z.number().min(0).max(100),
  health: z.number().min(0).max(100),
  relationships: z.number().min(0).max(100),
});

export const DailyFortuneSchema = z.object({
  date: z.string(),
  totalScore: z.number().min(0).max(100),
  categories: DailyFortuneCategoriesSchema,
  timeSlots: z.array(DailyFortuneTimeSlotSchema).min(3),
  luckyColor: z.string(),
  luckyNumbers: z.array(z.number()).min(1).max(5),
  luckyDirection: z.string(),
  advice: z.string().optional(),
  warning: z.string().optional(),
});

export type DailyFortune = z.infer<typeof DailyFortuneSchema>;

// ==========================================
// Compatibility Analysis
// ==========================================
export const CompatibilityCategorySchema = z.object({
  category: z.enum(['love', 'friendship', 'business', 'communication']),
  score: z.number().min(0).max(100),
  description: z.string(),
});

export const CompatibilitySchema = z.object({
  user1Name: z.string().optional(),
  user2Name: z.string().optional(),
  totalScore: z.number().min(0).max(100),
  categories: z.array(CompatibilityCategorySchema).length(4),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  advice: z.string(),
  timestamp: z.string().optional(),
});

export type Compatibility = z.infer<typeof CompatibilitySchema>;

// ==========================================
// Psychology Test (오행 성격 테스트)
// ==========================================
export const PsychTestAnswerSchema = z.object({
  questionId: z.number(),
  answerId: z.number(),
  element: z.enum(['wood', 'fire', 'earth', 'metal', 'water']),
});

export const PsychTestResultSchema = z.object({
  primaryType: z.enum(['wood', 'fire', 'earth', 'metal', 'water']),
  secondaryType: z.enum(['wood', 'fire', 'earth', 'metal', 'water']).optional(),
  typeName: z.string(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  advice: z.array(z.string()),
  famousPeople: z.array(z.string()).optional(),
  emoji: z.string().optional(),
  timestamp: z.string().optional(),
});

export type PsychTestResult = z.infer<typeof PsychTestResultSchema>;

// ==========================================
// Helper Functions
// ==========================================

/**
 * Safely parse and validate data with fallback
 */
export function safeParseWithFallback<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback: T
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Schema validation failed:', error);
    return fallback;
  }
}

/**
 * Validate API response with retry logic
 */
export async function validateWithRetry<T>(
  schema: z.ZodSchema<T>,
  apiCall: () => Promise<unknown>,
  maxRetries: number = 3,
  fallback: T
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await apiCall();
      return schema.parse(data);
    } catch (error) {
      console.error(`Validation attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  console.error('All validation attempts failed, using fallback');
  return fallback;
}
