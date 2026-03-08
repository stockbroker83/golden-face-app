import { useState } from "react";
import { IAP } from "@apps-in-toss/web-framework";
import { PointsData } from "../types";
import { addPoints, savePoints } from "../utils/pointsManager";
import TossAdRewardButton from "../components/TossAdRewardButton";
import "../styles/PointsPage.css";

interface Props {
  points: PointsData;
  onBack: () => void;
  onUpdatePoints: (points: PointsData) => void;
}

const REWARDS = [
  { name: "프리미엄 1회 무료", cost: 500, emoji: "👑", available: true },
  { name: "궁합 분석 추가 1회", cost: 200, emoji: "💕", available: true },
  { name: "행운 부적 이미지", cost: 100, emoji: "🧧", available: true },
  { name: "오늘의 특별 운세", cost: 50, emoji: "⭐", available: true },
];

const POINT_PACKAGES = [
  { sku: "points_100", name: "복주머니 100개", points: 100, price: 3900, bonus: 0 },
  { sku: "points_350", name: "복주머니 300+50", points: 350, price: 9900, bonus: 50, popular: true },
  { sku: "points_800", name: "복주머니 700+100", points: 800, price: 19900, bonus: 100 },
] as const;

type PointPackage = {
  sku: string;
  name: string;
  points: number;
  price: number;
  bonus: number;
  popular?: boolean;
};

