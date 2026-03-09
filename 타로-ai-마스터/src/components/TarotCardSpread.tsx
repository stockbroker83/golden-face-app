import { useState, useEffect } from "react";
import type { TarotCard } from "@/data/tarotCards";

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

interface TarotCardSpreadProps {
  cards: DrawnCard[];
  revealed: boolean;
}

const positions = ["과거", "현재", "미래"];
const positionEmojis = ["⏪", "⏺️", "⏩"];

const TarotCardSpread = ({ cards, revealed }: TarotCardSpreadProps) => {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (revealed) {
      cards.forEach((_, i) => {
        setTimeout(() => {
          setFlipped((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          // 카드 뒤집힐 때 파티클 생성
          createParticles(i);
        }, 400 + i * 500);
      });
    }
  }, [revealed, cards.length]);

  const createParticles = (cardIndex: number) => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i + cardIndex * 100,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1000);
  };

  const handleCardClick = (index: number) => {
    if (flipped[index]) {
      setSelectedCard(index);
      createParticles(index);
    }
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  return (
    <>
      <div className="flex gap-3 justify-center my-3 relative">
        {cards.map((drawn, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 relative">
            <span className="text-xs text-muted-foreground font-body">
              {positionEmojis[i]} {positions[i]}
            </span>
            <div
              className="relative w-[72px] h-[108px] cursor-pointer"
              style={{ perspective: "800px" }}
              onClick={() => handleCardClick(i)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* 파티클 효과 */}
              {particles
                .filter((_, idx) => Math.floor(idx / 12) === i)
                .map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      animation: "particle-burst 1s ease-out forwards",
                      transform: `translate(${particle.x}px, ${particle.y}px)`,
                    }}
                  >
                    <span className="text-yellow-400 text-xs">✨</span>
                  </div>
                ))}

              <div
                className={`absolute inset-0 transition-all duration-700 ${
                  flipped[i] ? "animate-card-drop" : "animate-card-fall"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `
                    rotateY(${flipped[i] ? "180deg" : "0deg"})
                    ${hoveredCard === i && flipped[i] ? "rotateX(5deg) rotateY(185deg) scale(1.05)" : ""}
                    ${selectedCard === i ? "scale(1.1)" : ""}
                  `,
                  filter: selectedCard === i ? "drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))" : "",
                }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-lg border-2 border-primary/40 bg-gradient-card flex items-center justify-center"
                  style={{ 
                    backfaceVisibility: "hidden",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  }}
                >
                  <span className="text-2xl opacity-60">✦</span>
                </div>

                {/* Front */}
                <div
                  className={`absolute inset-0 rounded-lg border-2 flex flex-col items-center justify-center gap-1 px-1 ${
                    selectedCard === i ? "border-yellow-400 border-4" : "border-primary/60"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: `linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)`,
                    boxShadow: flipped[i] ? "0 0 30px rgba(251, 191, 36, 0.3)" : "none",
                  }}
                >
                  <span className={`text-2xl ${drawn.isReversed ? "rotate-180" : ""}`}>
                    {drawn.card.emoji}
                  </span>
                  <span className="text-[10px] text-center text-foreground font-display leading-tight">
                    {drawn.card.nameKo}
                  </span>
                  {drawn.isReversed && (
                    <span className="text-[9px] text-primary/80">역위</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 모달 */}
      {selectedCard !== null && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-card border-2 border-primary/60 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-modal-pop"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              boxShadow: "0 0 60px rgba(251, 191, 36, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 카드 정보 */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className={`text-6xl ${cards[selectedCard].isReversed ? "rotate-180" : ""}`}
                >
                  {cards[selectedCard].card.emoji}
                </div>
                <div className="absolute inset-0 blur-2xl opacity-50 bg-yellow-400/30 animate-pulse"></div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-display font-bold text-primary">
                  {cards[selectedCard].card.nameKo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cards[selectedCard].card.name}
                </p>
                {cards[selectedCard].isReversed && (
                  <span className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs text-primary">
                    역위 (Reversed)
                  </span>
                )}
              </div>

              {/* 위치 정보 */}
              <div className="w-full bg-primary/10 rounded-lg p-3 text-center">
                <span className="text-sm text-muted-foreground">
                  {positionEmojis[selectedCard]} {positions[selectedCard]}
                </span>
              </div>

              {/* 의미 */}
              <div className="w-full space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <span>✨</span>
                    <span>{cards[selectedCard].isReversed ? "역위 의미" : "정위 의미"}</span>
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {cards[selectedCard].isReversed
                      ? cards[selectedCard].card.reversed
                      : cards[selectedCard].card.upright}
                  </p>
                </div>

                {/* 조언 */}
                <div className="bg-primary/5 rounded-lg p-3 space-y-1">
                  <h4 className="text-xs font-semibold text-primary">💡 조언</h4>
                  <p className="text-xs text-muted-foreground">
                    이 카드가 {positions[selectedCard]}를 나타내고 있습니다. 
                    {cards[selectedCard].isReversed
                      ? " 역위치는 변화의 필요성이나 내적 성찰을 의미할 수 있습니다."
                      : " 정위치는 긍정적인 에너지와 발전의 흐름을 나타냅니다."}
                  </p>
                </div>
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={closeModal}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes card-fall {
          0% {
            transform: translateY(-200px) rotateY(0deg) rotateX(20deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) rotateY(0deg) rotateX(0deg);
            opacity: 1;
          }
        }

        @keyframes card-drop {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          50% {
            transform: rotateY(90deg) scale(1.1);
          }
          100% {
            transform: rotateY(180deg) scale(1);
          }
        }

        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modal-pop {
          0% {
            transform: scale(0.8) rotateX(20deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotateX(0deg);
          }
          100% {
            transform: scale(1) rotateX(0deg);
            opacity: 1;
          }
        }

        .animate-card-fall {
          animation: card-fall 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-card-drop {
          animation: none;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-modal-pop {
          animation: modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

export default TarotCardSpread;
