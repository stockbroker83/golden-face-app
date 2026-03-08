import { useState } from "react";
import { IAP } from "@apps-in-toss/web-framework";
import { PointsData } from "../types";
import { addPoints, loadPoints, savePoints } from "../utils/pointsManager";
import "../styles/PointsPage.css";

interface Props {
  points: PointsData;
  onBack: () => void;
  onUpdatePoints: (points: PointsData) => void;
}

const POINT_PACKAGES = [
  { sku: "points_starter_100", name: "입문팩", points: 100, price: 1000, bonus: 0 },
  { sku: "points_popular_600", name: "인기팩", points: 600, price: 5000, bonus: 100, popular: true },
  { sku: "points_premium_1300", name: "프리미엄팩", points: 1300, price: 10000, bonus: 300 },
  { sku: "points_mega_4200", name: "메가팩", points: 4200, price: 30000, bonus: 1200 },
] as const;

type PointPackage = {
  sku: string;
  name: string;
  points: number;
  price: number;
  bonus: number;
  popular?: boolean;
};

const PROCESSED_ORDER_IDS_KEY = "golden_face_processed_point_orders";

function getUnitPrice(points: number, price: number): string {
  return `개당 ₩${(price / points).toFixed(1)}`;
}

function getTotalPoints(pkg: PointPackage): number {
  return pkg.points + pkg.bonus;
}

export default function PointsPage({ points, onBack, onUpdatePoints }: Props) {
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const hasProcessedOrder = (orderId: string) => {
    try {
      const raw = localStorage.getItem(PROCESSED_ORDER_IDS_KEY);
      if (!raw) return false;
      const ids = JSON.parse(raw) as string[];
      return ids.includes(orderId);
    } catch {
      return false;
    }
  };

  const markOrderAsProcessed = (orderId: string) => {
    try {
      const raw = localStorage.getItem(PROCESSED_ORDER_IDS_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      const merged = [orderId, ...ids.filter((id) => id !== orderId)].slice(0, 100);
      localStorage.setItem(PROCESSED_ORDER_IDS_KEY, JSON.stringify(merged));
    } catch {
      localStorage.setItem(PROCESSED_ORDER_IDS_KEY, JSON.stringify([orderId]));
    }
  };

  const grantPointsFromPurchase = (pkg: PointPackage, orderId: string) => {
    if (hasProcessedOrder(orderId)) {
      return;
    }

    const totalPoints = getTotalPoints(pkg);
    const latestPoints = loadPoints() || points;
    const updated = addPoints(latestPoints, totalPoints, `${pkg.name} 충전`, "💳");
    savePoints(updated);
    onUpdatePoints(updated);
    markOrderAsProcessed(orderId);
    localStorage.setItem(
      "golden_face_last_points_purchase",
      JSON.stringify({ orderId, sku: pkg.sku, points: totalPoints, purchasedAt: new Date().toISOString() })
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
          setPurchaseSuccess(`${pkg.name} 충전 완료! (+${getTotalPoints(pkg)} 복주머니)`);
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
    setPurchaseSuccess(`테스트 충전 완료! (+${getTotalPoints(pkg)} 복주머니)`);
  };

  return (
    <div className="points-page">
      <header className="points-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🏮 복주머니</h1>
      </header>

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
                <span>🏮 {getTotalPoints(pkg)}개</span>
              </div>
              <div className="topup-meta">
                <span className="topup-price">₩{pkg.price.toLocaleString()}</span>
                {pkg.bonus > 0 && <span className="topup-bonus">보너스 +{pkg.bonus}</span>}
              </div>
              <div className="topup-unit-price">{getUnitPrice(getTotalPoints(pkg), pkg.price)}</div>
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

      <section className="earn-section">
        <h2>🎁 무료 획득</h2>
        <div className="earn-list">
          <div className="earn-item">
            <span className="earn-emoji">📅</span>
            <div className="earn-info">
              <strong>출석 체크</strong>
              <span>매일 접속만 해도</span>
            </div>
            <span className="earn-amount">+5</span>
          </div>
        </div>
      </section>

      <section className="earn-section">
        <h2>💸 사용 비용</h2>
        <div className="earn-list">
          <div className="earn-item cost-item">
            <span className="earn-emoji">🔮</span>
            <div className="earn-info">
              <strong>오늘의 관상</strong>
              <span>데일리 운세 (1회)</span>
            </div>
            <span className="earn-amount cost">-20</span>
          </div>
          <div className="earn-item cost-item">
            <span className="earn-emoji">👁️</span>
            <div className="earn-info">
              <strong>AI 관상 12부위</strong>
              <span>프리미엄 분석 (1회)</span>
            </div>
            <span className="earn-amount cost">-50</span>
          </div>
          <div className="earn-item cost-item">
            <span className="earn-emoji">💕</span>
            <div className="earn-info">
              <strong>궁합 분석</strong>
              <span>상대와의 궁합</span>
            </div>
            <span className="earn-amount cost">-30</span>
          </div>
          <div className="earn-item cost-item">
            <span className="earn-emoji">🧠</span>
            <div className="earn-info">
              <strong>심리테스트</strong>
              <span>성격 분석 테스트</span>
            </div>
            <span className="earn-amount cost">-15</span>
          </div>
          <div className="earn-item cost-item">
            <span className="earn-emoji">🙏</span>
            <div className="earn-info">
              <strong>소원의 담벼락</strong>
              <span>소원 등록 1회</span>
            </div>
            <span className="earn-amount cost">-1</span>
          </div>
        </div>
        <p className="cost-note">💡 프리미엄 구매 시 모든 기능 무제한 이용</p>
      </section>

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
