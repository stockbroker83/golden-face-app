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

  useEffect(() => {
    if (revealed) {
      cards.forEach((_, i) => {
        setTimeout(() => {
          setFlipped((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 400 + i * 500);
      });
    }
  }, [revealed, cards.length]);

  return (
    <div className="flex gap-3 justify-center my-3">
      {cards.map((drawn, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-body">
            {positionEmojis[i]} {positions[i]}
          </span>
          <div
            className="relative w-[72px] h-[108px]"
            style={{ perspective: "600px" }}
          >
            <div
              className="absolute inset-0 transition-transform duration-700"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Back */}
              <div
                className="absolute inset-0 rounded-lg border-2 border-primary/40 bg-gradient-card flex items-center justify-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-2xl opacity-60">✦</span>
              </div>

              {/* Front */}
              <div
                className="absolute inset-0 rounded-lg border-2 border-primary/60 bg-gradient-card flex flex-col items-center justify-center gap-1 px-1"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
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
  );
};

export default TarotCardSpread;