export default function PointsPage({ points, onBack, onUpdatePoints }: Props) {
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const handleTossAdReward = (rewardPoints: number) => {
    const updated = addPoints(points, rewardPoints, "광고 시청", "📺");
    savePoints(updated);
    onUpdatePoints(updated);
  };

  const grantPointsFromPurchase = (pkg: PointPackage, orderId: string) => {
    const updated = addPoints(points, pkg.points, `${pkg.name} 충전`, "💳");
    savePoints(updated);
    onUpdatePoints(updated);
    localStorage.setItem(
      "golden_face_last_points_purchase",
      JSON.stringify({ orderId, sku: pkg.sku, points: pkg.points, purchasedAt: new Date().toISOString() })
    );
  };

  const handleBuyPoints = (pkg: PointPackage) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);
    setIsPurchasing(pkg.sku);

    try {
      const cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku: pkg.sku,
          processProductGrant: ({ orderId }) => {
            grantPointsFromPurchase(pkg, orderId);
            return true;
          },
        },
        onEvent: () => {
          setPurchaseSuccess(`${pkg.name} 충전 완료! (+${pkg.points} 복주머니)`);
          setIsPurchasing(null);
          cleanup?.();
        },
        onError: (err: any) => {
          const code = String(err?.code || err?.message || "");
          if (code.includes("USER_CANCEL") || code.toLowerCase().includes("cancel")) {
            setPurchaseError("결제가 취소되었습니다.");
          } else {
            setPurchaseError("결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          }
          setIsPurchasing(null);
          cleanup?.();
        },
      });
    } catch {
      setPurchaseError("현재 환경에서는 결제를 시작할 수 없습니다. 앱인토스 환경에서 다시 시도해주세요.");
      setIsPurchasing(null);
    }
  };

  const handleDevTopup = (pkg: PointPackage) => {
    const orderId = `DEV_POINTS_${Date.now()}`;
    grantPointsFromPurchase(pkg, orderId);
    setPurchaseSuccess(`테스트 충전 완료! (+${pkg.points} 복주머니)`);
  };

  return (
    <div className="points-page">
      <header className="points-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🏮 복주머니</h1>
      </header>

      {/* 메인 현황 */}
      <section className="points-hero">
        <div className="points-lantern">🏮</div>
        <div className="points-number">{points.total_points}</div>
        <div className="points-label">내 복주머니</div>

        <div className="points-stats">
          <div className="stat">
            <strong>{points.today_earned}</strong>
            <span>오늘 획득</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <strong>{points.streak_days}일</strong>
            <span>연속 출석</span>
          </div>
        </div>
      </section>

      {/* 토스 광고 보상 섹션 */}
      <section className="toss-ad-section">
        <div className="ad-container">
          <TossAdRewardButton onReward={handleTossAdReward} />
        </div>
      </section>

      {/* 복주머니 충전 */}
      <section className="topup-section">
        <h2>충전하기</h2>
        <p className="topup-desc">결제로 복주머니를 즉시 충전할 수 있어요.</p>

        {purchaseError && <div className="topup-alert error">⚠️ {purchaseError}</div>}
        {purchaseSuccess && <div className="topup-alert success">✅ {purchaseSuccess}</div>}

        <div className="topup-list">
          {POINT_PACKAGES.map((pkg: PointPackage) => (
            <div key={pkg.sku} className={`topup-card ${pkg.popular ? "popular" : ""}`}>
              {pkg.popular && <span className="topup-badge">인기</span>}
              <div className="topup-main">
                <strong>{pkg.name}</strong>
                <span>🏮 {pkg.points}개</span>
              </div>
              <div className="topup-meta">
                <span className="topup-price">₩{pkg.price.toLocaleString()}</span>
                {pkg.bonus > 0 && <span className="topup-bonus">보너스 +{pkg.bonus}</span>}
              </div>
              <button
                className="topup-btn"
                onClick={() => handleBuyPoints(pkg)}
                disabled={isPurchasing !== null}
              >
                {isPurchasing === pkg.sku ? "결제 진행 중..." : "충전하기"}
              </button>

              {import.meta.env.DEV && (
                <button
                  className="topup-dev-btn"
                  onClick={() => handleDevTopup(pkg)}
                  disabled={isPurchasing !== null}
                >
                  테스트 충전
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 복주머니 적립 방법 */}
      <section className="earn-section">
        <h2>적립 방법</h2>
        <div className="earn-list">
          <div className="earn-item">
            <span className="earn-emoji">📅</span>
            <div className="earn-info">
              <strong>출석 체크</strong>
              <span>매일 접속만 해도</span>
            </div>
            <span className="earn-amount">+5</span>
          </div>
          <div className="earn-item">
            <span className="earn-emoji">👁️</span>
            <div className="earn-info">
              <strong>관상 분석</strong>
              <span>AI 관상 분석 완료 시</span>
            </div>
            <span className="earn-amount">+10</span>
          </div>
          <div className="earn-item">
            <span className="earn-emoji">🔮</span>
            <div className="earn-info">
              <strong>오늘의 관상</strong>
              <span>데일리 운세 확인 시</span>
            </div>
            <span className="earn-amount">+10</span>
          </div>
          <div className="earn-item">
            <span className="earn-emoji">💕</span>
            <div className="earn-info">
              <strong>궁합 분석</strong>
              <span>궁합 분석 완료 시</span>
            </div>
            <span className="earn-amount">+15</span>
          </div>
          <div className="earn-item">
            <span className="earn-emoji">🧠</span>
            <div className="earn-info">
              <strong>심리테스트</strong>
              <span>테스트 완료 시</span>
            </div>
            <span className="earn-amount">+20</span>
          </div>
          <div className="earn-item">
            <span className="earn-emoji">📤</span>
            <div className="earn-info">
              <strong>결과 공유</strong>
              <span>친구에게 결과 공유 시</span>
            </div>
            <span className="earn-amount">+5</span>
          </div>
        </div>
      </section>

      {/* 교환 상품 */}
      <section className="rewards-section">
        <h2>교환하기</h2>
        <div className="rewards-list">
          {REWARDS.map((reward, idx) => (
            <div key={idx} className="reward-card">
              <span className="reward-emoji">{reward.emoji}</span>
              <div className="reward-info">
                <strong>{reward.name}</strong>
                <span className="reward-cost">🏮 {reward.cost}</span>
              </div>
              <button
                className={`reward-btn ${points.total_points >= reward.cost ? "" : "disabled"}`}
                disabled={points.total_points < reward.cost}
              >
                교환
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 내역 */}
      {points.history.length > 0 && (
        <section className="history-section">
          <h2>최근 내역</h2>
          <div className="history-list">
            {points.history.slice(0, 10).map((item, idx) => (
              <div key={idx} className="history-item">
                <span className="history-emoji">{item.emoji}</span>
                <div className="history-info">
                  <strong>{item.action}</strong>
                  <span>{item.date}</span>
                </div>
                <span className={`history-points ${item.points >= 0 ? "plus" : "minus"}`}>
                  {item.points > 0 ? `+${item.points}` : item.points}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
