import { useEffect, useState } from 'react';
import '../styles/WelcomeScreen.css';

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [todayVisitors, setTodayVisitors] = useState(3247);

  useEffect(() => {
    // 실시간 방문자 수 카운트 애니메이션
    const interval = setInterval(() => {
      setTodayVisitors(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="welcome-screen">
      {/* 배경 별빛 애니메이션 */}
      <div className="stars-container">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="welcome-content">
        {/* 메인 타이틀 */}
        <div className="title-wrapper">
          <h1 className="main-title">
            <span className="sparkle">✨</span>
            2026년 당신의
            <br />
            <span className="highlight">황금빛 운명</span>은?
            <span className="sparkle">✨</span>
          </h1>
          <div className="title-glow" />
        </div>

        {/* 서브 카피 */}
        <p className="subtitle">
          AI가 분석하는 당신만의 관상·사주·타로
        </p>

        {/* 실시간 방문자 */}
        <div className="visitors-badge">
          <span className="pulse-dot" />
          오늘 <strong>{todayVisitors.toLocaleString()}명</strong>이 확인했어요
        </div>

        {/* 신뢰 요소 */}
        <div className="trust-indicators">
          <div className="trust-item">
            <span className="icon">⭐</span>
            <span className="text">4.9점</span>
          </div>
          <div className="divider">|</div>
          <div className="trust-item">
            <span className="icon">👥</span>
            <span className="text">12,847명 리뷰</span>
          </div>
          <div className="divider">|</div>
          <div className="trust-item">
            <span className="icon">💚</span>
            <span className="text">92% 만족</span>
          </div>
        </div>

        {/* CTA 버튼 */}
        <button className="start-button" onClick={onStart}>
          <span className="button-shine" />
          <span className="button-text">내 운명 확인하기</span>
          <span className="arrow">→</span>
        </button>

        {/* 무료 강조 */}
        <p className="free-badge">
          🎁 첫 3가지 분석 무료
        </p>
      </div>

      {/* 떠다니는 이모지 */}
      <div className="floating-emojis">
        <span className="emoji emoji-1">🔮</span>
        <span className="emoji emoji-2">✨</span>
        <span className="emoji emoji-3">🌙</span>
        <span className="emoji emoji-4">⭐</span>
      </div>
    </div>
  );
}
