import { useEffect, useMemo, useState } from "react";
import { FaceAnalysisResult } from "../types";
import PricingCard from "../components/PricingCard";
import { generateOGImage } from "../utils/ogImageGenerator";
import { shareResult } from "../utils/shareService";
import "../styles/FreeResult.css";

interface Props {
  analysis: FaceAnalysisResult;
  imageFile: File;
  onUpgrade: () => void;
  onBack: () => void;
}

const PREMIUM_TEASES = [
  { icon: "💰", title: "숨겨진 재물운", subtitle: "당신의 돈 복이 터지는 시기" },
  { icon: "❤️", title: "충격적인 연애운", subtitle: "올해 만날 운명의 사람" },
  { icon: "👥", title: "대인관계 비밀", subtitle: "당신을 도와줄 귀인 3명" },
  { icon: "💼", title: "직장운 폭로", subtitle: "승진/이직 최적 타이밍" },
  { icon: "🏠", title: "가족운 경고", subtitle: "조심해야 할 가족 이슈" },
  { icon: "🎯", title: "인생 전환점", subtitle: "인생 바뀌는 결정적 순간" },
  { icon: "🔮", title: "숨은 재능", subtitle: "당신이 몰랐던 황금 재능" },
  { icon: "⚠️", title: "피해야 할 것", subtitle: "올해 절대 하면 안 되는 것" },
  { icon: "✨", title: "최고의 날", subtitle: "대박 터지는 행운의 날짜" },
];

