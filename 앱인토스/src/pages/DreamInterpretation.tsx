import { useState } from "react";
import { analyzeDream } from "../services/gemini";
import "../styles/ExtraFeatures.css";

interface Props {
  onBack: () => void;
  onEarnPoints: (amount: number, action: string, emoji: string) => void;
}

export interface DreamResult {
  dream_type: string;
  dream_emoji: string;
  interpretation: string;
  fortune_impact: string;
  lucky_action: string;
  score: number;
}

const DREAM_CATEGORIES = [
  { emoji: "🐉", label: "동물 꿈" },
  { emoji: "💧", label: "물/바다 꿈" },
  { emoji: "🔥", label: "불/빛 꿈" },
  { emoji: "💀", label: "죽음/이별 꿈" },
  { emoji: "✈️", label: "여행/이동 꿈" },
  { emoji: "💰", label: "돈/보석 꿈" },
  { emoji: "👤", label: "사람 꿈" },
  { emoji: "🏠", label: "집/건물 꿈" },
];

export default function DreamInterpretation({ onBack, onEarnPoints }: Props) {
  const [dreamText, setDreamText] = useState("");
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeDream(dreamText);
      setResult(data);
      onEarnPoints(10, "꿈해몽 분석", "🌙");
    } catch (err) {
      console.error("꿈 분석 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDream = (category: string) => {
    setDreamText(`${category}을(를) 꾸었어요`);
  };

  if (loading) {
    return (
      <div className="extra-page">
        <header className="extra-header">
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
          <h1>🌙 꿈해몽</h1>
        </header>
        <div className="extra-loading">
          <div className="moon-animation">🌙</div>
          <h2>꿈을 해석하고 있어요...</h2>
          <p>무의식의 메시지를 읽는 중</p>
        </div>
      </div>
    );
  }

  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🌙 꿈해몽</h1>
      </header>

      {!result ? (
        <>
          <div className="extra-hero">
            <span className="hero-emoji">🌙</span>
            <h2>어젯밤 어떤 꿈을 꾸셨나요?</h2>
            <p>꿈의 내용을 적어주시면<br />운세적 의미를 해석해드려요</p>
          </div>

          <div className="dream-quick-tags">
            {DREAM_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className="dream-tag"
                onClick={() => handleQuickDream(cat.label.replace(" 꿈", ""))}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div className="dream-input-area">
            <textarea
              className="dream-textarea"
              placeholder="예: 하늘을 나는 꿈을 꿨어요 / 돼지가 나오는 꿈 / 이가 빠지는 꿈..."
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              maxLength={200}
              rows={4}
            />
            <button
              className="dream-submit"
              onClick={handleAnalyze}
              disabled={!dreamText.trim()}
            >
              🌙 꿈 해석하기
            </button>
          </div>
        </>
      ) : (
        <div className="dream-result">
          <div className="dream-result-hero">
            <span className="dream-result-emoji">{result.dream_emoji}</span>
            <h2>{result.dream_type}</h2>
            <div className="dream-score-badge">
              행운지수 {result.score}점
            </div>
          </div>

          <div className="dream-cards">
            <div className="dream-card">
              <h3>📖 꿈의 의미</h3>
              <p>{result.interpretation}</p>
            </div>
            <div className="dream-card">
              <h3>🔮 운세에 미치는 영향</h3>
              <p>{result.fortune_impact}</p>
            </div>
            <div className="dream-card">
              <h3>💡 행운을 위한 행동</h3>
              <p>{result.lucky_action}</p>
            </div>
          </div>

          <button className="dream-retry" onClick={() => { setResult(null); setDreamText(""); }}>
            🌙 다른 꿈 해석하기
          </button>
        </div>
      )}
    </div>
  );
}
