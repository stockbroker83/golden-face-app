import { useEffect, useState } from "react";
import { UserData } from "../types";
import "../styles/ExtraFeatures.css";

interface Props {
  userData: UserData;
  onBack: () => void;
}

interface StyleResult {
  main_color: string;
  main_color_name: string;
  sub_color: string;
  sub_color_name: string;
  avoid_color: string;
  avoid_color_name: string;
  style_keyword: string;
  top_suggestion: string;
  bottom_suggestion: string;
  accessory: string;
  overall_tip: string;
}

export default function LuckyStyle({ userData, onBack }: Props) {
  const [result, setResult] = useState<StyleResult | null>(null);

  useEffect(() => {
    // 날짜 + 사주 기반 결정적 생성 (API 안 쓰고 로컬에서)
    const today = new Date();
    const seed = today.getDate() + today.getMonth() * 31 +
      parseInt(userData.birth_date.replace(/-/g, "").slice(-4));

    const colors = [
      { name: "레드", hex: "#DC2626" },
      { name: "오렌지", hex: "#EA580C" },
      { name: "옐로우", hex: "#CA8A04" },
      { name: "그린", hex: "#16A34A" },
      { name: "블루", hex: "#2563EB" },
      { name: "네이비", hex: "#1E3A5F" },
      { name: "퍼플", hex: "#7C3AED" },
      { name: "핑크", hex: "#DB2777" },
      { name: "베이지", hex: "#D2B48C" },
      { name: "화이트", hex: "#F5F5F5" },
      { name: "블랙", hex: "#1A1A2E" },
      { name: "브라운", hex: "#8B4513" },
    ];

    const styles = ["클래식", "캐주얼", "미니멀", "스포티", "시크", "내추럴", "러블리", "모던"];
    const tops = [
      "깔끔한 니트 + 셔츠 레이어드",
      "오버사이즈 맨투맨",
      "기본 라운드 티셔츠",
      "단정한 블라우스",
      "후드 집업",
      "스트라이프 셔츠",
      "브이넥 가디건",
      "린넨 셔츠",
    ];
    const bottoms = [
      "스트레이트 데님",
      "와이드 슬랙스",
      "A라인 스커트",
      "조거 팬츠",
      "코튼 치노팬츠",
      "플리츠 스커트",
      "카고 팬츠",
      "슬림핏 팬츠",
    ];
    const accessories = [
      "골드 체인 목걸이",
      "심플 가죽 시계",
      "미니 크로스백",
      "실크 스카프",
      "볼캡",
      "은 반지",
      "토트백",
      "비니",
    ];
    const tips = [
      "오늘은 밝은 포인트 컬러가 행운을 불러와요",
      "차분한 톤의 옷이 안정감을 줘요",
      "악세서리 하나가 오늘의 운을 바꿔줘요",
      "편안한 옷차림이 좋은 기운을 끌어당겨요",
      "깔끔한 실루엣이 대인관계운을 높여요",
      "따뜻한 색감이 재물운을 끌어올려요",
    ];

    const pick = (arr: any[], offset: number = 0) => arr[(seed + offset) % arr.length];

    const mainIdx = seed % colors.length;
    let subIdx = (seed * 3 + 7) % colors.length;
    if (subIdx === mainIdx) subIdx = (subIdx + 1) % colors.length;
    let avoidIdx = (seed * 5 + 11) % colors.length;
    if (avoidIdx === mainIdx || avoidIdx === subIdx) avoidIdx = (avoidIdx + 2) % colors.length;

    setResult({
      main_color: colors[mainIdx].hex,
      main_color_name: colors[mainIdx].name,
      sub_color: colors[subIdx].hex,
      sub_color_name: colors[subIdx].name,
      avoid_color: colors[avoidIdx].hex,
      avoid_color_name: colors[avoidIdx].name,
      style_keyword: pick(styles),
      top_suggestion: pick(tops, 1),
      bottom_suggestion: pick(bottoms, 2),
      accessory: pick(accessories, 3),
      overall_tip: pick(tips, 4),
    });

  }, [userData]);

  if (!result) return null;

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>👔 행운의 코디</h1>
      </header>

      <div className="extra-hero compact">
        <span className="hero-date">{today}</span>
        <h2>오늘의 행운 스타일</h2>
        <span className="style-keyword">#{result.style_keyword}</span>
      </div>

      {/* 컬러 추천 */}
      <section className="style-section">
        <h3>🎨 오늘의 컬러</h3>
        <div className="color-recommend">
          <div className="color-item main">
            <div className="color-circle" style={{ background: result.main_color }} />
            <div>
              <strong>메인 컬러</strong>
              <span>{result.main_color_name}</span>
            </div>
            <span className="color-badge good">행운 ↑</span>
          </div>
          <div className="color-item sub">
            <div className="color-circle" style={{ background: result.sub_color }} />
            <div>
              <strong>서브 컬러</strong>
              <span>{result.sub_color_name}</span>
            </div>
            <span className="color-badge neutral">조화 ◎</span>
          </div>
          <div className="color-item avoid">
            <div className="color-circle" style={{ background: result.avoid_color }} />
            <div>
              <strong>피할 컬러</strong>
              <span>{result.avoid_color_name}</span>
            </div>
            <span className="color-badge bad">주의 ✕</span>
          </div>
        </div>
      </section>

      {/* 코디 추천 */}
      <section className="style-section">
        <h3>👕 추천 코디</h3>
        <div className="outfit-cards">
          <div className="outfit-card">
            <span className="outfit-emoji">👕</span>
            <strong>상의</strong>
            <p>{result.top_suggestion}</p>
          </div>
          <div className="outfit-card">
            <span className="outfit-emoji">👖</span>
            <strong>하의</strong>
            <p>{result.bottom_suggestion}</p>
          </div>
          <div className="outfit-card">
            <span className="outfit-emoji">💎</span>
            <strong>악세서리</strong>
            <p>{result.accessory}</p>
          </div>
        </div>
      </section>

      {/* 팁 */}
      <section className="style-tip">
        <span>💡</span>
        <p>{result.overall_tip}</p>
      </section>
    </div>
  );
}
