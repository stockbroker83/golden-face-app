import { useEffect, useMemo, useState } from "react";
import { PremiumAnalysisResult, FreeAnalysisResult } from "../types";
import { generateOGImage } from "../utils/ogImageGenerator";
import { shareResult } from "../utils/shareService";
import "../styles/FreeResult.css";

interface Props {
  analysis: PremiumAnalysisResult | FreeAnalysisResult;
  imageFile: File;
  onBack: () => void;
}

export default function FreeResult({ analysis, imageFile, onBack }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const viewerCount = useMemo(() => Math.floor(Math.random() * (1500 - 900 + 1)) + 900, []);
  const imageUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  // 12개 부위 전체 분석 데이터 (premium이면 전체, free면 5개만)
  const isPremium = 'features' in analysis;
  const allFeatures = isPremium ? [
    { key: "forehead", emoji: "🧠", category: "이마", subtitle: "지혜와 명예운", data: analysis.features.forehead, color: "#8b5cf6", gradient: "from-purple-500 to-purple-600" },
    { key: "eyes", emoji: "👁️", category: "눈", subtitle: "재물과 인간관계운", data: analysis.features.eyes, color: "#3b82f6", gradient: "from-blue-500 to-blue-600" },
    { key: "eyebrows", emoji: "✨", category: "눈썹", subtitle: "감정과 의지력", data: analysis.features.eyebrows, color: "#06b6d4", gradient: "from-cyan-500 to-cyan-600" },
    { key: "nose", emoji: "👃", category: "코", subtitle: "재물과 사업운", data: analysis.features.nose, color: "#d4af37", gradient: "from-yellow-500 to-amber-600" },
    { key: "cheekbones", emoji: "💎", category: "광대뼈", subtitle: "권력과 지위운", data: analysis.features.cheekbones, color: "#f59e0b", gradient: "from-amber-500 to-orange-600" },
    { key: "mouth", emoji: "👄", category: "입", subtitle: "복록과 자손운", data: analysis.features.mouth, color: "#ec4899", gradient: "from-pink-500 to-pink-600" },
    { key: "philtrum", emoji: "🎯", category: "인중", subtitle: "자손과 건강운", data: analysis.features.philtrum, color: "#f43f5e", gradient: "from-rose-500 to-rose-600" },
    { key: "chin", emoji: "🏔️", category: "턱", subtitle: "만년운과 재산", data: analysis.features.chin, color: "#a855f7", gradient: "from-purple-600 to-violet-600" },
    { key: "ears", emoji: "👂", category: "귀", subtitle: "수명과 조상복", data: analysis.features.ears, color: "#10b981", gradient: "from-emerald-500 to-emerald-600" },
    { key: "face_shape", emoji: "🌟", category: "얼굴형", subtitle: "전체 기운과 성격", data: analysis.features.face_shape, color: "#eab308", gradient: "from-yellow-600 to-yellow-700" },
    { key: "hairline", emoji: "🎨", category: "이마선", subtitle: "초년운과 가문", data: analysis.features.hairline, color: "#8b5cf6", gradient: "from-violet-500 to-purple-700" },
    { key: "nasolabial_folds", emoji: "💫", category: "법령선", subtitle: "인생 경험과 성숙도", data: analysis.features.nasolabial_folds, color: "#6366f1", gradient: "from-indigo-500 to-indigo-600" },
  ] : [
    { key: "forehead", emoji: "🧠", category: "이마", subtitle: "지혜와 명예운", data: analysis.forehead, color: "#8b5cf6", gradient: "from-purple-500 to-purple-600" },
    { key: "eyes", emoji: "👁️", category: "눈", subtitle: "재물과 인간관계운", data: analysis.eyes, color: "#3b82f6", gradient: "from-blue-500 to-blue-600" },
    { key: "nose", emoji: "👃", category: "코", subtitle: "재물과 사업운", data: analysis.nose, color: "#d4af37", gradient: "from-yellow-500 to-amber-600" },
    { key: "mouth", emoji: "👄", category: "입", subtitle: "복록과 자손운", data: analysis.mouth, color: "#ec4899", gradient: "from-pink-500 to-pink-600" },
    { key: "ears", emoji: "👂", category: "귀", subtitle: "수명과 조상복", data: analysis.ears, color: "#10b981", gradient: "from-emerald-500 to-emerald-600" },
  ];

  const getScoreLevel = (score: number) => {
    if (score >= 95) return { level: "완벽", emoji: "👑", color: "#fbbf24", stars: 5 };
    if (score >= 90) return { level: "최상", emoji: "🌟", color: "#fbbf24", stars: 5 };
    if (score >= 80) return { level: "우수", emoji: "✨", color: "#10b981", stars: 4 };
    if (score >= 70) return { level: "양호", emoji: "👍", color: "#3b82f6", stars: 3 };
    if (score >= 60) return { level: "보통", emoji: "👌", color: "#6b7280", stars: 2 };
    return { level: "성장 중", emoji: "💪", color: "#ef4444", stars: 1 };
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const topFeatures = allFeatures.slice(0, 3);
      const imageBlob = await generateOGImage({
        type: "face",
        title: `${analysis.emoji} ${analysis.face_type}`,
        subtitle: "내 관상 결과를 확인해봐",
        scoreText: `종합 점수 ${analysis.overall_score}점`,
        highlights: [
          topFeatures[0].data.title,
          topFeatures[1].data.title,
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

      alert("공유 완료! 친구들이 부러워할 거예요 ✨");
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
        <button className="top-back-btn" onClick={onBack}>← 뒤로가기</button>

        {/* 얼굴 + 점수 헤더 */}
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
          </div>
        </section>

        {/* 종합 평가 카드 */}
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
          </div>
        </section>

        {/* 상세 관상 분석 */}
        <section className="free-feature-list">
          <div className="section-header">
            <h3 className="section-title">
              <span className="free-badge">✨</span>
              {isPremium ? '12가지 상세 관상 분석' : '5가지 상세 관상 분석'}
            </h3>
            <p className="section-subtitle">당신의 얼굴이 말해주는 모든 것</p>
          </div>
          
          {allFeatures.map((feature, index) => {
            const scoreLevel = getScoreLevel(feature.data.score);
            return (
              <article 
                key={feature.key} 
                className="free-feature-card enhanced" 
                style={{ 
                  animationDelay: `${index * 0.06}s`,
                  borderLeft: `4px solid ${feature.color}`
                }}
              >
                <header className="feature-top">
                  <div className="feature-left">
                    <div className="feature-emoji-wrapper" style={{ 
                      background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                      border: `2px solid ${feature.color}40`
                    }}>
                      <span className="feature-emoji">{feature.emoji}</span>
                    </div>
                    <div>
                      <h3>{feature.category}</h3>
                      <p className="feature-subtitle">{feature.subtitle}</p>
                    </div>
                  </div>
                  <div className="card-score-badge enhanced" style={{ 
                    background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}25)`, 
                    color: feature.color,
                    border: `2px solid ${feature.color}40`
                  }}>
                    <span className="score-value">{feature.data.score}</span>
                    <span className="score-max">/100</span>
                  </div>
                </header>

                {/* 향상된 프로그레스 바 */}
                <div className="score-progress-bar enhanced">
                  <div 
                    className="score-progress-fill" 
                    style={{ 
                      width: `${feature.data.score}%`, 
                      background: `linear-gradient(90deg, ${feature.color}99, ${feature.color}dd)`,
                      boxShadow: `0 0 10px ${feature.color}60`
                    }}
                  >
                    <div className="progress-shimmer"></div>
                  </div>
                </div>
                
                {/* 별점 표시 */}
                <div className="score-level-badge enhanced" style={{ borderColor: scoreLevel.color }}>
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < scoreLevel.stars ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                  <span className="level-emoji">{scoreLevel.emoji}</span>
                  <span className="level-text" style={{ color: scoreLevel.color }}>{scoreLevel.level}</span>
                </div>

                {/* 상세 설명 */}
                <div className="feature-main enhanced">
                  <h4 className="feature-title">{feature.data.title}</h4>
                  <p className="feature-description">{feature.data.description}</p>
                </div>
                
                {/* 조언 */}
                <div className="feature-advice">
                  <span className="advice-icon">💡</span>
                  <span className="advice-text">{feature.data.advice}</span>
                </div>

                {/* 당일 팁 (있으면) */}
                {feature.data.daily_tip && (
                  <div className="daily-tip-box">
                    <span className="tip-icon">🎯</span>
                    <span className="tip-text">{feature.data.daily_tip}</span>
                  </div>
                )}

                {/* 관상 포인트 */}
                <div className="insight-points">
                  <div className="point-item">
                    <span className="point-icon">📊</span>
                    <span className="point-text">{feature.data.confidence_reason || "AI 관상 분석 완료"}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* 공유 버튼 */}
        <button className="share-proud-btn" onClick={handleShare} disabled={isSharing}>
          {isSharing ? "생성 중..." : "📤 친구에게 자랑하기"}
        </button>

        {/* 종합 요약 */}
        <section className="final-summary">
          <h3 className="summary-title">✨ 종합 평가</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-icon">🎯</span>
              <h4>종합 점수</h4>
              <p className="summary-score">{analysis.overall_score}점</p>
            </div>
            <div className="summary-card">
              <span className="summary-icon">👥</span>
              <h4>현재 조회수</h4>
              <p className="summary-score">{viewerCount}명</p>
            </div>
          </div>
          <p className="summary-text">{analysis.overall_impression}</p>
        </section>
      </div>
    </div>
  );
}
