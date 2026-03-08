import { useState } from "react";
import { UserData } from "../types";
import "../styles/ExtraFeatures.css";

interface Props {
  userData: UserData;
  onBack: () => void;
  onEarnPoints: (amount: number, action: string, emoji: string) => void;
}

export default function LuckyNumbers({ userData, onBack, onEarnPoints }: Props) {
  const [numbers, setNumbers] = useState<number[][] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const generateNumbers = () => {
    setIsGenerating(true);
    setShowResult(false);

    // 사주 기반 시드 생성
    const seed = userData.birth_date.replace(/-/g, "");
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const combined = parseInt(seed) + parseInt(today);

    setTimeout(() => {
      const sets: number[][] = [];
      for (let s = 0; s < 5; s++) {
        const nums = new Set<number>();
        while (nums.size < 6) {
          const hash = ((combined * (s + 1) * (nums.size + 7) * 31) + Math.random() * 45) % 45;
          nums.add(Math.floor(hash) + 1);
        }
        sets.push(Array.from(nums).sort((a, b) => a - b));
      }
      setNumbers(sets);
      setIsGenerating(false);
      setTimeout(() => setShowResult(true), 100);
      onEarnPoints(10, "행운의 번호 생성", "🎰");
    }, 2000);
  };

  const getNumberColor = (n: number) => {
    if (n <= 10) return "yellow";
    if (n <= 20) return "blue";
    if (n <= 30) return "red";
    if (n <= 40) return "gray";
    return "green";
  };

  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🎰 행운의 번호</h1>
      </header>

      <div className="extra-hero">
        <span className="hero-emoji">🍀</span>
        <h2>사주 기반 행운 번호</h2>
        <p>생년월일과 오늘의 운세 흐름을 결합해<br />당신만의 행운 번호를 추천해요</p>
      </div>

      {!numbers && (
        <div className="action-center">
          <button
            className={`generate-btn ${isGenerating ? "generating" : ""}`}
            onClick={generateNumbers}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spin">🎲</span>
                행운의 기운을 모으는 중...
              </>
            ) : (
              <>🎰 행운의 번호 뽑기</>
            )}
          </button>
          <span className="action-points">+10 🏮</span>
        </div>
      )}

      {numbers && showResult && (
        <div className="lucky-results">
          <div className="result-label">
            <span>✨</span> 오늘의 추천 번호 5세트
          </div>

          {numbers.map((set, idx) => (
            <div key={idx} className="number-set" style={{ animationDelay: `${idx * 0.15}s` }}>
              <span className="set-label">{String.fromCharCode(65 + idx)}</span>
              <div className="balls">
                {set.map((n, i) => (
                  <span key={i} className={`ball ${getNumberColor(n)}`}>{n}</span>
                ))}
              </div>
            </div>
          ))}

          <div className="number-legend">
            <span className="legend-item"><span className="dot yellow" />1~10</span>
            <span className="legend-item"><span className="dot blue" />11~20</span>
            <span className="legend-item"><span className="dot red" />21~30</span>
            <span className="legend-item"><span className="dot gray" />31~40</span>
            <span className="legend-item"><span className="dot green" />41~45</span>
          </div>

          <button className="generate-btn retry" onClick={() => { setNumbers(null); setShowResult(false); }}>
            🔄 다시 뽑기
          </button>
        </div>
      )}

      <div className="extra-notice">
        <p>※ 행운의 번호는 오락 목적이며 당첨을 보장하지 않습니다.</p>
      </div>
    </div>
  );
}
