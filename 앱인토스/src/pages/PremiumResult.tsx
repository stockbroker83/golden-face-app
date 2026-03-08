import { useMemo, useState } from "react";
import { PremiumAnalysisResult, UserData, FreeAnalysisResult } from "../types";
import { generatePDF } from "../utils/pdfGenerator";
import { generateShareImage, shareNative, downloadShareImage } from "../utils/shareGenerator";
import { vibrateSuccess } from "../utils/haptic";
import TarotCardPicker from "../components/TarotCardPicker";
import "../styles/PremiumResult.css";

interface PremiumResultProps {
  userData: UserData;
  premiumAnalysis: PremiumAnalysisResult;
  imageFile: File;
  onBack: () => void;
}

type TabType = "overview" | "face" | "2026" | "saju" | "tarot" | "jeom" | "relations";

// Mock 2026년 월별 운세 데이터
const generateMonthlyFortune = () => [
  { month: 1, monthName: "1월", love: 75, money: 82, health: 88, work: 79, summary: "새해를 시작하는 긍정적인 에너지가 가득합니다.", luckyDay: 15, luckyColor: "#FFD700" },
  { month: 2, monthName: "2월", love: 68, money: 76, health: 85, work: 72, summary: "인내심을 갖고 차근차근 진행하세요.", luckyDay: 8, luckyColor: "#FF69B4" },
  { month: 3, monthName: "3월", love: 92, money: 95, health: 90, work: 88, summary: "최고의 달! 재물운이 폭발합니다.", luckyDay: 21, luckyColor: "#32CD32" },
  { month: 4, monthName: "4월", love: 78, money: 81, health: 83, work: 85, summary: "새로운 만남과 기회가 찾아옵니다.", luckyDay: 12, luckyColor: "#87CEEB" },
  { month: 5, monthName: "5월", love: 85, money: 79, health: 91, work: 87, summary: "건강운이 최고조. 활력이 넘칩니다.", luckyDay: 5, luckyColor: "#FFA500" },
  { month: 6, monthName: "6월", love: 71, money: 74, health: 78, work: 76, summary: "꾸준한 노력이 빛을 발하는 시기입니다.", luckyDay: 18, luckyColor: "#9370DB" },
  { month: 7, monthName: "7월", love: 88, money: 91, health: 86, work: 92, summary: "직장에서 인정받는 시기. 승진 가능성!", luckyDay: 7, luckyColor: "#FF6347" },
  { month: 8, monthName: "8월", love: 76, money: 78, health: 80, work: 82, summary: "휴식을 통해 재충전하는 시간을 가지세요.", luckyDay: 14, luckyColor: "#20B2AA" },
  { month: 9, monthName: "9월", love: 65, money: 70, health: 68, work: 72, summary: "주의할 달. 건강 관리가 필요합니다.", luckyDay: 23, luckyColor: "#DDA0DD" },
  { month: 10, monthName: "10월", love: 82, money: 88, health: 84, work: 86, summary: "재물운과 연애운이 동시에 상승합니다.", luckyDay: 10, luckyColor: "#FFD700" },
  { month: 11, monthName: "11월", love: 79, money: 83, health: 87, work: 81, summary: "목표를 향해 달려가기 좋은 시기입니다.", luckyDay: 27, luckyColor: "#FF69B4" },
  { month: 12, monthName: "12월", love: 90, money: 86, health: 89, work: 91, summary: "한 해를 마무리하는 대미를 장식합니다!", luckyDay: 31, luckyColor: "#32CD32" },
];

