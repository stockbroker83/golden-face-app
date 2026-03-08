import { useState } from "react";
import { CompatibilityResult, UserData } from "../types";
import { generateOGImage } from "../utils/ogImageGenerator";
import { shareResult } from "../utils/shareService";
import "../styles/Compatibility.css";

interface Props {
  result: CompatibilityResult;
  myData: UserData;
  partnerData: UserData;
  onBack: () => void;
}

export default function CompatibilityResultPage({ result, myData, partnerData, onBack }: Props) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const imageBlob = await generateOGImage({
        type: "compatibility",
        title: `${result.chemistry_title} 궁합 결과`,
        subtitle: `${myData.birth_date} × ${partnerData.birth_date}`,
        scoreText: `궁합 점수 ${result.overall_score}%`,
        highlights: [result.love_text, result.friendship_text, result.advice],
        shareUrl: "https://goldenface.app/compatibility",
      });

      await shareResult({
        title: "우리 궁합 결과 확인해봐!",
        text: `${result.chemistry_emoji} 궁합 ${result.overall_score}% 나왔어`,
        imageBlob,
        fileName: `golden-face-compat-${Date.now()}.jpg`,
      });
      alert("공유 완료! +5 포인트가 적립됐어요 🏮");
    } catch (error) {
      console.error("궁합 공유 실패:", error);
      alert("공유 중 오류가 발생했어요.");
    } finally {
      setIsSharing(false);
    }
  };
  const categories = [
    { emoji: "💘", label: "연애 궁합", score: result.love_score, text: result.love_text, color: "#ec4899" },
    { emoji: "🤝", label: "우정 궁합", score: result.friendship_score, text: result.friendship_text, color: "#8b5cf6" },
    { emoji: "💼", label: "업무 궁합", score: result.work_score, text: result.work_text, color: "#3b82f6" },
    { emoji: "💬", label: "대화 궁합", score: result.communication_score, text: result.communication_text, color: "#10b981" },
  ];

  // 추가 카테고리 (있으면 표시)
  if (result.values_score !== undefined) {
    categories.push({ emoji: "🎯", label: "가치관 궁합", score: result.values_score, text: result.values_text || "", color: "#f59e0b" });
  }
  if (result.hobby_score !== undefined) {
    categories.push({ emoji: "🎨", label: "취미 궁합", score: result.hobby_score, text: result.hobby_text || "", color: "#06b6d4" });
  }
  if (result.growth_score !== undefined) {
    categories.push({ emoji: "🌱", label: "성장 궁합", score: result.growth_score, text: result.growth_text || "", color: "#84cc16" });
  }
  if (result.conflict_score !== undefined) {
    categories.push({ emoji: "⚖️", label: "갈등해결 궁합", score: result.conflict_score, text: result.conflict_text || "", color: "#ef4444" });
  }

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: "환상", emoji: "💯" };
    if (score >= 80) return { level: "최고", emoji: "🌟" };
    if (score >= 70) return { level: "우수", emoji: "✨" };
    if (score >= 60) return { level: "양호", emoji: "👍" };
    return { level: "개선 필요", emoji: "💪" };
  };

  return (
    <div className="compat-result-page">
      <header className="compat-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>궁합 결과</h1>
      </header>

      {/* 메인 점수 */}
      <section className="compat-hero-result">
        <div className="compat-vs-mini">
          <div className="mini-person">
            <span>{myData.gender === "male" ? "🙎‍♂️" : "🙎‍♀️"}</span>
            <small>{myData.birth_date}</small>
          </div>
          <div className="compat-score-center">
            <span className="compat-big-emoji">{result.chemistry_emoji}</span>
            <div className="compat-big-score">{result.overall_score}%</div>
            <div className="compat-type">{result.chemistry_title}</div>
          </div>
          <div className="mini-person">
            <span>{partnerData.gender === "male" ? "🙎‍♂️" : "🙎‍♀️"}</span>
            <small>{partnerData.birth_date}</small>
          </div>
        </div>
        <p className="compat-desc">{result.chemistry_description}</p>
      </section>

      {/* 카테고리별 점수 */}
      <section className="compat-categories">
        {categories.map((cat, idx) => {
          const scoreLevel = getScoreLevel(cat.score);
          return (
            <div key={idx} className="compat-cat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="cat-header">
                <span className="cat-label-group">
                  {cat.emoji} {cat.label}
                  <span className="cat-level-badge" style={{ color: cat.color }}>
                    {scoreLevel.emoji} {scoreLevel.level}
                  </span>
                </span>
                <strong style={{ color: cat.color }}>{cat.score}%</strong>
              </div>
              <div className="cat-bar">
                <div 
                  className="cat-bar-fill" 
                  style={{ 
                    width: `${cat.score}%`, 
                    background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})` 
                  }} 
                />
              </div>
              <p className="cat-text">{cat.text}</p>
            </div>
          );
        })}
      </section>

      {/* 보완점 & 주의점 */}
      <section className="compat-advice-section">
        <div className="advice-card complementary">
          <h3>✨ 서로 보완하는 점</h3>
          <p>{result.complementary}</p>
        </div>
        <div className="advice-card warning">
          <h3>⚠️ 주의할 점</h3>
          <p>{result.warning}</p>
        </div>
        <div className="advice-card tip">
          <h3>💡 궁합 조언</h3>
          <p>{result.advice}</p>
        </div>
        
        {/* 추가 정보 */}
        {result.conflict_resolution && (
          <div className="advice-card resolution">
            <h3>🤝 갈등 해결 가이드</h3>
            <p>{result.conflict_resolution}</p>
          </div>
        )}
        
        {result.growth_potential && result.growth_potential.length > 0 && (
          <div className="advice-card growth-list">
            <h3>🌱 함께 성장할 수 있는 영역</h3>
            <ul>
              {result.growth_potential.map((item, i) => (
                <li key={i}>✅ {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.date_recommendations && result.date_recommendations.length > 0 && (
          <div className="advice-card date-list">
            <h3>💕 추천 데이트</h3>
            <ul>
              {result.date_recommendations.map((item, i) => (
                <li key={i}>🎯 {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.communication_tips && result.communication_tips.length > 0 && (
          <div className="advice-card tips-list">
            <h3>💬 대화 TIP</h3>
            <ul>
              {result.communication_tips.map((item, i) => (
                <li key={i}>💡 {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {result.long_term_forecast && (
          <div className="advice-card forecast">
            <h3>🔮 장기 전망</h3>
            <p>{result.long_term_forecast}</p>
          </div>
        )}
      </section>

      <div className="compat-actions">
        <button className="share-btn" onClick={handleShare} disabled={isSharing}>
          {isSharing ? "생성 중..." : "📤 친구에게 자랑하기"}
        </button>
        <button className="retry-btn" onClick={onBack}>🔄 다른 사람과 궁합 보기</button>
      </div>
    </div>
  );
}
