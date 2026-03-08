import { useEffect, useMemo, useState } from "react";
import "../styles/TarotCardPicker.css";

interface TarotCardPickerProps {
  present: string;
  future: string;
  action: string;
  onComplete?: (cards: string[]) => void;
}

type CardType = {
  title: string;
  subtitle: string;
  icon: string;
  symbol: string;
  content: string;
  tone: "present" | "future" | "action";
};

export default function TarotCardPicker({ present, future, action, onComplete }: TarotCardPickerProps) {
  const [revealedCards, setRevealedCards] = useState([false, false, false]);
  const [completed, setCompleted] = useState(false);

  const cards = useMemo<CardType[]>(
    () => [
      {
        title: "현재",
        subtitle: "현재의 상황",
        icon: "🔮",
        symbol: "✨",
        content: present,
        tone: "present",
      },
      {
        title: "미래",
        subtitle: "미래의 전개",
        icon: "🌟",
        symbol: "🪄",
        content: future,
        tone: "future",
      },
      {
        title: "조언",
        subtitle: "행동 지침",
        icon: "💫",
        symbol: "🎯",
        content: action,
        tone: "action",
      },
    ],
    [present, future, action]
  );

  useEffect(() => {
    setCompleted(false);
    setRevealedCards([false, false, false]);

    const t1 = setTimeout(() => setRevealedCards([true, false, false]), 450);
    const t2 = setTimeout(() => setRevealedCards([true, true, false]), 900);
    const t3 = setTimeout(() => setRevealedCards([true, true, true]), 1350);
    const t4 = setTimeout(() => {
      setCompleted(true);
      onComplete?.(cards.map((card) => card.content));
    }, 1750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [cards, onComplete]);

  return (
    <div className="tarot-picker">
      <div className="tarot-picker-header">
        <h3>🔮 3장의 타로 카드가 당신의 운명을 보여줍니다</h3>
        <p className="stage-message">과거 - 현재 - 미래 흐름을 순서대로 공개합니다</p>
      </div>

      <div className="tarot-cards-grid">
        {cards.map((card, index) => (
          <div key={card.title} className={`tarot-picker-card-wrapper ${revealedCards[index] ? "revealed" : ""}`}>
            <div className="tarot-picker-card">
              <div className="tarot-card-back">🎴</div>
              <div className={`tarot-card-front ${card.tone}`}>
                <div className="tarot-card-top">
                  <span className="tarot-card-icon">{card.icon}</span>
                  <h4>{card.title}</h4>
                </div>
                <div className="tarot-card-visual">{card.symbol}</div>
                <div className="tarot-card-body">
                  <h5>{card.subtitle}</h5>
                  <p>{card.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {completed && (
        <div className="tarot-picker-summary">
          <div className="summary-icon">🌙</div>
          <h4>타로의 메시지</h4>
          <p>현재를 이해하고 미래를 준비하며, 지금의 선택을 더 선명하게 만들어 보세요.</p>
        </div>
      )}
    </div>
  );
}