export default function PremiumResult({ premiumAnalysis, imageFile, userData, onBack }: PremiumResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const imageUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);
  const featureEntries = useMemo(
    () => Object.entries(premiumAnalysis.features) as Array<[string, { score: number; title: string; description: string; advice: string }]>,
    [premiumAnalysis.features]
  );
  const monthlyFortune = useMemo(() => generateMonthlyFortune(), []);
  const overviewStory = useMemo(
    () => buildOverviewStory(premiumAnalysis),
    [premiumAnalysis]
  );
  const sajuDeepDives = useMemo(
    () => buildSajuDeepDives(premiumAnalysis.saju, premiumAnalysis.face_type),
    [premiumAnalysis.saju, premiumAnalysis.face_type]
  );
  const tarotDeepDives = useMemo(
    () => buildTarotDeepDives(premiumAnalysis.tarot, premiumAnalysis.face_type),
    [premiumAnalysis.tarot, premiumAnalysis.face_type]
  );

  const handleShare = async () => {
    try {
      setIsGeneratingShare(true);

      // Premium → Free 변환
      const freeAnalysis: FreeAnalysisResult = {
        overall_score: premiumAnalysis.overall_score,
        face_type: premiumAnalysis.face_type,
        overall_impression: premiumAnalysis.overall_impression,
        emoji: premiumAnalysis.emoji,
        forehead: premiumAnalysis.features.forehead,
        eyes: premiumAnalysis.features.eyes,
        nose: premiumAnalysis.features.nose,
        mouth: premiumAnalysis.features.mouth,
        ears: premiumAnalysis.features.ears,
      };

      const shareImage = await generateShareImage(freeAnalysis, imageUrl);
      const shared = await shareNative(shareImage, freeAnalysis);

      if (!shared) {
        downloadShareImage(shareImage);
      }

      vibrateSuccess();
    } catch (error) {
      console.error('공유 실패:', error);
      alert('공유 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPDF(true);
      const pdfBlob = await generatePDF(premiumAnalysis, userData, imageUrl);
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `금빛관상_${userData.birth_date}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      vibrateSuccess();
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="premium-result">
      <header className="premium-header">
        <button onClick={onBack} className="back-btn">← 뒤로</button>
        <h1>프리미엄 결과</h1>
      </header>

      <div className="profile-card">
        <img src={imageUrl} alt="얼굴" className="profile-photo" />
        <div className="profile-info">
          <h2>{premiumAnalysis.emoji} {premiumAnalysis.face_type}</h2>
          <div className="overall-score">
            <span className="score-label">종합 점수</span>
            <span className="score-value">{premiumAnalysis.overall_score}점</span>
          </div>
          <p>{premiumAnalysis.overall_impression}</p>
        </div>
      </div>

      <div className="summary-dashboard">
        <div className="dashboard-card overall">
          <div className="card-icon">🌟</div>
          <div className="card-content">
            <h3>종합 점수</h3>
            <div className="score-large">{premiumAnalysis.overall_score}점</div>
            <p>{premiumAnalysis.face_type}</p>
          </div>
        </div>

        <div className="dashboard-card strength">
          <div className="card-icon">💪</div>
          <div className="card-content">
            <h3>가장 좋은 부위</h3>
            <div className="feature-highlight">
              {getBestFeature(premiumAnalysis.features)}
            </div>
            <p className="score-text">{getBestScore(premiumAnalysis.features)}점</p>
          </div>
        </div>

        <div className="dashboard-card weakness">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>주의할 부위</h3>
            <div className="feature-highlight">
              {getWorstFeature(premiumAnalysis.features)}
            </div>
            <p className="score-text">{getWorstScore(premiumAnalysis.features)}점</p>
          </div>
        </div>

        <div className="dashboard-card fortune">
          <div className="card-icon">🔮</div>
          <div className="card-content">
            <h3>2026년 대운</h3>
            <div className="fortune-preview">
              {get2026MainFortune(premiumAnalysis.saju)}
            </div>
          </div>
        </div>
      </div>

      <div className="tab-menu">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>📊 종합</button>
        <button className={activeTab === "face" ? "active" : ""} onClick={() => setActiveTab("face")}>👤 12관상</button>
        <button className={activeTab === "2026" ? "active" : ""} onClick={() => setActiveTab("2026")}>📅 2026운세</button>
        <button className={activeTab === "saju" ? "active" : ""} onClick={() => setActiveTab("saju")}>☯️ 사주</button>
        <button className={activeTab === "tarot" ? "active" : ""} onClick={() => setActiveTab("tarot")}>🔮 타로</button>
        <button className={activeTab === "jeom" ? "active" : ""} onClick={() => setActiveTab("jeom")}>📿 주역</button>
        <button className={activeTab === "relations" ? "active" : ""} onClick={() => setActiveTab("relations")}>🌟 귀인</button>
      </div>

      <div className="tab-content">
        {/* 종합 탭 */}
        {activeTab === "overview" && (
          <div className="overview-section">
            <h3 className="section-heading">✨ 한눈에 보는 당신의 운명</h3>
            <div className="story-block overview-story-block">
              <h4>📖 종합 해설</h4>
              {overviewStory.map((line, idx) => (
                <p key={idx} className="story-paragraph">{line}</p>
              ))}
            </div>
            
            {/* 2026 월별 운세 미리보기 */}
            <div className="monthly-preview-card">
              <h4 className="card-subtitle">📅 2026년 월별 운세 그래프</h4>
              <div className="month-bars">
                {monthlyFortune.map((month) => {
                  const avg = (month.love + month.money + month.health + month.work) / 4;
                  return (
                    <div key={month.month} className="month-bar-item">
                      <div className="bar-wrapper">
                        <div className="bar-fill" style={{ height: `${avg}%`, background: month.luckyColor }} />
                      </div>
                      <span className="month-label">{month.month}월</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 베스트 & 워스트 월 */}
            <div className="best-worst-months">
              <div className="best-month-card">
                <div className="card-emoji">🌟</div>
                <h5>최고의 달</h5>
                <p className="month-name">3월</p>
                <p className="month-desc">재물운이 폭발해요!</p>
              </div>
              <div className="worst-month-card">
                <div className="card-emoji">⚠️</div>
                <h5>주의할 달</h5>
                <p className="month-name">9월</p>
                <p className="month-desc">건강 관리가 필요해요</p>
              </div>
            </div>

            {/* 종합 요약 */}
            <div className="overview-summary">
              <div className="summary-item">
                <span className="summary-icon">💪</span>
                <div>
                  <h5>최고 강점</h5>
                  <p>{getBestFeature(premiumAnalysis.features)} ({getBestScore(premiumAnalysis.features)}점)</p>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-icon">⚠️</span>
                <div>
                  <h5>주의 부위</h5>
                  <p>{getWorstFeature(premiumAnalysis.features)} ({getWorstScore(premiumAnalysis.features)}점)</p>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-icon">🔮</span>
                <div>
                  <h5>2026년 대운</h5>
                  <p>{get2026MainFortune(premiumAnalysis.saju)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12관상 탭 */}
        {activeTab === "face" && (
          <div className="face-tab">
            <div className="face-map-container">
              <img
                src={imageUrl}
                alt="얼굴"
                className="face-map-base"
              />
              <div className="face-map-overlay">
                <div className="feature-marker forehead" style={{ top: "15%", left: "50%" }}>
                  <span className="marker-score">{premiumAnalysis.features.forehead.score}</span>
                  <span className="marker-label">이마</span>
                </div>
                <div className="feature-marker eyes" style={{ top: "35%", left: "30%" }}>
                  <span className="marker-score">{premiumAnalysis.features.eyes.score}</span>
                  <span className="marker-label">눈</span>
                </div>
                <div className="feature-marker nose" style={{ top: "50%", left: "50%" }}>
                  <span className="marker-score">{premiumAnalysis.features.nose.score}</span>
                  <span className="marker-label">코</span>
                </div>
                <div className="feature-marker mouth" style={{ top: "65%", left: "50%" }}>
                  <span className="marker-score">{premiumAnalysis.features.mouth.score}</span>
                  <span className="marker-label">입</span>
                </div>
                <div className="feature-marker chin" style={{ top: "80%", left: "50%" }}>
                  <span className="marker-score">{premiumAnalysis.features.chin.score}</span>
                  <span className="marker-label">턱</span>
                </div>
              </div>
            </div>

            {featureEntries.map(([key, feature], idx) => {
              const featureStory = buildFeatureStory(key, feature, premiumAnalysis.face_type);
              return (
              <div key={idx} className="premium-feature-card">
                <div className="feature-header-with-icon">
                  <div className="feature-icon">{getFeatureIcon(key)}</div>
                  <div className="feature-info">
                    <h3>{getFeatureName(key)}</h3>
                    <div className="feature-subtitle">{getFeatureSubtitle(key)}</div>
                  </div>
                  <div className="feature-score-badge">
                    <span className="score-number">{feature.score}</span>
                    <span className="score-label">점</span>
                  </div>
                </div>

                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${feature.score}%`,
                      background: getScoreColor(feature.score),
                    }}
                  />
                </div>

                <div className="feature-body">
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>

                  <div className="feature-story">
                    <h5>📝 세부 해설</h5>
                    {featureStory.map((line, lineIdx) => (
                      <p key={lineIdx} className="story-paragraph">{line}</p>
                    ))}
                  </div>

                  <div className="feature-advice">
                    <div className="advice-header">
                      <span className="advice-icon">💡</span>
                      <strong>개선 조언</strong>
                    </div>
                    <p>{feature.advice}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* 2026 운세 달력 탭 */}
        {activeTab === "2026" && (
          <div className="yearly-fortune-section">
            <h3 className="section-heading">📅 2026년 12개월 운세 달력</h3>
            {monthlyFortune.map((month) => (
              <div key={month.month} className="month-card">
                <div className="month-header">
                  <h4>{month.monthName} ({month.month}월)</h4>
                  <div className="lucky-day-badge">
                    행운의 날: {month.luckyDay}일
                  </div>
                </div>
                
                {/* 4대 운세 막대 */}
                <div className="fortune-bars-2026">
                  <div className="fortune-item-2026">
                    <span className="fortune-label-2026">💕 연애</span>
                    <div className="bar-bg-2026">
                      <div className="bar-fill-2026 love" style={{ width: `${month.love}%` }} />
                    </div>
                    <span className="fortune-score-2026">{month.love}</span>
                  </div>
                  <div className="fortune-item-2026">
                    <span className="fortune-label-2026">💰 재물</span>
                    <div className="bar-bg-2026">
                      <div className="bar-fill-2026 money" style={{ width: `${month.money}%` }} />
                    </div>
                    <span className="fortune-score-2026">{month.money}</span>
                  </div>
                  <div className="fortune-item-2026">
                    <span className="fortune-label-2026">💚 건강</span>
                    <div className="bar-bg-2026">
                      <div className="bar-fill-2026 health" style={{ width: `${month.health}%` }} />
                    </div>
                    <span className="fortune-score-2026">{month.health}</span>
                  </div>
                  <div className="fortune-item-2026">
                    <span className="fortune-label-2026">💼 직장</span>
                    <div className="bar-bg-2026">
                      <div className="bar-fill-2026 work" style={{ width: `${month.work}%` }} />
                    </div>
                    <span className="fortune-score-2026">{month.work}</span>
                  </div>
                </div>

                <p className="month-summary">{month.summary}</p>
                <div className="month-lucky">
                  행운의 색: <span className="lucky-color-box" style={{ background: month.luckyColor }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 사주 4대운 탭 */}
        {activeTab === "saju" && (
          <div className="saju-tab">
            <div className="saju-overview-chart">
              <h3 className="chart-title">2026년 운세 종합</h3>
              <div className="fortune-bars">
                <div className="fortune-bar-item">
                  <div className="bar-label">
                    <span className="bar-icon">💘</span>
                    <span>연애운</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar-fill love"
                      style={{ width: `${calculateFortuneScore(premiumAnalysis.saju.love)}%` }}
                    >
                      <span className="bar-value">{calculateFortuneScore(premiumAnalysis.saju.love)}점</span>
                    </div>
                  </div>
                </div>

                <div className="fortune-bar-item">
                  <div className="bar-label">
                    <span className="bar-icon">💰</span>
                    <span>재물운</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar-fill money"
                      style={{ width: `${calculateFortuneScore(premiumAnalysis.saju.money)}%` }}
                    >
                      <span className="bar-value">{calculateFortuneScore(premiumAnalysis.saju.money)}점</span>
                    </div>
                  </div>
                </div>

                <div className="fortune-bar-item">
                  <div className="bar-label">
                    <span className="bar-icon">🏥</span>
                    <span>건강운</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar-fill health"
                      style={{ width: `${calculateFortuneScore(premiumAnalysis.saju.health)}%` }}
                    >
                      <span className="bar-value">{calculateFortuneScore(premiumAnalysis.saju.health)}점</span>
                    </div>
                  </div>
                </div>

                <div className="fortune-bar-item">
                  <div className="bar-label">
                    <span className="bar-icon">💼</span>
                    <span>직장운</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar-fill career"
                      style={{ width: `${calculateFortuneScore(premiumAnalysis.saju.career)}%` }}
                    >
                      <span className="bar-value">{calculateFortuneScore(premiumAnalysis.saju.career)}점</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="saju-card love-card">
              <div className="saju-card-header">
                <div className="saju-icon">💘</div>
                <h3>연애운</h3>
                <div className="fortune-badge high">상승</div>
              </div>
              <div className="saju-card-body">
                <p className="saju-text">{premiumAnalysis.saju.love}</p>
                <div className="deep-dive-text">
                  {sajuDeepDives.love.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
                <div className="saju-keywords">
                  <span className="keyword">새로운 만남</span>
                  <span className="keyword">인연</span>
                  <span className="keyword">설렘</span>
                </div>
              </div>
            </div>

            <div className="saju-card money-card">
              <div className="saju-card-header">
                <div className="saju-icon">💰</div>
                <h3>재물운</h3>
                <div className="fortune-badge medium">보통</div>
              </div>
              <div className="saju-card-body">
                <p className="saju-text">{premiumAnalysis.saju.money}</p>
                <div className="deep-dive-text">
                  {sajuDeepDives.money.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
                <div className="saju-keywords">
                  <span className="keyword">재테크</span>
                  <span className="keyword">부수입</span>
                  <span className="keyword">저축</span>
                </div>
              </div>
            </div>

            <div className="saju-card health-card">
              <div className="saju-card-header">
                <div className="saju-icon">🏥</div>
                <h3>건강운</h3>
                <div className="fortune-badge high">호조</div>
              </div>
              <div className="saju-card-body">
                <p className="saju-text">{premiumAnalysis.saju.health}</p>
                <div className="deep-dive-text">
                  {sajuDeepDives.health.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
                <div className="saju-keywords">
                  <span className="keyword">활력</span>
                  <span className="keyword">운동</span>
                  <span className="keyword">밸런스</span>
                </div>
              </div>
            </div>

            <div className="saju-card career-card">
              <div className="saju-card-header">
                <div className="saju-icon">💼</div>
                <h3>직장운</h3>
                <div className="fortune-badge high">대박</div>
              </div>
              <div className="saju-card-body">
                <p className="saju-text">{premiumAnalysis.saju.career}</p>
                <div className="deep-dive-text">
                  {sajuDeepDives.career.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
                <div className="saju-keywords">
                  <span className="keyword">승진</span>
                  <span className="keyword">인정</span>
                  <span className="keyword">기회</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tarot" && (
          <div className="tarot-tab">
            <TarotCardPicker
              present={premiumAnalysis.tarot.present}
              future={premiumAnalysis.tarot.future}
              action={premiumAnalysis.tarot.action}
              onComplete={(cards) => console.log("타로 카드 공개 완료", cards)}
            />

            <div className="story-block tarot-story-block">
              <h4>🃏 타로 확장 리딩</h4>
              <div className="tarot-reading-grid">
                <div className="tarot-reading-card">
                  <h5>현재의 흐름</h5>
                  {tarotDeepDives.present.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
                <div className="tarot-reading-card">
                  <h5>다가올 변화</h5>
                  {tarotDeepDives.future.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
                <div className="tarot-reading-card">
                  <h5>실행 가이드</h5>
                  {tarotDeepDives.action.map((line, idx) => (
                    <p key={idx} className="story-paragraph">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "jeom" && (
          <div className="relations-tab">
            <div className="relation-card helpful">
              <h3>☯️ 괘</h3>
              <p>{premiumAnalysis.iching.gua}</p>
            </div>
            <div className="relation-card">
              <h3>📜 해석</h3>
              <p>{premiumAnalysis.iching.interpretation}</p>
            </div>
            <div className="relation-card">
              <h3>💡 조언</h3>
              <p>{premiumAnalysis.iching.advice}</p>
            </div>
          </div>
        )}

        {activeTab === "relations" && (
          <div className="relations-tab">
            {/* 귀인 카드 */}
            <div className="relation-card helpful-card">
              <div className="relation-header">
                <div className="relation-badge helpful">👥 귀인</div>
                <h3>도움을 줄 사람</h3>
              </div>
              
              <div className="face-illustration">
                <div className="face-svg helpful-face">
                  {/* SVG 얼굴 일러스트 */}
                  <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
                    {/* 얼굴형 - 둥근 */}
                    <ellipse cx="100" cy="120" rx="80" ry="100" fill="#ffd6a5" />
                    
                    {/* 눈썹 - 부드러운 곡선 */}
                    <path d="M 60 95 Q 75 90 90 95" stroke="#8b6f47" strokeWidth="3" fill="none" />
                    <path d="M 110 95 Q 125 90 140 95" stroke="#8b6f47" strokeWidth="3" fill="none" />
                    
                    {/* 눈 - 웃는 눈 */}
                    <circle cx="70" cy="110" r="8" fill="#333" />
                    <circle cx="130" cy="110" r="8" fill="#333" />
                    <path d="M 55 105 Q 70 100 85 105" stroke="#333" strokeWidth="2" fill="none" />
                    <path d="M 115 105 Q 130 100 145 105" stroke="#333" strokeWidth="2" fill="none" />
                    
                    {/* 코 - 보통 */}
                    <line x1="100" y1="120" x2="100" y2="140" stroke="#d4a574" strokeWidth="2" />
                    
                    {/* 입 - 웃는 입 */}
                    <path d="M 70 160 Q 100 175 130 160" stroke="#333" strokeWidth="3" fill="none" />
                    
                    {/* 귀 - 큰 귀 */}
                    <ellipse cx="40" cy="120" rx="15" ry="25" fill="#ffd6a5" />
                    <ellipse cx="160" cy="120" rx="15" ry="25" fill="#ffd6a5" />
                  </svg>
                </div>
                <div className="face-features">
                  <div className="feature-tag">✅ 둥근 얼굴</div>
                  <div className="feature-tag">✅ 웃는 눈</div>
                  <div className="feature-tag">✅ 부드러운 인상</div>
                  <div className="feature-tag">✅ 큰 귓볼</div>
                </div>
              </div>

              <div className="relation-description">
                <p>{premiumAnalysis.relations.helpful}</p>
              </div>

              <div className="relation-advice">
                <strong>💡 만남의 조언:</strong>
                <p>이런 관상의 사람을 만나면 적극적으로 친분을 쌓으세요. 
                당신의 인생에 긍정적인 영향을 미칠 가능성이 높습니다.</p>
              </div>
            </div>

            {/* 악연 카드 */}
            <div className="relation-card harmful-card">
              <div className="relation-header">
                <div className="relation-badge harmful">⚠️ 악연</div>
                <h3>조심해야 할 사람</h3>
              </div>
              
              <div className="face-illustration">
                <div className="face-svg harmful-face">
                  {/* SVG 얼굴 일러스트 */}
                  <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
                    {/* 얼굴형 - 각진 */}
                    <polygon points="100,40 160,100 160,180 100,220 40,180 40,100" fill="#ffd6a5" />
                    
                    {/* 눈썹 - 날카로운 */}
                    <line x1="55" y1="100" x2="85" y2="95" stroke="#8b6f47" strokeWidth="3" />
                    <line x1="115" y1="95" x2="145" y2="100" stroke="#8b6f47" strokeWidth="3" />
                    
                    {/* 눈 - 날카로운 */}
                    <ellipse cx="70" cy="110" rx="12" ry="8" fill="#333" />
                    <ellipse cx="130" cy="110" rx="12" ry="8" fill="#333" />
                    
                    {/* 코 - 높고 날카로운 */}
                    <path d="M 100 115 L 95 140 L 100 145 L 105 140 Z" fill="#d4a574" />
                    
                    {/* 입 - 일자 또는 처진 */}
                    <line x1="75" y1="165" x2="125" y2="165" stroke="#333" strokeWidth="3" />
                    
                    {/* 귀 - 작은 귀 */}
                    <ellipse cx="45" cy="120" rx="10" ry="18" fill="#ffd6a5" />
                    <ellipse cx="155" cy="120" rx="10" ry="18" fill="#ffd6a5" />
                  </svg>
                </div>
                <div className="face-features">
                  <div className="feature-tag warning">⚠️ 각진 얼굴</div>
                  <div className="feature-tag warning">⚠️ 날카로운 눈</div>
                  <div className="feature-tag warning">⚠️ 강한 인상</div>
                  <div className="feature-tag warning">⚠️ 작은 귀</div>
                </div>
              </div>

              <div className="relation-description">
                <p>{premiumAnalysis.relations.harmful}</p>
              </div>

              <div className="relation-advice warning-advice">
                <strong>🚨 주의 사항:</strong>
                <p>이런 관상의 사람과는 신중하게 관계를 맺으세요. 
                불필요한 갈등이나 손해를 입을 수 있습니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="pdf-btn" onClick={handleDownloadPdf} disabled={isGeneratingPDF}>
          {isGeneratingPDF ? '생성 중...' : '📄 PDF 다운로드'}
        </button>
        <button className="share-btn" onClick={handleShare} disabled={isGeneratingShare}>
          {isGeneratingShare ? '생성 중...' : '📤 공유하기'}
        </button>
      </div>
    </div>
  );
}

function getBestFeature(features: PremiumAnalysisResult["features"]) {
  const entries = Object.entries(features) as Array<[string, { score: number }]>;
  const best = entries.reduce((max, curr) =>
    curr[1].score > max[1].score ? curr : max
  );
  return getFeatureName(best[0]);
}

function getBestScore(features: PremiumAnalysisResult["features"]) {
  const entries = Object.entries(features) as Array<[string, { score: number }]>;
  const best = entries.reduce((max, curr) =>
    curr[1].score > max[1].score ? curr : max
  );
  return best[1].score;
}

function getWorstFeature(features: PremiumAnalysisResult["features"]) {
  const entries = Object.entries(features) as Array<[string, { score: number }]>;
  const worst = entries.reduce((min, curr) =>
    curr[1].score < min[1].score ? curr : min
  );
  return getFeatureName(worst[0]);
}

function getWorstScore(features: PremiumAnalysisResult["features"]) {
  const entries = Object.entries(features) as Array<[string, { score: number }]>;
  const worst = entries.reduce((min, curr) =>
    curr[1].score < min[1].score ? curr : min
  );
  return worst[1].score;
}

function get2026MainFortune(saju: PremiumAnalysisResult["saju"]) {
  const fortunes = [
    { type: "연애운 상승", text: saju.love },
    { type: "재물운 상승", text: saju.money },
    { type: "건강운 호조", text: saju.health },
    { type: "직장운 대박", text: saju.career },
  ];

  const best = fortunes.reduce((max, curr) =>
    calculateFortuneScore(curr.text) > calculateFortuneScore(max.text) ? curr : max
  );

  return best.type;
}

function getFeatureName(key: string): string {
  const names: { [key: string]: string } = {
    forehead: "이마",
    eyes: "눈",
    nose: "코",
    mouth: "입",
    ears: "귀",
    chin: "턱",
    cheekbones: "광대",
    eyebrows: "눈썹",
    philtrum: "인중",
    face_shape: "얼굴형",
    hairline: "이마선",
    nasolabial_folds: "법령선",
  };
  return names[key] || key;
}

function getFeatureIcon(key: string): string {
  const icons: { [key: string]: string } = {
    forehead: "🧠",
    eyes: "👁️",
    nose: "👃",
    mouth: "👄",
    ears: "👂",
    chin: "🎭",
    cheekbones: "💎",
    eyebrows: "🌙",
    philtrum: "🎯",
    face_shape: "⭕",
    hairline: "💇",
    nasolabial_folds: "📏",
  };
  return icons[key] || "✨";
}

function getFeatureSubtitle(key: string): string {
  const subtitles: { [key: string]: string } = {
    forehead: "지혜와 명예운",
    eyes: "재물과 인간관계운",
    nose: "재물과 사업운",
    mouth: "복록과 자손운",
    ears: "수명과 조상복",
    chin: "만년운과 부하운",
    cheekbones: "권력과 실행력",
    eyebrows: "형제운과 사교운",
    philtrum: "자손운과 수명",
    face_shape: "전체 기운",
    hairline: "초년운",
    nasolabial_folds: "중년 이후 권위",
  };
  return subtitles[key] || "";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)";
  if (score >= 70) return "linear-gradient(90deg, #2196f3 0%, #03a9f4 100%)";
  if (score >= 50) return "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)";
  return "linear-gradient(90deg, #f44336 0%, #e91e63 100%)";
}

function calculateFortuneScore(text: string): number {
  const positiveWords = ["좋", "상승", "대박", "호조", "길", "만남", "기회", "성공"];
  const negativeWords = ["주의", "조심", "위험", "하락", "흉"];

  let score = 70;

  positiveWords.forEach((word) => {
    if (text.includes(word)) score += 5;
  });

  negativeWords.forEach((word) => {
    if (text.includes(word)) score -= 5;
  });

  return Math.min(Math.max(score, 50), 95);
}

function buildOverviewStory(analysis: PremiumAnalysisResult): string[] {
  const best = getBestFeature(analysis.features);
  const bestScore = getBestScore(analysis.features);
  const worst = getWorstFeature(analysis.features);
  const worstScore = getWorstScore(analysis.features);
  const mainFortune = get2026MainFortune(analysis.saju);

  return [
    `${analysis.face_type} 흐름의 핵심은 '강점이 분명하고 약점이 관리 가능한 구조'라는 점입니다. 전체 점수 ${analysis.overall_score}점은 단순히 운이 좋다는 뜻보다, 좋은 기회를 스스로 붙잡는 힘이 강하다는 의미에 가깝습니다.`,
    `특히 ${best}이(가) ${bestScore}점으로 가장 높게 나온 부분은 지금 시기에서 성과를 끌어올리는 엔진 역할을 합니다. 사람을 만나거나 결정을 내릴 때 이 강점을 기준으로 행동하면 시행착오를 크게 줄일 수 있습니다.`,
    `반대로 ${worst} ${worstScore}점 구간은 약점이라기보다 '관리 포인트'에 가깝습니다. 무리하게 단번에 바꾸기보다 루틴을 작게 쪼개서 꾸준히 보완하면 1~2개월 안에 체감 변화가 생길 수 있습니다.`,
    `2026년의 큰 방향은 ${mainFortune}입니다. 상반기는 기반 정리, 하반기는 확장 전략으로 가져가면 운의 탄력을 더 오래 유지하기 좋습니다.`,
  ];
}

function buildFeatureStory(
  key: string,
  feature: { score: number; title: string; description: string; advice: string },
  faceType: string
): string[] {
  const featureName = getFeatureName(key);
  const subtitle = getFeatureSubtitle(key);

  return [
    `${featureName}은(는) ${subtitle}와 직접 연결되는 포인트인데, 현재 ${feature.score}점이면 흐름이 꽤 탄탄한 편입니다. ${faceType} 타입의 기질과 합쳐지면 이 영역의 영향력이 실생활에서 더 선명하게 드러납니다.`,
    `${feature.description} 이 문장에 담긴 핵심은 '지금의 장점을 어떻게 실제 행동으로 전환하느냐'입니다. 같은 운이라도 실행 방식에 따라 결과 차이가 크게 벌어질 수 있으니, 주간 단위로 체크 포인트를 정해두는 것이 좋습니다.`,
    `실전에서는 ${featureName} 관련 습관을 작은 단위로 반복하는 전략이 가장 효율적입니다. ${feature.advice}처럼 부담이 적은 행동부터 시작하면, 운의 흐름이 안정적으로 길게 이어질 가능성이 높습니다.`,
  ];
}

function buildSajuDeepDives(
  saju: PremiumAnalysisResult["saju"],
  faceType: string
): Record<"love" | "money" | "health" | "career", string[]> {
  return {
    love: [
      `${saju.love} 이 흐름은 감정 기복을 줄이고 관계의 밀도를 높이는 시그널입니다. ${faceType} 기질에서는 '빠른 확신'보다 '천천히 검증하는 태도'가 오히려 더 좋은 인연을 끌어옵니다.`,
      `연애운을 키우고 싶다면 대화의 빈도보다 대화의 질에 집중하세요. 짧더라도 진심이 담긴 피드백을 반복하면 관계가 예상보다 빠르게 깊어집니다.`,
    ],
    money: [
      `${saju.money} 재물운은 크게 벌기보다 새는 돈을 막는 구간에서 먼저 상승합니다. 지출 카테고리를 3개로 압축해서 관리하면 체감 수익률이 올라가는 패턴이 강합니다.`,
      `특히 충동 지출을 줄이는 작은 규칙(예: 24시간 보류)을 두면 운의 변동성을 크게 줄일 수 있습니다. 하반기에는 수익 다각화 기회가 들어오니, 지금은 준비 구간으로 보시면 좋습니다.`,
    ],
    health: [
      `${saju.health} 건강운은 '한 번에 무리'보다 '지속 가능한 리듬'이 핵심입니다. 수면, 수분, 가벼운 유산소 3가지만 고정해도 컨디션의 바닥 구간을 줄일 수 있습니다.`,
      `컨디션이 좋아지는 시기에는 과신해서 루틴을 깨기 쉬우니, 오히려 기본 루틴을 더 단순하게 유지하는 전략이 장기적으로 유리합니다.`,
    ],
    career: [
      `${saju.career} 직장운은 '보여지는 성과'와 '신뢰 자산'을 동시에 쌓을 때 가장 크게 열립니다. 눈에 보이는 결과물 1개와 협업 신뢰 1개를 매주 확보한다는 느낌으로 접근해 보세요.`,
      `당장 큰 변화가 없어 보여도, 이 시기에는 평판과 레퍼런스가 누적되는 속도가 빠릅니다. 분기 단위로 목표를 수치화하면 승진/이직/프로젝트 확장 타이밍을 잡기 훨씬 쉬워집니다.`,
    ],
  };
}

function buildTarotDeepDives(
  tarot: PremiumAnalysisResult["tarot"],
  faceType: string
): Record<"present" | "future" | "action", string[]> {
  return {
    present: [
      `${tarot.present} 지금은 바깥 성과보다 내적 정렬이 중요한 국면입니다. ${faceType} 기운에서는 선택지를 늘리는 것보다 핵심 1~2개를 선명하게 고르는 편이 훨씬 빠르게 결과를 만듭니다.`,
      `현재 카드는 '기반 재정비 후 점프'를 권합니다. 과감한 시작보다, 반복 가능한 루틴을 먼저 완성하면 다음 카드의 상승 흐름을 제대로 받게 됩니다.`,
    ],
    future: [
      `${tarot.future} 가까운 미래 카드의 메시지는 기회 자체보다 '기회를 읽는 속도'에 초점이 있습니다. 제안이나 변화 신호가 들어오면 완벽을 기다리기보다 작은 실행으로 먼저 검증해보는 것이 유리합니다.`,
      `미래 흐름은 분명 긍정적이지만, 우선순위가 흐려지면 성과가 분산될 수 있습니다. 해야 할 일보다 하지 않을 일을 먼저 정하는 태도가 성패를 가릅니다.`,
    ],
    action: [
      `${tarot.action} 실행 카드는 행동의 디테일을 요구합니다. 목표를 월간이 아닌 주간 단위로 쪼개고, 매주 '완료 증거'를 남기는 방식으로 운의 탄력을 현실 성과로 바꾸세요.`,
      `또한 결정이 늦어질수록 에너지가 새기 쉬운 시기입니다. 70% 확신이 생기면 일단 시작하고, 진행하면서 보정하는 전략이 현재 운의 결을 가장 잘 타는 방식입니다.`,
    ],
  };
}
