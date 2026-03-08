import { useState } from "react";
import { analyzeSaju, calculateCompatibility, type FourPillars, type WuXing } from "../utils/sajuCalculator";
import { analyzeSajuCompatibilityWithAI, type SajuCompatibilityAIResult } from "../services/gemini";
import "../styles/ExtraFeatures.css";

interface SajuCompatibilityProps {
  onBack: () => void;
}

interface PersonInput {
  name: string;
  gender: 'male' | 'female';
  year: string;
  month: string;
  day: string;
  hour: string;
}

export default function SajuCompatibility({ onBack }: SajuCompatibilityProps) {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);

  const [person1, setPerson1] = useState<PersonInput>({ name: "", gender: 'male', year: "", month: "", day: "", hour: "12" });
  const [person2, setPerson2] = useState<PersonInput>({ name: "", gender: 'female', year: "", month: "", day: "", hour: "12" });

  const [saju1, setSaju1] = useState<FourPillars | null>(null);
  const [saju2, setSaju2] = useState<FourPillars | null>(null);
  const [compatScore, setCompatScore] = useState<number>(0);
  const [compatDetails, setCompatDetails] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<SajuCompatibilityAIResult | null>(null);

  const handleAnalyze = async () => {
    if (!person1.name || !person1.year || !person1.month || !person1.day ||
        !person2.name || !person2.year || !person2.month || !person2.day) {
      alert("두 사람의 모든 정보를 입력해주세요.");
      return;
    }

    const y1 = parseInt(person1.year), m1 = parseInt(person1.month), d1 = parseInt(person1.day), h1 = parseInt(person1.hour);
    const y2 = parseInt(person2.year), m2 = parseInt(person2.month), d2 = parseInt(person2.day), h2 = parseInt(person2.hour);

    if (y1 < 1900 || y1 > 2100 || m1 < 1 || m1 > 12 || d1 < 1 || d1 > 31 ||
        y2 < 1900 || y2 > 2100 || m2 < 1 || m2 > 12 || d2 < 1 || d2 > 31) {
      alert("올바른 날짜를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const analysis1 = analyzeSaju(y1, m1, d1, h1, person1.gender);
      const analysis2 = analyzeSaju(y2, m2, d2, h2, person2.gender);
      setSaju1(analysis1.fourPillars);
      setSaju2(analysis2.fourPillars);

      const compat = calculateCompatibility(analysis1.fourPillars, analysis2.fourPillars);
      setCompatScore(compat.score);
      setCompatDetails(compat.details);

      const aiAnalysis = await analyzeSajuCompatibilityWithAI(
        analysis1.fourPillars, analysis2.fourPillars,
        person1.name, person2.name, compat.score, compat.details
      );
      setAiResult(aiAnalysis);

      setStep('result');
    } catch (error) {
      console.error("궁합 분석 오류:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getWuxingColor = (wuxing: WuXing): string => {
    switch (wuxing) {
      case '목(木)': return '#10b981';
      case '화(火)': return '#ef4444';
      case '토(土)': return '#eab308';
      case '금(金)': return '#9ca3af';
      case '수(水)': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 80) return '💘';
    if (score >= 65) return '💕';
    if (score >= 50) return '😊';
    if (score >= 35) return '😐';
    return '😔';
  };

  if (loading) {
    return (
      <div className="extra-page">
        <div className="extra-loading">
          <div className="extra-loader"></div>
          <p>사주 궁합을 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && saju1 && saju2 && aiResult) {
    return (
      <div className="extra-page">
        <header className="extra-header">
          <button className="back-btn" onClick={() => { setStep('input'); setSaju1(null); setSaju2(null); setAiResult(null); }}>← 다시 입력</button>
          <h1>💫 {person1.name} ♥ {person2.name}</h1>
          <button className="back-btn" onClick={onBack}>홈</button>
        </header>

        <div className="extra-content">
          {/* 궁합 점수 */}
          <div className="result-card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '0.5rem' }}>{getScoreEmoji(compatScore)}</div>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>{compatScore}점</div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ width: `${compatScore}%`, height: '100%', background: 'white', transition: 'width 0.8s' }}></div>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{aiResult.overall_summary.split('.')[0]}</p>
          </div>

          {/* 기본 궁합 분석 */}
          <div className="result-card">
            <h3>궁합 분석 요소</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {compatDetails.map((detail, i) => (
                <p key={i} style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.85 }}>{detail}</p>
              ))}
            </div>
          </div>

          {/* 사주 비교 */}
          <div className="result-card">
            <h3>사주팔자 비교</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ color: '#ec4899', marginBottom: '0.75rem', textAlign: 'center' }}>{person1.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>연주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju1.year.stemWuxing) }}>{saju1.year.combined}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>월주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju1.month.stemWuxing) }}>{saju1.month.combined}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>일주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju1.day.stemWuxing) }}>{saju1.day.combined}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>시주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju1.hour.stemWuxing) }}>{saju1.hour.combined}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(240, 236, 228, 0.2)', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                    <span>일간:</span>
                    <span style={{ fontSize: '1.2rem', color: '#d4af37' }}>{saju1.dayMaster}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#a855f7', marginBottom: '0.75rem', textAlign: 'center' }}>{person2.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>연주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju2.year.stemWuxing) }}>{saju2.year.combined}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>월주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju2.month.stemWuxing) }}>{saju2.month.combined}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>일주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju2.day.stemWuxing) }}>{saju2.day.combined}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.6 }}>시주:</span>
                    <span style={{ fontWeight: '700', color: getWuxingColor(saju2.hour.stemWuxing) }}>{saju2.hour.combined}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(240, 236, 228, 0.2)', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                    <span>일간:</span>
                    <span style={{ fontSize: '1.2rem', color: '#d4af37' }}>{saju2.dayMaster}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 종합 분석 */}
          <div className="result-card">
            <h3>AI 종합 분석</h3>
            <p style={{ lineHeight: '1.7', opacity: 0.85, marginTop: '0.75rem' }}>{aiResult.overall_summary}</p>
          </div>

          {/* 분야별 궁합 */}
          <div className="result-card">
            <h3>분야별 궁합</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div><h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>💕 연애 궁합</h4><p style={{ fontSize: '0.85rem', opacity: 0.75, lineHeight: '1.6' }}>{aiResult.love_compatibility}</p></div>
              <div><h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>💍 결혼 궁합</h4><p style={{ fontSize: '0.85rem', opacity: 0.75, lineHeight: '1.6' }}>{aiResult.marriage_compatibility}</p></div>
              <div><h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>💼 업무 궁합</h4><p style={{ fontSize: '0.85rem', opacity: 0.75, lineHeight: '1.6' }}>{aiResult.work_compatibility}</p></div>
              <div><h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>💬 소통 스타일</h4><p style={{ fontSize: '0.85rem', opacity: 0.75, lineHeight: '1.6' }}>{aiResult.communication_style}</p></div>
            </div>
          </div>

          {/* 조화와 갈등 */}
          <div className="result-card">
            <h3>조화와 갈등 포인트</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ 조화 포인트</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', opacity: 0.75, lineHeight: '1.6' }}>
                  {aiResult.harmony_points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem' }}>⚠️ 갈등 요소</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', opacity: 0.75, lineHeight: '1.6' }}>
                  {aiResult.conflict_areas.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* 관계 개선 조언 */}
          <div className="result-card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: 'white' }}>
            <h3>💎 관계 개선 조언</h3>
            <p style={{ lineHeight: '1.7' }}>{aiResult.advice_for_better_relationship}</p>
          </div>
        </div>
      </div>
    );
  }

  // 입력 화면
  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 홈</button>
        <h1>💫 사주 궁합 분석</h1>
      </header>

      <div className="extra-hero compact">
        <span className="hero-emoji">💫</span>
        <h2>두 사람의 사주 궁합</h2>
        <p>사주팔자로 인연의 깊이를 탐색합니다</p>
      </div>

      <div className="extra-content">
        {/* 첫 번째 사람 */}
        <div className="result-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)' }}>
          <h3 style={{ color: '#ec4899' }}>첫 번째 사람 정보</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input type="text" placeholder="이름" value={person1.name} onChange={(e) => setPerson1({...person1, name: e.target.value})}
              style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" checked={person1.gender === 'male'} onChange={() => setPerson1({...person1, gender: 'male'})} />
                남성
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" checked={person1.gender === 'female'} onChange={() => setPerson1({...person1, gender: 'female'})} />
                여성
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
              <input type="number" placeholder="1990" value={person1.year} onChange={(e) => setPerson1({...person1, year: e.target.value})}
                style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
              <input type="number" placeholder="월" value={person1.month} onChange={(e) => setPerson1({...person1, month: e.target.value})}
                style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
              <input type="number" placeholder="일" value={person1.day} onChange={(e) => setPerson1({...person1, day: e.target.value})}
                style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
            </div>
            <select value={person1.hour} onChange={(e) => setPerson1({...person1, hour: e.target.value})}
              style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4', fontSize: '0.85rem' }}>
              <option value="12">오시 (모를 경우 선택)</option>
              <option value="0">자시 (23:30~01:29)</option>
              <option value="2">축시 (01:30~03:29)</option>
              <option value="4">인시 (03:30~05:29)</option>
              <option value="6">묘시 (05:30~07:29)</option>
              <option value="8">진시 (07:30~09:29)</option>
              <option value="10">사시 (09:30~11:29)</option>
              <option value="14">미시 (13:30~15:29)</option>
              <option value="16">신시 (15:30~17:29)</option>
              <option value="18">유시 (17:30~19:29)</option>
              <option value="20">술시 (19:30~21:29)</option>
              <option value="22">해시 (21:30~23:29)</option>
            </select>
          </div>
        </div>

        {/* 두 번째 사람 */}
        <div className="result-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
          <h3 style={{ color: '#a855f7' }}>두 번째 사람 정보</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input type="text" placeholder="이름" value={person2.name} onChange={(e) => setPerson2({...person2, name: e.target.value})}
              style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" checked={person2.gender === 'male'} onChange={() => setPerson2({...person2, gender: 'male'})} />
                남성
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" checked={person2.gender === 'female'} onChange={() => setPerson2({...person2, gender: 'female'})} />
                여성
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
              <input type="number" placeholder="1992" value={person2.year} onChange={(e) => setPerson2({...person2, year: e.target.value})}
                style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
              <input type="number" placeholder="월" value={person2.month} onChange={(e) => setPerson2({...person2, month: e.target.value})}
                style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
              <input type="number" placeholder="일" value={person2.day} onChange={(e) => setPerson2({...person2, day: e.target.value})}
                style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
            </div>
            <select value={person2.hour} onChange={(e) => setPerson2({...person2, hour: e.target.value})}
              style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4', fontSize: '0.85rem' }}>
              <option value="12">오시 (모를 경우 선택)</option>
              <option value="0">자시 (23:30~01:29)</option>
              <option value="2">축시 (01:30~03:29)</option>
              <option value="4">인시 (03:30~05:29)</option>
              <option value="6">묘시 (05:30~07:29)</option>
              <option value="8">진시 (07:30~09:29)</option>
              <option value="10">사시 (09:30~11:29)</option>
              <option value="14">미시 (13:30~15:29)</option>
              <option value="16">신시 (15:30~17:29)</option>
              <option value="18">유시 (17:30~19:29)</option>
              <option value="20">술시 (19:30~21:29)</option>
              <option value="22">해시 (21:30~23:29)</option>
            </select>
          </div>
        </div>

        <button onClick={handleAnalyze} className="primary-btn" style={{ margin: '0 20px', fontSize: '1.05rem', fontWeight: '700', padding: '1rem' }}>
          💫 사주 궁합 분석하기
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, margin: '1rem 0' }}>음력 생일은 양력으로 변환 후 입력하세요</p>
      </div>
    </div>
  );
}