export default function FreeResult({ analysis, imageFile, onUpgrade, onBack }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(9 * 60 + 59);
  const viewerCount = useMemo(() => Math.floor(Math.random() * (1500 - 900 + 1)) + 900, []);
  const imageUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? 9 * 60 + 59 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const freeFeatures = [
    { key: "forehead", emoji: "🧠", category: "이마", subtitle: "지혜와 명예운", data: analysis.forehead, color: "#8b5cf6" },
    { key: "eyes", emoji: "👁️", category: "눈", subtitle: "재물과 인간관계운", data: analysis.eyes, color: "#3b82f6" },
    { key: "nose", emoji: "👃", category: "코", subtitle: "재물과 사업운", data: analysis.nose, color: "#d4af37" },
    { key: "mouth", emoji: "👄", category: "입", subtitle: "복록과 자손운", data: analysis.mouth, color: "#ec4899" },
    { key: "ears", emoji: "👂", category: "귀", subtitle: "수명과 조상복", data: analysis.ears, color: "#10b981" },
  ];

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: "최상", emoji: "🌟", color: "#fbbf24" };
    if (score >= 80) return { level: "우수", emoji: "✨", color: "#10b981" };
    if (score >= 70) return { level: "양호", emoji: "👍", color: "#3b82f6" };
    if (score >= 60) return { level: "보통", emoji: "👌", color: "#6b7280" };
    return { level: "개선 필요", emoji: "💪", color: "#ef4444" };
  };

  const previewFeatures = freeFeatures.slice(0, 3);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const imageBlob = await generateOGImage({
        type: "face",
        title: `${analysis.emoji} ${analysis.face_type}`,
        subtitle: "내 관상 결과를 확인해봐",
        scoreText: `종합 점수 ${analysis.overall_score}점`,
        highlights: [
          previewFeatures[0].data.title,
          previewFeatures[1].data.title,
          analysis.overall_impression,
        ],
        shareUrl: "https://goldenface.app",
      });

      await shareResult({
        title: "내 관상 결과 나왔어!",
        text: `${analysis.face_type} · ${analysis.overall_score}점`,
        imageBlob,
        fileName: `golden-face-free-${Date.now()}.jpg`,
      });

      alert("공유 완료! +5 포인트가 적립됐어요 🏮");
    } catch (error) {
      console.error("관상 결과 공유 실패:", error);
      alert("공유 중 오류가 발생했어요.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="free-result">
      <div className="free-result-shell">
        <button className="top-back-btn" onClick={() => setShowExitOffer(true)}>← 뒤로가기</button>

        {/* 얼굴 + 점수 헤더 (강화) */}
        <section className="result-header-with-face">
          <div className="face-container">
            <img src={imageUrl} alt="분석한 얼굴" className="analyzed-face" />
            <div className="face-overlay">
              <span className="check-icon">✓</span>
              분석 완료
            </div>
          </div>
          
          <div className="score-info">
            <div className="score-badge">
              <span className="score-number">{analysis.overall_score}</span>
              <span className="score-label">점</span>
            </div>
            <h2 className="result-title">{analysis.emoji} {analysis.face_type}</h2>
            <p className="result-subtitle">
              ✨ 상위 <strong>{100 - analysis.overall_score}%</strong> 수준의 관상이에요!
            </p>
            <div className="earned-points-badge">
              <span>🎁 +10 포인트 획득</span>
            </div>
          </div>
        </section>

        <section className="result-summary-card">
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

            <p className="overall-copy">{analysis.overall_impression}</p>
            <div className="satisfaction-badge">✅ 프리미엄 구매자 92%가 만족</div>
          </div>
        </section>

        {/* 무료 3가지 분석 (개선) */}
        <section className="free-feature-list">
          <div className="section-header">
            <h3 className="section-title">
              <span className="free-badge">🎁 무료</span>
              기본 관상 분석
            </h3>
          </div>
          
          {previewFeatures.map((feature, index) => {
            const scoreLevel = getScoreLevel(feature.data.score);
            return (
              <article key={feature.key} className="free-feature-card" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="card-tag">무료</div>
                <header className="feature-top">
                  <div className="feature-left">
                    <span className="feature-emoji">{feature.emoji}</span>
                    <div>
                      <h3>{feature.category}</h3>
                      <p>{feature.subtitle}</p>
                    </div>
                  </div>
                  <div className="card-score-badge" style={{ background: `${feature.color}15`, color: feature.color }}>
                    <span className="score-value">{feature.data.score}</span>
                    <span className="score-max">/100</span>
                  </div>
                </header>

                {/* 프로그레스 바 추가 */}
                <div className="score-progress-bar">
                  <div 
                    className="score-progress-fill" 
                    style={{ 
                      width: `${feature.data.score}%`, 
                      background: `linear-gradient(90deg, ${feature.color}99, ${feature.color})`
                    }}
                  />
                </div>
                
                {/* 점수 레벨 표시 */}
                <div className="score-level-badge" style={{ borderColor: scoreLevel.color }}>
                  <span>{scoreLevel.emoji}</span>
                  <span style={{ color: scoreLevel.color }}>{scoreLevel.level}</span>
                </div>

                <div className="feature-main">
                  <h4>{feature.data.title}</h4>
                  <p className="clamp-two-lines">{feature.data.description}</p>
                  <p className="more-premium">...더보기(프리미엄)</p>
                </div>
                
                {/* 당일 팁 표시 (있으면) */}
                {feature.data.daily_tip && (
                  <div className="daily-tip-box">
                    <span className="tip-icon">💡</span>
                    <span className="tip-text">{feature.data.daily_tip}</span>
                  </div>
                )}

                {/* 관상 포인트 표시 */}
                <div className="insight-points">
                  <div className="point-item">
                    <span className="point-icon">👁️</span>
                    <span className="point-text">관상 포인트 +{feature.data.score}</span>
                  </div>
                  {feature.data.confidence_reason && (
                    <div className="confidence-reason">
                      <span className="reason-icon">📊</span>
                      <span className="reason-text">{feature.data.confidence_reason}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <button className="share-proud-btn" onClick={handleShare} disabled={isSharing}>
          {isSharing ? "생성 중..." : "📤 친구에게 자랑하기"}
        </button>

        <section className="premium-preview-section">
          <h3>📺 프리미엄 결과 미리보기</h3>
          <div className="premium-preview-grid">
            <div className="premium-preview-card">
              <div className="preview-index">1️⃣</div>
              <div className="preview-shot blur-shot">관상 12가지 상세 분석 화면</div>
            </div>
            <div className="premium-preview-card">
              <div className="preview-index">2️⃣</div>
              <div className="preview-shot blur-shot">2026년 월별 운세 차트</div>
            </div>
            <div className="premium-preview-card">
              <div className="preview-index">3️⃣</div>
              <div className="preview-shot blur-shot">귀인/역업 얼굴 분석 결과</div>
            </div>
          </div>
          <p className="preview-bottom-copy">실제 구매자들이 가장 감동한 부분이에요</p>
        </section>

        <section className="paywall-card">
          <div className="paywall-head">
            <h3>🔥 아직 공개되지 않은 운세가 9개 남아있어요</h3>
            <p>지금 열면 오늘 밤 12시 전까지 특가가 적용됩니다.</p>
          </div>

          <div className="blur-preview">
            <div className="blur-preview-list">
              {PREMIUM_TEASES.map((benefit) => (
                <div className="blur-lock-item" key={benefit.title}>
                  <span className="lock-item-icon">{benefit.icon}</span>
                  <div>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="paywall-cta-box">
              <div className="lock-mark">🔒</div>
              <PricingCard salePrice={18900} originalPrice={25000} />
            </div>
          </div>
        </section>
      </div>

      <div className="sticky-upgrade-wrap">
        <p className="sticky-timer">⏰ {formatCountdown(secondsLeft)} 후 정가 전환!</p>
        <p className="sticky-viewers">지금 {viewerCount}명이 보고 있어요</p>
        <button className="sticky-upgrade-cta" onClick={onUpgrade}>
          <strong>₩18,900로 인생 바뀔 9가지 비밀 확인하기</strong>
          <span>92%가 '인생이 바뀌었다'고 평가</span>
        </button>
      </div>

      {showExitOffer && (
        <div className="exit-offer-overlay" role="dialog" aria-modal="true">
          <div className="exit-offer-modal">
            <h3>🎁 잠깐만요!</h3>
            <p className="exit-subtitle">떠나시기 전에 특별 제안이 있어요</p>

            <div className="exit-offer-content">
              <p className="today-special">[오늘만 특가]</p>
              <p className="price-drop">₩25,000 → ₩18,900 (24% 할인)</p>
              <p>✅ 지금 바로 결제 시:</p>
              <ul>
                <li>+ 복주머니 100포인트 추가 증정</li>
                <li>+ PDF 다운로드 즉시 가능</li>
                <li>+ 7일 100% 환불 보장</li>
              </ul>
            </div>

            <div className="exit-offer-actions">
              <button className="exit-upgrade-btn" onClick={onUpgrade}>₩18,900로 확인하기</button>
              <button className="exit-later-btn" onClick={onBack}>다음에 할게요</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
