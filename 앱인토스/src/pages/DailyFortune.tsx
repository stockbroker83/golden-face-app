import { useEffect, useState } from "react";
import { UserData, DailyFortuneResult } from "../types";
import { analyzeDailyFortune } from "../services/gemini";
import { canUseAI, incrementMonthlyUsage } from "../utils/monthlyUsageManager";
import "../styles/DailyFortune.css";

interface Props {
  userData: UserData;
  onResult: (result: DailyFortuneResult) => void;
  existingResult: DailyFortuneResult | null;
  onBack: () => void;
}

export default function DailyFortune({ userData, onResult, existingResult, onBack }: Props) {
  const [result, setResult] = useState<DailyFortuneResult | null>(existingResult);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "hourly" | "lucky">("overview");
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  useEffect(() => {
    // 기존 결과가 오늘 날짜면 바로 표시
    if (existingResult && existingResult.date === new Date().toISOString().split("T")[0]) {
      setResult(existingResult);
      return;
    }

    // 새로 분석 시작
    const startAnalysis = async () => {
      // 완전 무료 모드: 포인트 체크 생략
      // 월간 사용량 체크
      if (!canUseAI()) {
        setError("이번 달 AI 분석 횟수를 모두 사용했습니다. (월 150회 제한)");
        return;
      }

      // 분석 시작
      setLoading(true);
      try {
        const data = await analyzeDailyFortune(userData);
        incrementMonthlyUsage();
        setResult(data);
        onResult(data);
      } catch (err) {
        console.error("데일리 분석 실패:", err);
        setError("분석 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    startAnalysis();
  }, [userData]);

  // 에러 화면
  if (error) {
    return (
      <div className="daily-page">
        <header className="daily-header">
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
          <h1>오늘의 관상</h1>
        </header>
        <div className="daily-error">
          <span className="error-icon">⚠️</span>
          <h2>오류가 발생했어요</h2>
          <p>{error}</p>
          <button className="error-btn" onClick={onBack}>돌아가기</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="daily-page">
        <header className="daily-header">
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
          <h1>오늘의 관상</h1>
        </header>
        <div className="daily-loading">
          <div className="loading-orb" />
          <p>오늘의 운세를 읽고 있어요...</p>
          <span className="loading-sub">{today}</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const fortuneItems = [
    { emoji: "🌹", label: "연애운", score: result.love_score, text: result.love_text, color: "#ec4899" },
    { emoji: "💎", label: "재물운", score: result.money_score, text: result.money_text, color: "#d4af37" },
    { emoji: "🌿", label: "건강운", score: result.health_score, text: result.health_text, color: "#10b981" },
    { emoji: "🏮", label: "대인관계", score: result.social_score, text: result.social_text, color: "#3b82f6" },
  ];

  const starRating = result.star_rating ?? Math.round(result.mood_score / 20);

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🌟";
    if (score >= 80) return "✨";
    if (score >= 70) return "👍";
    if (score >= 60) return "👌";
    return "💪";
  };

  const hourlyItems = [
    { time: "오전 (6-12시)", text: result.hourly_fortune.morning, emoji: "🌅" },
    { time: "오후 (12-18시)", text: result.hourly_fortune.afternoon, emoji: "☀️" },
    { time: "저녁 (18-22시)", text: result.hourly_fortune.evening, emoji: "🌆" },
    { time: "밤 (22-6시)", text: result.hourly_fortune.night, emoji: "🌙" },
  ];

  return (
    <div className="daily-page">
      <header className="daily-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>오늘의 관상</h1>
      </header>

      {/* 날짜 & 총점 */}
      <section className="daily-hero">
        <span className="daily-date">{today}</span>
        <div className="mood-display">
          <span className="mood-emoji">{result.mood_emoji}</span>
          <div className="mood-score-ring">
            <svg viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="42" />
              <circle
                className="ring-fill"
                cx="50" cy="50" r="42"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - result.mood_score / 100)}
              />
            </svg>
            <div className="ring-text">
              <strong>{result.mood_score}</strong>
              <span>점</span>
            </div>
          </div>
        </div>
        <h2 className="mood-title">{result.mood_title}</h2>
        <div className="star-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < starRating ? "star filled" : "star"}>★</span>
          ))}
        </div>
        <div className="today-advice-card">
          <p className="today-advice-text">💬 {result.today_advice}</p>
        </div>
      </section>

      {/* 탭 메뉴 */}
      <div className="daily-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
          운세 총평
        </button>
        <button className={activeTab === "hourly" ? "active" : ""} onClick={() => setActiveTab("hourly")}>
          시간대별
        </button>
        <button className={activeTab === "lucky" ? "active" : ""} onClick={() => setActiveTab("lucky")}>
          행운 아이템
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="daily-content">
        {activeTab === "overview" && (
          <div className="fortune-list">
            {fortuneItems.map((item, idx) => (
              <div key={idx} className="fortune-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="fortune-item-header">
                  <span className="fortune-emoji">{item.emoji}</span>
                  <span className="fortune-label">{item.label}</span>
                  <div className="fortune-score-group">
                    <span className="score-emoji">{getScoreEmoji(item.score)}</span>
                    <span className="fortune-score" style={{ color: item.color }}>{item.score}점</span>
                  </div>
                </div>
                <div className="fortune-bar-wrap">
                  <div
                    className="fortune-bar-fill"
                    style={{ 
                      width: `${item.score}%`, 
                      background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                      boxShadow: `0 0 10px ${item.color}44`
                    }}
                  />
                  <div className="fortune-bar-labels">
                    <span className="bar-label-start">0</span>
                    <span className="bar-label-end">100</span>
                  </div>
                </div>
                <p className="fortune-text">{item.text}</p>
              </div>
            ))}
            
            {/* 추가 정보 섹션 */}
            {result.hidden_opportunity && (
              <div className="daily-extra-info opportunity-card">
                <h4>🔍 오늘의 숨은 기회</h4>
                <p>{result.hidden_opportunity}</p>
              </div>
            )}
            
            {result.avoid_actions && result.avoid_actions.length > 0 && (
              <div className="daily-extra-info warning-card">
                <h4>⚠️ 오늘 피해야 할 것</h4>
                <ul>
                  {result.avoid_actions.map((action, i) => (
                    <li key={i}>❌ {action}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.best_time && (
              <div className="daily-extra-info best-time-card">
                <h4>⏰ 오늘의 최적 시간대</h4>
                <p className="best-time-highlight">{result.best_time}</p>
              </div>
            )}
            
            {result.energy_pattern && (
              <div className="daily-extra-info energy-card">
                <h4>📊 에너지 흐름 패턴</h4>
                <p>{result.energy_pattern}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "hourly" && (
          <div className="hourly-list">
            {hourlyItems.map((item, idx) => (
              <div key={idx} className="hourly-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="hourly-header">
                  <span className="hourly-emoji">{item.emoji}</span>
                  <span className="hourly-time">{item.time}</span>
                </div>
                <p className="hourly-text">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "lucky" && (
          <div className="lucky-grid">
            <div className="lucky-card">
              <span className="lucky-icon">🎨</span>
              <strong>행운의 색</strong>
              <span className="lucky-value">{result.lucky_color}</span>
            </div>
            <div className="lucky-card">
              <span className="lucky-icon">🔢</span>
              <strong>행운의 숫자</strong>
              <span className="lucky-value">{result.lucky_number}</span>
            </div>
            <div className="lucky-card">
              <span className="lucky-icon">🧭</span>
              <strong>행운의 방향</strong>
              <span className="lucky-value">{result.lucky_direction}</span>
            </div>
            {result.lucky_food && (
              <div className="lucky-card">
                <span className="lucky-icon">🍱</span>
                <strong>행운의 음식</strong>
                <span className="lucky-value">{result.lucky_food}</span>
              </div>
            )}
            {result.lucky_item && (
              <div className="lucky-card">
                <span className="lucky-icon">✨</span>
                <strong>행운의 아이템</strong>
                <span className="lucky-value">{result.lucky_item}</span>
              </div>
            )}
            {result.lucky_keyword && (
              <div className="lucky-card lucky-card-wide">
                <span className="lucky-icon">🔑</span>
                <strong>오늘의 키워드</strong>
                <span className="lucky-value lucky-keyword">{result.lucky_keyword}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
