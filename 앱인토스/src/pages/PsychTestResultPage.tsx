import { useState } from "react";
import { PsychTestResult } from "../types";
import { generateOGImage } from "../utils/ogImageGenerator";
import { shareResult } from "../utils/shareService";
import "../styles/PsychologyTest.css";

interface Props {
  result: PsychTestResult;
  onBack: () => void;
}

export default function PsychTestResultPage({ result, onBack }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [activeSection, setActiveSection] = useState<"traits" | "growth">("traits");

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const imageBlob = await generateOGImage({
        type: "psych",
        title: `${result.type_name}`,
        subtitle: "오행 기반 심리테스트 결과",
        scoreText: `상위 ${result.percentage}% 유형`,
        highlights: [result.strengths[0], result.strengths[1], result.advice],
        shareUrl: "https://goldenface.app/psych",
      });

      await shareResult({
        title: "내 심리테스트 결과 나왔어!",
        text: `${result.type_emoji} ${result.type_name} 타입!`,
        imageBlob,
        fileName: `golden-face-psych-${Date.now()}.jpg`,
      });
      alert("공유 완료! +5 포인트가 적립됐어요 🏮");
    } catch (error) {
      console.error("심리테스트 공유 실패:", error);
      alert("공유 중 오류가 발생했어요.");
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <div className="psych-result-page">
      <header className="psych-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>심리 분석 결과</h1>
      </header>

      {/* 메인 결과 */}
      <section className="psych-hero">
        <span className="result-big-emoji">{result.type_emoji}</span>
        <h2 className="result-type-name">{result.type_name}</h2>
        <div className="result-percentage">
          <span>상위 {result.percentage}%</span>
          <span className="rarity-badge">희귀 유형</span>
        </div>
        <p className="result-desc">{result.type_description}</p>
      </section>

      {/* 탭 메뉴 */}
      <div className="psych-tabs">
        <button 
          className={activeSection === "traits" ? "active" : ""} 
          onClick={() => setActiveSection("traits")}
        >
          성격 분석
        </button>
        <button 
          className={activeSection === "growth" ? "active" : ""} 
          onClick={() => setActiveSection("growth")}
        >
          성장 가이드
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeSection === "traits" && (
        <>
          {/* 강점 & 약점 */}
          <section className="traits-section">
            <div className="trait-card strengths">
              <h3>💪 강점</h3>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i}>
                    <span className="trait-icon">✅</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="trait-card weaknesses">
              <h3>🔧 개선 포인트</h3>
              <ul>
                {result.weaknesses.map((w, i) => (
                  <li key={i}>
                    <span className="trait-icon">🎯</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 궁합 유형 */}
          <section className="compatible-section">
            <h3>💕 잘 맞는 유형</h3>
            <div className="compatible-card">
              <p>{result.compatible_type}</p>
            </div>
          </section>
        </>
      )}

      {activeSection === "growth" && (
        <section className="growth-guide-section">
          {/* 조언 */}
          <div className="psych-advice">
            <h3>💡 오행 조언</h3>
            <div className="advice-content">
              <p>{result.advice}</p>
            </div>
          </div>
          
          {/* 성장 액션 플랜 */}
          <div className="action-plan">
            <h3>🎯 실천 액션 플랜</h3>
            <div className="action-cards">
              <div className="action-card">
                <span className="action-emoji">📅</span>
                <h4>단기 목표 (1개월)</h4>
                <p>매일 강점을 활용한 작은 실천 1가지</p>
              </div>
              <div className="action-card">
                <span className="action-emoji">📊</span>
                <h4>중기 목표 (3개월)</h4>
                <p>개선 포인트 중 1가지를 집중 개선</p>
              </div>
              <div className="action-card">
                <span className="action-emoji">🎓</span>
                <h4>장기 목표 (6개월)</h4>
                <p>새로운 분야 도전으로 균형 잡기</p>
              </div>
            </div>
          </div>

          {/* 추천 활동 */}
          <div className="recommended-activities">
            <h3>🌟 추천 활동</h3>
            <div className="activity-grid">
              <div className="activity-item">📚 독서 & 학습</div>
              <div className="activity-item">🧘 명상 & 요가</div>
              <div className="activity-item">🎨 창작 활동</div>
              <div className="activity-item">💬 소통 모임</div>
            </div>
          </div>
        </section>
      )}

      <div className="psych-actions">
        <button className="share-btn" onClick={handleShare} disabled={isSharing}>
          {isSharing ? "생성 중..." : "📤 친구에게 자랑하기"}
        </button>
        <button className="retry-btn" onClick={onBack}>🔄 다시 테스트하기</button>
      </div>
    </div>
  );
}
