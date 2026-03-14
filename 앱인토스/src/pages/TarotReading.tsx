import { useState, useEffect } from "react";
import { UserData } from "../types";
import { analyzeTarot } from "../services/gemini";
import { canUseAI, incrementMonthlyUsage } from "../utils/monthlyUsageManager";
import { shareFortuneResult } from "../utils/kakaoShare";
import "../styles/TarotReading.css";

interface Props {
  userData: UserData;
  onBack: () => void;
}

export interface TarotCard {
  name: string;
  emoji: string;
  position: string;
  keyword: string;
  message: string;
  is_positive: boolean;
}

export interface TarotResult {
  cards: [TarotCard, TarotCard, TarotCard];
  overall_message: string;
  spread_theme: string;
}

const POSITION_LABELS = ["현재 상황", "조언", "미래 전망"];
const POSITION_COLORS = ["#8b5cf6", "#d4af37", "#06b6d4"];

export default function TarotReading({ userData, onBack }: Props) {
  const [result, setResult] = useState<TarotResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState([false, false, false]);
  const [flipping, setFlipping] = useState([false, false, false]);
  const [showBack, setShowBack] = useState([false, false, false]);
  const [allFlipped, setAllFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!canUseAI()) {
        setError("이번 달 AI 분석 횟수를 모두 사용했습니다. (월 150회 제한)");
        setLoading(false);
        return;
      }
      try {
        const data = await analyzeTarot(userData);
        incrementMonthlyUsage();
        setResult(data);
      } catch {
        setError("타로 분석 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userData]);

  const flipCard = (idx: number) => {
    setFlipping(prev => { const n = [...prev]; n[idx] = true; return n; });
    setTimeout(() => {
      setShowBack(prev => { const n = [...prev]; n[idx] = true; return n; });
      setFlipping(prev => { const n = [...prev]; n[idx] = false; return n; });
      setFlipped(prev => {
        const next = prev.map((v, i) => i === idx ? true : v);
        if (next.every(Boolean)) setTimeout(() => setAllFlipped(true), 400);
        return next;
      });
    }, 180);
  };

  const handleFlip = (idx: number) => {
    if (!result || flipped[idx] || flipping[idx]) return;
    flipCard(idx);
  };

  const handleFlipAll = () => {
    [0, 1, 2].forEach((idx) => {
      if (!flipped[idx] && !flipping[idx]) {
        setTimeout(() => flipCard(idx), idx * 120);
      }
    });
    setTimeout(() => setAllFlipped(true), 900);
  };

  if (loading) {
    return (
      <div className="tarot-page">
        <header className="tarot-header">
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
          <h1>🃏 타로 카드</h1>
        </header>
        <div className="tarot-loading">
          <div className="tarot-loading-cards">
            <div className="loading-card" style={{ animationDelay: "0s" }}>🂠</div>
            <div className="loading-card" style={{ animationDelay: "0.2s" }}>🂠</div>
            <div className="loading-card" style={{ animationDelay: "0.4s" }}>🂠</div>
          </div>
          <h2>카드를 섞고 있어요...</h2>
          <p>사주 기반으로 당신의 카드를 고르는 중</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="tarot-page">
        <header className="tarot-header">
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
          <h1>🃏 타로 카드</h1>
        </header>
        <div className="tarot-error">
          <p>{error ?? "결과를 불러올 수 없습니다."}</p>
          <button onClick={onBack}>돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tarot-page">
      <header className="tarot-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🃏 타로 카드</h1>
      </header>

      {/* 히어로 */}
      <div className="tarot-hero">
        <p className="tarot-spread-theme">✨ {result.spread_theme}</p>
        <p className="tarot-instruction">
          {flipped.every(Boolean) ? "모든 카드가 공개됐어요" : "카드를 탭해서 운명을 확인하세요"}
        </p>
      </div>

      {/* 카드 3장 */}
      <div className="tarot-cards-row">
        {result.cards.map((card, idx) => (
          <div key={idx} className="tarot-card-wrap">
            <span className="tarot-position-label" style={{ color: POSITION_COLORS[idx] }}>
              {POSITION_LABELS[idx]}
            </span>
            <div
              className={`tarot-card ${flipping[idx] ? "flipping" : ""}`}
              onClick={() => handleFlip(idx)}
            >
              {!showBack[idx] ? (
                <div className="tarot-card-front">
                  <div className="tarot-card-back-design">
                    <span className="tarot-back-icon">🌙</span>
                    <span className="tarot-back-text">TAP</span>
                  </div>
                </div>
              ) : (
                <div className="tarot-card-back-face" style={{ borderColor: POSITION_COLORS[idx] }}>
                  <div className="tarot-card-emoji">{card.emoji}</div>
                  <div className="tarot-card-name">{card.name}</div>
                  <div className="tarot-card-keyword" style={{ color: POSITION_COLORS[idx] }}>
                    {card.keyword}
                  </div>
                  <div className={`tarot-card-indicator ${card.is_positive ? "positive" : "caution"}`}>
                    {card.is_positive ? "✦ 길" : "△ 주의"}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 전체 공개 버튼 */}
      {!flipped.every(Boolean) && (
        <button className="tarot-reveal-all-btn" onClick={handleFlipAll}>
          카드 전체 공개 →
        </button>
      )}

      {/* 카드별 메시지 */}
      {flipped.some(Boolean) && (
        <div className="tarot-messages">
          {result.cards.map((card, idx) =>
            flipped[idx] ? (
              <div key={idx} className="tarot-message-card" style={{ borderLeftColor: POSITION_COLORS[idx] }}>
                <div className="tarot-msg-header">
                  <span className="tarot-msg-emoji">{card.emoji}</span>
                  <div>
                    <strong>{card.name}</strong>
                    <span className="tarot-msg-position" style={{ color: POSITION_COLORS[idx] }}>
                      {POSITION_LABELS[idx]}
                    </span>
                  </div>
                </div>
                <p className="tarot-msg-text">{card.message}</p>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* 종합 메시지 */}
      {allFlipped && (
        <>
          <div className="tarot-overall">
            <h3>🔮 종합 해석</h3>
            <p>{result.overall_message}</p>
          </div>

          {/* 카카오 공유 버튼 */}
          <div className="tarot-share-row">
            <button
              className="tarot-share-btn"
              onClick={() =>
                shareFortuneResult({
                  title: `🃏 ${result.spread_theme}`,
                  description: `${result.cards.map((c) => `${c.name} ${c.emoji}`).join(" · ")}\n${result.overall_message.slice(0, 60)}...`,
                  buttonText: "나도 타로 보기",
                })
              }
            >
              <span>💬</span> 카카오톡으로 공유하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
