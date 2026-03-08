/**
 * Toss Ads 광고 관리 시스템
 * - 리워드 광고 전용
 * - 광고 시청 완료 시 포인트 지급
 * - 일일 광고 시청 한도 제한
 */

interface TossAd {
  adId: string;
  status: "ready" | "loading" | "playing" | "completed" | "failed";
  timestamp: number;
}

interface AdWatchLog {
  date: string;
  watchCount: number;
  totalRewards: number;
}

class TossAdManager {
  private currentAd: TossAd | null = null;
  private watchLog: AdWatchLog[] = [];
  private dailyLimit = 10; // 하루 최대 광고 시청 횟수
  private rewardPerAd = 30; // 광고당 포인트
  private storageKey = "toss_ad_watch_log";

  constructor() {
    this.loadWatchLog();
  }

  /**
   * 시청 로그 로드
   */
  private loadWatchLog() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.watchLog = raw ? JSON.parse(raw) : [];
      // 오래된 기록 정리 (최근 30일만 보관)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      this.watchLog = this.watchLog.filter(
        (log) => new Date(log.date) > thirtyDaysAgo
      );
    } catch {
      this.watchLog = [];
    }
  }

  /**
   * 시청 로그 저장
   */
  private saveWatchLog() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.watchLog));
    } catch {
      console.error("Failed to save watch log");
    }
  }

  /**
   * 오늘 시청한 광고 횟수
   */
  getTodayWatchCount(): number {
    const today = new Date().toISOString().split("T")[0];
    const todayLog = this.watchLog.find((log) => log.date === today);
    return todayLog?.watchCount || 0;
  }

  /**
   * 오늘 획득한 포인트
   */
  getTodayRewards(): number {
    const today = new Date().toISOString().split("T")[0];
    const todayLog = this.watchLog.find((log) => log.date === today);
    return todayLog?.totalRewards || 0;
  }

  /**
   * 광고 시청 가능 여부 확인
   */
  canWatch(): { allowed: boolean; reason?: string } {
    const today = new Date().toISOString().split("T")[0];
    const todayLog = this.watchLog.find((log) => log.date === today);
    const watchCount = todayLog?.watchCount || 0;

    if (watchCount >= this.dailyLimit) {
      return {
        allowed: false,
        reason: `오늘의 광고 시청 한도(${this.dailyLimit}회)를 모두 사용했습니다. 내일 다시 시청하세요!`,
      };
    }

    return { allowed: true };
  }

  /**
   * 광고 시청 시작
   */
  startAd(): string {
    const adId = `ad_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const ad: TossAd = {
      adId,
      status: "loading",
      timestamp: Date.now(),
    };
    this.currentAd = ad;
    return adId;
  }

  /**
   * 광고 시청 완료
   */
  completeAd(adId: string): { success: boolean; reward: number } {
    if (!this.currentAd || this.currentAd.adId !== adId) {
      return { success: false, reward: 0 };
    }

    const today = new Date().toISOString().split("T")[0];
    let todayLog = this.watchLog.find((log) => log.date === today);

    if (!todayLog) {
      todayLog = { date: today, watchCount: 0, totalRewards: 0 };
      this.watchLog.push(todayLog);
    }

    // 한도 체크
    if (todayLog.watchCount >= this.dailyLimit) {
      return { success: false, reward: 0 };
    }

    // 보상 지급
    todayLog.watchCount += 1;
    todayLog.totalRewards += this.rewardPerAd;
    this.currentAd.status = "completed";
    this.saveWatchLog();

    return { success: true, reward: this.rewardPerAd };
  }

  /**
   * 광고 실패
   */
  failAd(adId: string): void {
    if (this.currentAd && this.currentAd.adId === adId) {
      this.currentAd.status = "failed";
      this.currentAd = null;
    }
  }

  /**
   * 광고 재시도
   */
  retryAd(adId: string): string {
    if (this.currentAd && this.currentAd.adId === adId) {
      this.currentAd.status = "loading";
      return adId;
    }
    return this.startAd();
  }

  /**
   * 설정값 조회
   */
  getConfig() {
    return {
      dailyLimit: this.dailyLimit,
      rewardPerAd: this.rewardPerAd,
    };
  }

  /**
   * 통계 조회
   */
  getStats() {
    const totalWatched = this.watchLog.reduce(
      (sum, log) => sum + log.watchCount,
      0
    );
    const totalRewards = this.watchLog.reduce(
      (sum, log) => sum + log.totalRewards,
      0
    );

    return {
      totalWatched,
      totalRewards,
      todayWatched: this.getTodayWatchCount(),
      todayRewards: this.getTodayRewards(),
      watchLog: this.watchLog,
    };
  }

  /**
   * 테스트용: 시청 로그 초기화
   */
  resetForTesting() {
    this.watchLog = [];
    this.saveWatchLog();
    this.currentAd = null;
  }
}

// 싱글톤 인스턴스
export const tossAdManager = new TossAdManager();

export type { TossAd, AdWatchLog };
