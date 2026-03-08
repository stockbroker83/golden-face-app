import { useState } from "react";
import { UserData } from "../types";
import "../styles/ExtraFeatures.css";

interface Props {
  userData: UserData;
  onBack: () => void;
  onEarnPoints: (amount: number, action: string, emoji: string) => void;
}

const CHARMS = [
  {
    id: "wealth",
    emoji: "💰",
    name: "재물 부적",
    desc: "재물운을 불러오는 부적",
    color: "#d4af37",
    symbol: "財",
    blessing: "금전의 흐름이 원활해지고 뜻밖의 재물이 들어옵니다",
  },
  {
    id: "love",
    emoji: "💕",
    name: "연애 부적",
    desc: "좋은 인연을 끌어당기는 부적",
    color: "#ec4899",
    symbol: "緣",
    blessing: "아름다운 인연이 가까이 다가오고 관계가 깊어집니다",
  },
  {
    id: "health",
    emoji: "💚",
    name: "건강 부적",
    desc: "건강과 활력을 지켜주는 부적",
    color: "#10b981",
    symbol: "壽",
    blessing: "몸과 마음이 건강해지고 활력이 넘치는 나날이 됩니다",
  },
  {
    id: "career",
    emoji: "⭐",
    name: "승진 부적",
    desc: "직장운과 성공을 돕는 부적",
    color: "#3b82f6",
    symbol: "成",
    blessing: "능력이 인정받고 승진과 성공의 기회가 열립니다",
  },
  {
    id: "protection",
    emoji: "🛡️",
    name: "액막이 부적",
    desc: "나쁜 기운을 막아주는 부적",
    color: "#8b5cf6",
    symbol: "護",
    blessing: "불운과 악연을 멀리하고 평안한 하루가 이어집니다",
  },
  {
    id: "exam",
    emoji: "📖",
    name: "합격 부적",
    desc: "시험과 면접의 행운을 돕는 부적",
    color: "#f59e0b",
    symbol: "及",
    blessing: "집중력이 높아지고 실력을 100% 발휘할 수 있습니다",
  },
];

export default function DigitalCharm({ userData, onBack, onEarnPoints }: Props) {
  const [selected, setSelected] = useState<typeof CHARMS[0] | null>(null);
  const [activated, setActivated] = useState(false);
  const displayName = userData.name?.trim() || "나";

  const handleActivate = () => {
    setActivated(true);
    onEarnPoints(10, `${selected!.name} 활성화`, "🧧");
  };

  const handleShare = async () => {
    if (!selected) return;
    
    // 간단한 공유 텍스트
    const shareText = `🧧 ${displayName}의 금빛관상 ${selected.name}\n\n"${selected.blessing}"\n\n✨ 나도 부적 받으러 가기`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `금빛관상 ${selected.name}`, text: shareText });
        onEarnPoints(5, "부적 공유", "📤");
      } catch {}
    } else {
      // 클립보드 복사
      navigator.clipboard?.writeText(shareText);
      alert("부적 메시지가 복사되었습니다!");
    }
  };

  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🧧 행운 부적</h1>
      </header>

      {!selected ? (
        <>
          <div className="extra-hero">
            <span className="hero-emoji">🧧</span>
            <h2>나에게 맞는 부적을 골라보세요</h2>
            <p>부적을 활성화하면 하루 동안<br />행운의 기운이 함께합니다</p>
          </div>

          <div className="charm-grid">
            {CHARMS.map((charm) => (
              <button
                key={charm.id}
                className="charm-card"
                onClick={() => setSelected(charm)}
              >
                <span className="charm-emoji">{charm.emoji}</span>
                <strong>{charm.name}</strong>
                <span className="charm-desc">{charm.desc}</span>
              </button>
            ))}
          </div>
        </>
      ) : !activated ? (
        <div className="charm-activate-view">
          <div className="charm-preview" style={{ borderColor: selected.color }}>
            <div className="charm-inner" style={{ background: `radial-gradient(circle, ${selected.color}22, transparent)` }}>
              <div className="charm-symbol" style={{ color: selected.color }}>{selected.symbol}</div>
              <span className="charm-preview-emoji">{selected.emoji}</span>
              <h3>{selected.name}</h3>
            </div>
          </div>
          <p className="charm-blessing">"{selected.blessing}"</p>
          <button className="activate-btn" style={{ background: selected.color }} onClick={handleActivate}>
            부적 활성화하기 ✨
          </button>
          <button className="charm-back-btn" onClick={() => setSelected(null)}>
            다른 부적 선택
          </button>
        </div>
      ) : (
        <div className="charm-activated-view">
          <div className="activated-glow" style={{ background: selected.color }} />
          <div className="charm-preview activated" style={{ borderColor: selected.color }}>
            <div className="charm-inner" style={{ background: `radial-gradient(circle, ${selected.color}33, transparent)` }}>
              <div className="charm-symbol glowing" style={{ color: selected.color }}>{selected.symbol}</div>
              <span className="charm-preview-emoji">{selected.emoji}</span>
              <h3>{selected.name}</h3>
              <span className="active-badge" style={{ background: selected.color }}>활성화됨 ✓</span>
            </div>
          </div>
          <p className="charm-blessing">"{selected.blessing}"</p>
          <p className="charm-timer">오늘 자정까지 효력이 유지됩니다 🌙</p>

          <div className="charm-actions">
            <button className="share-charm-btn" onClick={handleShare}>
              📤 친구에게 부적 보내기
            </button>
            <button className="charm-back-btn" onClick={() => { setSelected(null); setActivated(false); }}>
              다른 부적 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
