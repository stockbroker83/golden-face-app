import { useState } from "react";
import { analyzeSaju, type SajuAnalysis, type WuXing } from "../utils/sajuCalculator";
import { analyzeSajuWithAI, type SajuAIResult } from "../services/gemini";
import "../styles/ExtraFeatures.css";

interface SajuProps {
  onBack: () => void;
}

export default function Saju({ onBack }: SajuProps) {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("12");

  const [sajuAnalysis, setSajuAnalysis] = useState<SajuAnalysis | null>(null);
  const [aiResult, setAiResult] = useState<SajuAIResult | null>(null);

  const handleAnalyze = async () => {
    if (!name || !year || !month || !day) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);

    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
      alert("올바른 날짜를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const analysis = analyzeSaju(y, m, d, h, gender);
      setSajuAnalysis(analysis);

      const aiAnalysis = await analyzeSajuWithAI(analysis, name, gender);
      setAiResult(aiAnalysis);

      setStep('result');
    } catch (error) {
      console.error("사주 분석 오류:", error);
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

  if (loading) {
    return (
      <div className="extra-page">
        <div className="extra-loading">
          <div className="extra-loader"></div>
          <p>사주팔자를 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && sajuAnalysis && aiResult) {
    const coreNarrative = buildCoreSajuNarrative(name, sajuAnalysis, aiResult);

    return (
      <div className="extra-page">
        <header className="extra-header">
          <button className="back-btn" onClick={() => { setStep('input'); setSajuAnalysis(null); setAiResult(null); }}>← 다시 입력</button>
          <h1>☯️ {name}님의 사주팔자</h1>
          <button className="back-btn" onClick={onBack}>홈</button>
        </header>

        <div className="extra-content">
          {/* 사주 기둥 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', margin: '0 20px 20px', padding: '20px', background: 'rgba(240, 236, 228, 0.05)', borderRadius: '16px' }}>
            {[
              { label: '시주', pillar: sajuAnalysis.fourPillars.hour },
              { label: '일주', pillar: sajuAnalysis.fourPillars.day },
              { label: '월주', pillar: sajuAnalysis.fourPillars.month },
              { label: '연주', pillar: sajuAnalysis.fourPillars.year },
            ].map(({ label, pillar }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(240, 236, 228, 0.4)', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d4af37' }}>{pillar.stem}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#9370db' }}>{pillar.branch}</div>
                <div style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <span style={{ color: getWuxingColor(pillar.stemWuxing) }}>{pillar.stemWuxing}</span>
                  <span style={{ color: getWuxingColor(pillar.branchWuxing) }}>{pillar.branchWuxing}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 일간 */}
          <div className="result-card" style={{ background: 'linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%)', color: 'white', margin: '0 20px 20px' }}>
            <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>
              <span style={{ fontWeight: '500', opacity: 0.9 }}>일간(日干):</span>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0.5rem' }}>{sajuAnalysis.fourPillars.dayMaster}</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>({sajuAnalysis.fourPillars.dayMasterWuxing})</span>
            </div>
          </div>

          {/* 오행 균형 */}
          <div className="result-card">
            <h3>오행(五行) 균형</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: '목(木)', value: sajuAnalysis.wuxingBalance.wood, color: '#10b981' },
                { name: '화(火)', value: sajuAnalysis.wuxingBalance.fire, color: '#ef4444' },
                { name: '토(土)', value: sajuAnalysis.wuxingBalance.earth, color: '#eab308' },
                { name: '금(金)', value: sajuAnalysis.wuxingBalance.metal, color: '#9ca3af' },
                { name: '수(水)', value: sajuAnalysis.wuxingBalance.water, color: '#3b82f6' },
              ].map(({ name, value, color }) => {
                const percent = (value / sajuAnalysis.wuxingBalance.total) * 100;
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '3.5rem', fontSize: '0.95rem', fontWeight: '600' }}>{name}</span>
                    <div style={{ flex: 1, height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width 0.5s' }}></div>
                    </div>
                    <span style={{ width: '1.5rem', textAlign: 'right', fontWeight: '700', color: color }}>{value}</span>
                  </div>
                );
              })}
            </div>
            {sajuAnalysis.wuxingBalance.lacking.length > 0 && (
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#ef4444' }}>⚠️ 부족: {sajuAnalysis.wuxingBalance.lacking.join(', ')}</p>
            )}
          </div>

          {/* 성격 분석 */}
          <div className="result-card">
            <h3>성격 분석</h3>
            <p style={{ lineHeight: '1.7', opacity: 0.8, marginBottom: '1rem' }}>{aiResult.personality}</p>

            <div className="long-reading-block">
              <h4>📖 성격 썰풀이</h4>
              {toStoryParagraphs(aiResult.personality).map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ color: '#10b981', fontSize: '0.95rem', marginBottom: '0.5rem' }}>✅ 장점</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.6' }}>
                  {aiResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#ef4444', fontSize: '0.95rem', marginBottom: '0.5rem' }}>⚠️ 주의</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.6' }}>
                  {aiResult.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* 사대 운세 */}
          <div className="result-card">
            <h3>사대 운세</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>💕 연애운</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{aiResult.love_fortune}</p>
                <p className="fortune-deep-dive">{buildFortuneDeepDive('love', name, aiResult.love_fortune)}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>💰 재물운</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{aiResult.money_fortune}</p>
                <p className="fortune-deep-dive">{buildFortuneDeepDive('money', name, aiResult.money_fortune)}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>💼 직업운</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{aiResult.career_fortune}</p>
                <p className="fortune-deep-dive">{buildFortuneDeepDive('career', name, aiResult.career_fortune)}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>🏥 건강운</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{aiResult.health_fortune}</p>
                <p className="fortune-deep-dive">{buildFortuneDeepDive('health', name, aiResult.health_fortune)}</p>
              </div>
            </div>
          </div>

          <div className="result-card long-story-card">
            <h3>🧭 사주 종합 스토리 리딩</h3>
            {coreNarrative.map((line, idx) => (
              <p key={idx} className="story-line">{line}</p>
            ))}
          </div>

          {/* 2026년 운세 */}
          <div className="result-card" style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)', color: '#78350f' }}>
            <h3>2026년 올해 운세</h3>
            <p style={{ lineHeight: '1.7' }}>{aiResult.year_2026_fortune}</p>
          </div>

          {/* 현재 대운 */}
          {sajuAnalysis.currentDaeun && (
            <div className="result-card">
              <h3>현재 대운: {sajuAnalysis.currentDaeun.pillar.combined}</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>{sajuAnalysis.currentDaeun.description}</p>
              <p style={{ lineHeight: '1.6', opacity: 0.8, marginBottom: '1rem' }}>{aiResult.daeun_analysis}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {sajuAnalysis.daeun.slice(0, 9).map((d, i) => (
                  <div key={i} style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    border: d === sajuAnalysis.currentDaeun ? '2px solid #6366f1' : '1px solid rgba(240, 236, 228, 0.2)',
                    borderRadius: '10px',
                    background: d === sajuAnalysis.currentDaeun ? 'rgba(99, 102, 241, 0.15)' : 'rgba(240, 236, 228, 0.05)',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ fontWeight: '800', color: '#d4af37' }}>{d.pillar.combined}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{d.startAge}~{d.endAge}세</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 행운의 요소 */}
          <div className="result-card">
            <h3>🍀 행운의 요소</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>행운의 색상</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {aiResult.lucky_colors.map((c, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '12px', fontSize: '0.8rem' }}>{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>행운의 숫자</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {aiResult.lucky_numbers.map((n, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '12px', fontSize: '0.8rem' }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 인생 조언 */}
          <div className="result-card" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', color: 'white' }}>
            <h3>💎 인생 조언</h3>
            <p style={{ lineHeight: '1.7' }}>{aiResult.life_advice}</p>
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
        <h1>☯️ 사주팔자 분석</h1>
      </header>

      <div className="extra-hero">
        <span className="hero-emoji">☯️</span>
        <h2>사주팔자 AI 분석</h2>
        <p>천간지지로 인생의 흐름을 읽습니다</p>
      </div>

      <div className="extra-content">
        <div className="result-card">
          <h3>생년월일시 입력</h3>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4', fontSize: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>성별</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" checked={gender === 'male'} onChange={() => setGender('male')} name="gender" />
                  남성
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" checked={gender === 'female'} onChange={() => setGender('female')} name="gender" />
                  여성
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>📅 생년월일 (양력)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem' }}>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="1990" min="1900" max="2100"
                  style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
                <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="1" min="1" max="12"
                  style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
                <input type="number" value={day} onChange={(e) => setDay(e.target.value)} placeholder="1" min="1" max="31"
                  style={{ padding: '0.75rem', background: 'rgba(240, 236, 228, 0.05)', border: '1px solid rgba(240, 236, 228, 0.15)', borderRadius: '10px', color: '#f0ece4' }} />
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>연도 / 월 / 일</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>🕐 태어난 시간</label>
              <select value={hour} onChange={(e) => setHour(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: 'rgba(240, 236, 228, 0.1)', 
                  border: '1px solid rgba(240, 236, 228, 0.25)', 
                  borderRadius: '10px', 
                  color: '#f0ece4', 
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                <option value="0" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>자시 (23:30~01:29)</option>
                <option value="2" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>축시 (01:30~03:29)</option>
                <option value="4" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>인시 (03:30~05:29)</option>
                <option value="6" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>묘시 (05:30~07:29)</option>
                <option value="8" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>진시 (07:30~09:29)</option>
                <option value="10" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>사시 (09:30~11:29)</option>
                <option value="12" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>오시 (11:30~13:29)</option>
                <option value="14" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>미시 (13:30~15:29)</option>
                <option value="16" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>신시 (15:30~17:29)</option>
                <option value="18" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>유시 (17:30~19:29)</option>
                <option value="20" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>술시 (19:30~21:29)</option>
                <option value="22" style={{ background: '#2a2a2a', color: '#f0ece4', padding: '8px' }}>해시 (21:30~23:29)</option>
              </select>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>💡 시간을 모르면 오시(낮 12시)를 선택하세요</p>
            </div>

            <button onClick={handleAnalyze} className="primary-btn" style={{ marginTop: '0.5rem', fontSize: '1.05rem', fontWeight: '700', padding: '1rem' }}>
              ☯️ 사주팔자 분석하기
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>음력 생일인 경우 양력으로 변환 후 입력해주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function toStoryParagraphs(text: string): string[] {
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/\.(?=[^\s])/g, '. ')
    .trim();

  const chunks = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (chunks.length <= 2) {
    return [
      normalized,
      '핵심은 타고난 성향을 억지로 바꾸기보다, 강점이 살아나는 환경을 먼저 만드는 것입니다. 루틴을 단순화하고 우선순위를 명확히 하면 사주의 장점이 더 빠르게 현실로 연결됩니다.',
    ];
  }

  const grouped: string[] = [];
  for (let i = 0; i < chunks.length; i += 2) {
    grouped.push(chunks.slice(i, i + 2).join(' '));
  }
  return grouped;
}

function buildCoreSajuNarrative(name: string, sajuAnalysis: SajuAnalysis, aiResult: SajuAIResult): string[] {
  const dayMaster = sajuAnalysis.fourPillars.dayMaster;
  const wuxing = sajuAnalysis.fourPillars.dayMasterWuxing;
  const lacking = sajuAnalysis.wuxingBalance.lacking.length > 0
    ? sajuAnalysis.wuxingBalance.lacking.join(', ')
    : '특별히 부족한 오행 없음';

  return [
    `${name}님의 사주 중심축은 ${dayMaster}(${wuxing})입니다. 이 축이 안정적으로 작동하면 생각보다 큰 변화를 짧은 기간에 끌어낼 수 있는 타입입니다.`,
    `오행 균형 관점에서는 ${lacking} 포인트를 보완하는 생활 루틴이 중요합니다. 부족한 기운을 생활 습관으로 메우면 감정 기복과 판단 흔들림이 눈에 띄게 줄어듭니다.`,
    `성격·연애·재물·직업운을 함께 보면, 지금은 "기회를 기다리는 시기"보다 "기회를 만들 준비를 끝내는 시기"에 가깝습니다. 작은 실행을 매주 반복하면 운의 흐름이 훨씬 선명해집니다.`,
    `정리하면, ${aiResult.life_advice} 이 조언을 일상 루틴으로 구체화하는 순간부터 사주 해석이 실제 결과로 연결되기 시작합니다.`,
  ];
}

function buildFortuneDeepDive(kind: 'love' | 'money' | 'career' | 'health', name: string, original: string): string {
  const baseMap = {
    love: `${name}님의 연애운은 감정의 속도보다 신뢰의 깊이에서 승부가 납니다. 상대와의 대화에서 사실-감정-요청을 분리해 전달하면 오해를 크게 줄일 수 있고, 관계가 오래 갈 확률도 높아집니다.`,
    money: `${name}님의 재물운은 한 번에 크게 벌기보다 지출 구조를 정리할 때 먼저 상승합니다. 고정비 점검과 소액 분산 습관을 함께 가져가면 변동성이 줄고, 체감 자산이 안정적으로 늘어나는 패턴이 만들어집니다.`,
    career: `${name}님의 직업운은 실적과 신뢰를 동시에 쌓을 때 강하게 열립니다. 결과를 숫자로 남기고 협업 기록을 정리해두면, 평가·승진·이직 타이밍에서 유리한 카드로 작동합니다.`,
    health: `${name}님의 건강운은 과한 목표보다 꾸준한 리듬에서 개선 폭이 큽니다. 수면-수분-가벼운 운동 3가지만 일정하게 유지해도 집중력과 회복력이 함께 올라오는 흐름이 보입니다.`,
  };

  return `${original} ${baseMap[kind]}`;
}
