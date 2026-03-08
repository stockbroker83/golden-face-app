/**
 * 토스 리워드 광고 버튼 컴포넌트
 * - 광고 시청 → 복주머니 30개 획득
 * - 일일 10회 제한
 * - 시청 중 로딩 상태 표시
 */

import { useState } from "react";
import { tossAdManager } from "../services/tossAdManager";
import "../styles/TossAdRewardButton.css";

interface Props {
  onReward: (points: number) => void;
}

export default function TossAdRewardButton({ onReward }: Props) {
  const [isWatching, setIsWatching] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(tossAdManager.getTodayWatchCount());
  const [todayRewards, setTodayRewards] = useState(
    tossAdManager.getTodayRewards()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { dailyLimit, rewardPerAd } = tossAdManager.getConfig();
  const remainingCount = dailyLimit - todayCount;
  const canWatch = tossAdManager.canWatch();

  const handleWatchAd = async () => {
    if (!canWatch.allowed) {
      setError(canWatch.reason || "광고를 시청할 수 없습니다.");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsWatching(true);

    // 광고 시작
    const adId = tossAdManager.startAd();
    setCurrentAdId(adId);

    // 광고 로딩 시뮬레이션 (실제로는 토스 SDK 연동)
    try {
      // 2초 로딩
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!isWatching) return; // 취소됨

      // 3초 재생 (스킵 가능으로 설정하려면 더 짧게 가능)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (!isWatching) return; // 취소됨

      // 광고 시청 완료
      const result = tossAdManager.completeAd(adId);

      if (result.success) {
        setSuccess(true);
        setTodayCount(tossAdManager.getTodayWatchCount());
        setTodayRewards(tossAdManager.getTodayRewards());
        onReward(result.reward);

        // 성공 메시지 3초 표시
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError("광고 시청 보상을 받을 수 없습니다.");
        tossAdManager.failAd(adId);
      }
    } catch (err) {
      setError("광고 시청 중 오류가 발생했습니다.");
      tossAdManager.failAd(adId);
    } finally {
      setIsWatching(false);
      setCurrentAdId(null);
    }
  };

  const handleCancel = () => {
    if (currentAdId) {
      tossAdManager.failAd(currentAdId);
    }
    setIsWatching(false);
    setCurrentAdId(null);
    setError("광고 시청이 취소되었습니다.");
  };

  return (
    <div className="toss-ad-reward-container">
      {/* 광고 시청 버튼 */}
      {!isWatching && (
        <button
          className={`ad-watch-btn ${!canWatch.allowed ? "disabled" : ""}`}
          onClick={handleWatchAd}
          disabled={!canWatch.allowed}
        >
          <span className="ad-icon">📺</span>
          <div className="ad-btn-text">
            <strong>광고 보고 복주머니 받기</strong>
            <span className="ad-reward">+{rewardPerAd} 포인트</span>
          </div>
          <span className="ad-count">
            {remainingCount > 0 ? `${remainingCount}회 남음` : "한도 도달"}
          </span>
        </button>
      )}

      {/* 광고 시청 중 */}
      {isWatching && (
        <div className="ad-watching-overlay">
          <div className="ad-watching-content">
            <div className="ad-spinner">
              <div className="spinner-circle"></div>
            </div>
            <h2>광고 재생 중...</h2>
            <p>시청을 완료하면 포인트를 받을 수 있습니다</p>
            <button className="cancel-btn" onClick={handleCancel}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      {success && (
        <div className="ad-success-message">
          <div className="success-content">
            <span className="success-icon">✨</span>
            <strong>+{rewardPerAd} 포인트 획득!</strong>
            <p>오늘 {todayRewards}포인트를 모았어요</p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="ad-error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button
            className="error-close"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* 통계 */}
      <div className="ad-stats">
        <div className="stat-item">
          <span className="stat-label">오늘의 광고 시청</span>
          <span className="stat-value">
            {todayCount}/{dailyLimit}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">오늘 획득한 포인트</span>
          <span className="stat-value" style={{ color: "#f59e0b" }}>
            +{todayRewards}
          </span>
        </div>
      </div>
    </div>
  );
}
