import { useState, useEffect } from "react";
import { UserData } from "../types";
import { analyzeTojeong } from "../services/gemini";
import { canUseAI, incrementMonthlyUsage } from "../utils/monthlyUsageManager";
import "../styles/ExtraFeatures.css";

interface Props {
  userData: UserData;
  onBack: () => void;
}

export interface TojeongResult {
  gua_number: string;
  gua_name: string;
  year_summary: string;
  monthly: { month: number; title: string; fortune: string; score: number }[];
  best_month: number;
  worst_month: number;
  year_advice: string;
}

export default function TojeongBigyeol({ userData, onBack }: Props) {
  const [result, setResult] = useState<TojeongResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!canUseAI()) {
        setLoading(false);
        return;
      }

      try {
        const data = await analyzeTojeong(userData);
        incrementMonthlyUsage();
        setResult(data);
      } catch (err) {
        console.error("토정비결 분석 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [userData]);

  if (loading) {
    return (
      <div className="extra-page">
        <header className="extra-header">
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
          <h1>📜 토정비결</h1>
        </header>
        <div className="extra-loading">
          <div className="scroll-animation">📜</div>
          <h2>2026년 토정비결을 펼치는 중...</h2>
          <p>144괘 중 당신의 괘를 찾고 있어요</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const getScoreEmoji = (score: number) => {
    if (score >= 85) return "🔥";
    if (score >= 70) return "😊";
    if (score >= 55) return "😐";
    return "⚠️";
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return "#d4af37";
    if (score >= 70) return "#10b981";
    if (score >= 55) return "#3b82f6";
    return "#f59e0b";
  };

  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>📜 2026 토정비결</h1>
      </header>

      {/* 괘 소개 */}
      <section className="tojeong-hero">
        <div className="gua-display">
          <span className="gua-number">{result.gua_number}</span>
          <h2>{result.gua_name}</h2>
        </div>
        <p className="year-summary">{result.year_summary}</p>
        <div className="best-worst">
          <div className="bw-item best">
            <span>🔥 최고의 달</span>
            <strong>{result.best_month}월</strong>
          </div>
          <div className="bw-item worst">
            <span>⚠️ 조심할 달</span>
            <strong>{result.worst_month}월</strong>
          </div>
        </div>
      </section>

      {/* 월별 운세 */}
      <section className="monthly-section">
        <h3 className="section-title"><span>📅</span> 월별 운세</h3>
        <div className="monthly-list">
          {result.monthly.map((m) => (
            <div
              key={m.month}
              className={`monthly-card ${expandedMonth === m.month ? "expanded" : ""} ${m.month === result.best_month ? "best-month" : ""} ${m.month === result.worst_month ? "worst-month" : ""}`}
              onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
            >
              <div className="monthly-header">
                <span className="monthly-label">{m.month}월</span>
                <span className="monthly-title">{m.title}</span>
                <div className="monthly-right">
                  <span className="monthly-emoji">{getScoreEmoji(m.score)}</span>
                  <span className="monthly-score" style={{ color: getBarColor(m.score) }}>{m.score}점</span>
                  <span className="expand-arrow">{expandedMonth === m.month ? "▲" : "▼"}</span>
                </div>
              </div>
              <div className="monthly-bar">
                <div className="monthly-bar-fill" style={{ width: `${m.score}%`, background: getBarColor(m.score) }} />
              </div>
              {expandedMonth === m.month && (
                <div className="monthly-detail">
                  <p>{m.fortune}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 연간 조언 */}
      <section className="year-advice-section">
        <h3>💡 2026년 종합 조언</h3>
        <p>{result.year_advice}</p>
      </section>
    </div>
  );
}
