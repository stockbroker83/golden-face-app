import { useEffect, useMemo, useState } from "react";
import { FaceAnalysisResult } from "../types";
import "../styles/FreeResult.css";

interface Props {
  analysis: FaceAnalysisResult;
  imageFile: File;
  onUpgrade: () => void;
}

const PREMIUM_BENEFITS = [
  "🔮 관상 7부위 추가 분석",
  "💘 사주 4대운 상세 리포트",
  "👥 귀인/악연 관상 비교",
  "🃏 맞춤 타로 3장 스프레드",
  "☯️ 주역 64괘 운세 해석",
];

export default function FreeResult({ analysis, imageFile, onUpgrade }: Props) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [leftMinutes, setLeftMinutes] = useState(14);
  const [leftSeconds, setLeftSeconds] = useState(59);

  const imageUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);

  useEffect(() => {
    const vipData = localStorage.getItem("golden_face_vip");
    if (!vipData) return;

    try {
      const parsed = JSON.parse(vipData);
      setIsPurchased(Boolean(parsed?.is_vip));
    } catch (error) {
      console.error("VIP 데이터 파싱 오류:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLeftSeconds((prev) => {
        if (prev > 0) return prev - 1;

        setLeftMinutes((min) => {
          if (min === 0) return 14;
          return min - 1;
        });

        return 59;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const freeFeatures = [
    {
      key: "forehead",
      emoji: "🧠",
      category: "이마 (額相)",
      subtitle: "지혜와 명예운",
      data: analysis.forehead,
    },
    {
      key: "eyes",
      emoji: "👁️",
      category: "눈 (眼相)",
      subtitle: "재물과 인간관계운",
      data: analysis.eyes,
    },
    {
      key: "nose",
      emoji: "👃",
      category: "코 (鼻相)",
      subtitle: "재물과 사업운",
      data: analysis.nose,
    },
    {
      key: "mouth",
      emoji: "👄",
      category: "입 (口相)",
      subtitle: "복록과 자손운",
      data: analysis.mouth,
    },
    {
      key: "ears",
      emoji: "👂",
      category: "귀 (耳相)",
      subtitle: "수명과 조상복",
      data: analysis.ears,
    },
  ];

  return (
    <div className="free-result">
      <div className="free-result-shell">
        <section className="result-summary-card">
          <img src={imageUrl} alt="분석 얼굴" className="result-face-photo" />

          <div className="result-score-area">
            <div className="score-ring-wrap">
              <svg className="score-ring" viewBox="0 0 120 120" aria-hidden>
                <circle className="score-ring-bg" cx="60" cy="60" r="52" />
                <circle
                  className="score-ring-value"
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - analysis.overall_score / 100)}
                />
              </svg>
              <div className="score-ring-text">
                <strong>{analysis.overall_score}</strong>
                <span>점</span>
              </div>
            </div>

            <h2 className="face-type-title">
              {analysis.emoji} {analysis.face_type}
            </h2>
            <p className="overall-copy">{analysis.overall_impression}</p>
          </div>
        </section>

        <section className="free-feature-list">
          {freeFeatures.map((feature, index) => (
            <article key={feature.key} className="free-feature-card" style={{ animationDelay: `${index * 0.08}s` }}>
              <header className="feature-top">
                <div className="feature-left">
                  <span className="feature-emoji">{feature.emoji}</span>
                  <div>
                    <h3>{feature.category}</h3>
                    <p>{feature.subtitle}</p>
                  </div>
                </div>
                <div className="feature-score">{feature.data.score}점</div>
              </header>

              <div className="feature-main">
                <h4>{feature.data.title}</h4>
                <p>{feature.data.description}</p>
                <div className="feature-advice">
                  <strong>💡 개선 포인트</strong>
                  <p>{feature.data.advice}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="paywall-card">
          <div className="paywall-head">
            <h3>🔥 프리미엄 리포트가 잠금 상태입니다</h3>
            <p>
              남은 시간 <strong>{String(leftMinutes).padStart(2, "0")}:{String(leftSeconds).padStart(2, "0")}</strong> 동안
              할인 가격으로 잠금 해제할 수 있어요.
            </p>
          </div>

          <div className="blur-preview">
            <div className="blur-preview-list">
              {PREMIUM_BENEFITS.map((benefit) => (
                <p key={benefit}>{benefit}</p>
              ))}
            </div>

            <div className="paywall-cta-box">
              <div className="lock-mark">🔒</div>
              <button className={`unlock-btn ${isPurchased ? "purchased" : ""}`} onClick={onUpgrade}>
                {isPurchased ? "프리미엄 결과 바로 보기" : "₩19,000 결제하고 평생 운명 리포트 열기"}
              </button>
              <p className="discount-copy">정가 ₩25,000 → 오늘만 24% 할인</p>
            </div>
          </div>

          {!isPurchased && <p className="refund-copy">💯 만족하지 않으면 100% 환불</p>}
        </section>
      </div>
    </div>
  );
}
