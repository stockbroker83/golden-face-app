import { useState } from 'react';
import '../styles/TarotCardPicker.css';

interface Props {
  onComplete: (cards: number[]) => void;
}

const TAROT_EMOJIS = ['🌙', '⭐', '☀️', '🔮', '✨', '💫', '🌟', '⚡'];

export default function TarotCardSelector({ onComplete }: Props) {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const handleCardClick = (index: number) => {
    if (selectedCards.length >= 3 || flippedCards.has(index)) return;

    // 카드 뒤집기
    setFlippedCards(prev => new Set(prev).add(index));
    
    setTimeout(() => {
      const newSelected = [...selectedCards, index];
      setSelectedCards(newSelected);
      
      if (newSelected.length === 3) {
        setTimeout(() => onComplete(newSelected), 1500);
      }
    }, 600);
  };

  return (
    <div className="tarot-picker">
      <div className="tarot-header">
        <h2 className="tarot-title">
          <span className="moon-icon">🌙</span>
          운명의 타로 3장을 선택하세요
          <span className="star-icon">⭐</span>
        </h2>
        <p className="tarot-subtitle">
          직관이 이끄는 대로 카드를 선택해주세요
        </p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(selectedCards.length / 3) * 100}%` }}
          />
        </div>
        <p className="progress-text">{selectedCards.length} / 3</p>
      </div>

      <div className="cards-container">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`tarot-card ${flippedCards.has(index) ? 'flipped' : ''} ${
              selectedCards.includes(index) ? 'selected' : ''
            }`}
            onClick={() => handleCardClick(index)}
          >
            {/* 앞면 */}
            <div className="card-front">
              <div className="card-pattern">
                <div className="pattern-circle" />
                <div className="pattern-star">✨</div>
              </div>
              <div className="card-glow" />
            </div>

            {/* 뒷면 */}
            <div className="card-back">
              <div className="card-emoji">{TAROT_EMOJIS[index]}</div>
              <div className="card-number">#{index + 1}</div>
              <div className="card-shine" />
            </div>
          </div>
        ))}
      </div>

      {selectedCards.length === 3 && (
        <div className="completion-message">
          <span className="sparkle-icon">✨</span>
          타로 리딩을 시작합니다...
          <span className="sparkle-icon">✨</span>
        </div>
      )}
    </div>
  );
}
