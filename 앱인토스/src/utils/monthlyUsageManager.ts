/**
 * Monthly AI Usage Tracker
 * 월간 AI 사용 횟수 추적 및 제한 (150회/월)
 */

const MONTHLY_LIMIT = 150;
const STORAGE_KEY_PREFIX = "monthly_ai_usage_";

/**
 * Get current month key in YYYY-MM format
 */
function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${STORAGE_KEY_PREFIX}${year}-${month}`;
}

/**
 * Get monthly usage count for current month
 */
export function getMonthlyUsage(): number {
  const key = getCurrentMonthKey();
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Get remaining monthly usage
 */
export function getRemainingMonthly(): number {
  const used = getMonthlyUsage();
  return Math.max(0, MONTHLY_LIMIT - used);
}

/**
 * Check if user can make an AI call
 */
export function canUseAI(): boolean {
  return getRemainingMonthly() > 0;
}

/**
 * Increment monthly usage counter
 * @returns true if successful, false if limit reached
 */
export function incrementMonthlyUsage(): boolean {
  if (!canUseAI()) {
    return false;
  }
  
  const key = getCurrentMonthKey();
  const current = getMonthlyUsage();
  localStorage.setItem(key, String(current + 1));
  return true;
}

/**
 * Get monthly usage info for display
 */
export function getMonthlyUsageInfo(): {
  used: number;
  remaining: number;
  total: number;
} {
  const used = getMonthlyUsage();
  return {
    used,
    remaining: getRemainingMonthly(),
    total: MONTHLY_LIMIT,
  };
}

/**
 * Reset usage for testing purposes
 */
export function resetMonthlyUsage(): void {
  const key = getCurrentMonthKey();
  localStorage.removeItem(key);
}
