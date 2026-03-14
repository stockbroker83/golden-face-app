import { useEffect, useState } from "react";
import { UserData, AppStep } from "../types";
import "../styles/HomeHub.css";

interface Props {
  userData: UserData;
  onNavigate: (step: AppStep) => void;
}

const GREETINGS = [
  "오늘 하루도 좋은 기운이 함께해요",
  "당신의 운명이 빛나는 하루가 될 거예요",
  "좋은 에너지가 당신을 감싸고 있어요",
  "오늘은 특별한 인연이 찾아올 수 있어요",
  "당신의 관상에 행운의 기운이 보여요",
];

export default function HomeHub({ userData, onNavigate }: Props) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * GREETINGS.length);
    setGreeting(GREETINGS[idx]);
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "새벽";
    if (hour < 12) return "좋은 아침";
    if (hour < 18) return "좋은 오후";
    return "좋은 저녁";
  };

  return (
    <div className="hub">
      {/* ── 헤더 ── */}
      <header className="hub-header">
        <div className="hub-header-top">
          <div className="hub-brand">
            <span className="brand-icon">🌟</span>
            <span className="brand-name">금빛관상</span>
          </div>
        </div>

        {/* 배너 이미지 */}
        <div className="hub-banner">
          <img src="/banner.jpg" alt="금빛관상" className="hub-banner-img" />
          <div className="hub-banner-overlay">
            <div className="hub-greeting">
              <h1>{getTimeGreeting()}이에요, {userData.name || "소중한 분"}</h1>
              <p className="greeting-sub">{greeting}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── 메인 메뉴 카드 ── */}
      <section className="hub-main-grid">
        {/* 1. 오늘의 관상 (데일리) */}
        <button className="hub-card daily-card" onClick={() => onNavigate("daily")}>
          <div className="card-glow daily-glow" />
          <div className="card-badge">매일 NEW</div>
          <div className="card-icon-wrap">
            <span className="card-icon">🌙</span>
          </div>
          <h3>오늘의 관상</h3>
          <p>매일 달라지는 운세 흐름을<br />관상으로 확인해요</p>
          <div className="card-points">무료</div>
        </button>

        {/* 2. 관상 분석 (기존) */}
        <button className="hub-card face-card" onClick={() => onNavigate("upload")}>
          <div className="card-glow face-glow" />
          <div className="card-icon-wrap">
            <span className="card-icon">🔮</span>
          </div>
          <h3>AI 관상 분석</h3>
          <p>사진 1장으로<br />12부위 상세 분석</p>
          <div className="card-points">무료</div>
        </button>

        {/* 3. 궁합 분석 */}
        <button className="hub-card compat-card" onClick={() => onNavigate("compatibility")}>
          <div className="card-glow compat-glow" />
          <div className="card-badge hot-badge">HOT</div>
          <div className="card-icon-wrap">
            <span className="card-icon">🪷</span>
          </div>
          <h3>궁합 분석</h3>
          <p>두 사람의 관상으로<br />궁합을 확인해요</p>
          <div className="card-points">무료</div>
        </button>

        {/* 4. 심리테스트 */}
        <button className="hub-card psych-card" onClick={() => onNavigate("psychtest")}>
          <div className="card-glow psych-glow" />
          <div className="card-badge">인기</div>
          <div className="card-icon-wrap">
            <span className="card-icon">🎴</span>
          </div>
          <h3>심리테스트</h3>
          <p>사주 기반 성격 유형<br />분석 테스트</p>
          <div className="card-points">무료</div>
        </button>
      </section>

      <section className="hub-extra-section">
        <h2 className="section-title"><span>🌸</span> 더 많은 콘텐츠</h2>
        <div className="hub-extra-grid" style={{ marginBottom: "12px" }}>
          <button className="hub-mini-card tarot-highlight" onClick={() => onNavigate("tarot")} style={{ gridColumn: "1 / -1" }}>
            <span className="mini-icon">🃏</span>
            <div className="mini-info">
              <strong>타로 카드 리딩 <span style={{ color: "#d4af37", fontSize: "11px" }}>NEW</span></strong>
              <span>사주 기반 3장 타로 · 뒤집기</span>
            </div>
          </button>
        </div>
        <div className="hub-extra-grid">
          <button className="hub-mini-card" onClick={() => onNavigate("saju")}>
            <span className="mini-icon">☯️</span>
            <div className="mini-info">
              <strong>사주팔자</strong>
              <span>천간지지 & 대운 분석</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("saju_compatibility")}>
            <span className="mini-icon">⚖️</span>
            <div className="mini-info">
              <strong>사주 궁합</strong>
              <span>2인 사주 비교 분석</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("lucky_numbers")}>
            <span className="mini-icon">🎯</span>
            <div className="mini-info">
              <strong>행운의 번호</strong>
              <span>사주 기반 번호 추천</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("charm")}>
            <span className="mini-icon">🪬</span>
            <div className="mini-info">
              <strong>행운 부적</strong>
              <span>오늘의 행운 부적</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("tojeong")}>
            <span className="mini-icon">📖</span>
            <div className="mini-info">
              <strong>토정비결</strong>
              <span>2026년 월별 운세</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("dream")}>
            <span className="mini-icon">🌌</span>
            <div className="mini-info">
              <strong>꿈해몽</strong>
              <span>꿈 풀이 해석</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("lucky_style")}>
            <span className="mini-icon">👘</span>
            <div className="mini-info">
              <strong>행운의 코디</strong>
              <span>오늘의 스타일 추천</span>
            </div>
          </button>

          <button className="hub-mini-card" onClick={() => onNavigate("wish_wall")}>
            <span className="mini-icon">🕯️</span>
            <div className="mini-info">
              <strong>소원의 담벼락</strong>
              <span>소원 적고 응원받기</span>
            </div>
          </button>
        </div>
      </section>

      {/* ── 퀵 운세 카드 ── */}
      <section className="hub-quick-section">
        <h2 className="section-title">
          <span>✨</span> 오늘의 퀵 운세
        </h2>
        <div className="quick-cards">
          <div className="quick-card love">
            <span className="quick-emoji">🌹</span>
            <span className="quick-label">연애운</span>
            <div className="quick-bar">
              <div className="quick-fill" style={{ width: `${getRandomScore(65, 95)}%` }} />
            </div>
          </div>
          <div className="quick-card money">
            <span className="quick-emoji">💎</span>
            <span className="quick-label">재물운</span>
            <div className="quick-bar">
              <div className="quick-fill" style={{ width: `${getRandomScore(60, 90)}%` }} />
            </div>
          </div>
          <div className="quick-card health">
            <span className="quick-emoji">🌿</span>
            <span className="quick-label">건강운</span>
            <div className="quick-bar">
              <div className="quick-fill" style={{ width: `${getRandomScore(70, 95)}%` }} />
            </div>
          </div>
          <div className="quick-card work">
            <span className="quick-emoji">🏮</span>
            <span className="quick-label">직장운</span>
            <div className="quick-bar">
              <div className="quick-fill" style={{ width: `${getRandomScore(55, 90)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 하단 안내 ── */}
      <footer className="hub-footer">
        <p>금빛관상 AI · 분석 결과는 오락/참고 목적입니다</p>
        <p>© 2026 금빛관상 · Powered by AI</p>
      </footer>
    </div>
  );
}

// 날짜 기반 시드로 일관된 랜덤 점수 생성
function getRandomScore(min: number, max: number): number {
  const today = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i) + min;
    hash |= 0;
  }
  return min + Math.abs(hash % (max - min));
}
