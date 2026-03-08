import { useEffect, useState } from "react";
import "../styles/PremiumAnalyzing.css";

interface PremiumAnalyzingProps {
  onComplete: () => void;
}

const MESSAGES = [
  "🔮 관상 12가지 심층 분석 중...",
  "💫 2026년 대운 계산 중...",
  "👥 귀인/악연 관상 분석 중...",
  "🃏 맞춤 타로 조언 생성 중...",
];

export default function PremiumAnalyzing({ onComplete }: PremiumAnalyzingProps) {
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 10000);
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="premium-analyzing">
      <div className="analyzing-content">
        <div className="lottie-container">
          <div className="magic-circle" />
        </div>

        <h2>✨ 프리미엄 분석 중...</h2>

        <div className="progress-messages">
          {MESSAGES.map((message, index) => (
            <p key={message} className={`message ${activeMessage === index ? "active" : ""}`}>
              {message}
            </p>
          ))}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" />
        </div>

        <p className="wait-text">잠시만 기다려 주세요... (약 10초)</p>
      </div>
    </div>
  );
}
