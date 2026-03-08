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

type TabType = "face" | "saju" | "tarot" | "jeom" | "relations";

export default function PremiumResult({ premiumAnalysis, imageFile, userData, onBack }: PremiumResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>("face");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const imageUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);
  const featureEntries = useMemo(
    () => Object.entries(premiumAnalysis.features) as Array<[string, { score: number; title: string; description: string; advice: string }]>,
    [premiumAnalysis.features]
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
        <button className={activeTab === "face" ? "active" : ""} onClick={() => setActiveTab("face")}>관상 12가지</button>
        <button className={activeTab === "saju" ? "active" : ""} onClick={() => setActiveTab("saju")}>사주 4대운</button>
        <button className={activeTab === "tarot" ? "active" : ""} onClick={() => setActiveTab("tarot")}>타로 조언</button>
        <button className={activeTab === "jeom" ? "active" : ""} onClick={() => setActiveTab("jeom")}>주역점</button>
        <button className={activeTab === "relations" ? "active" : ""} onClick={() => setActiveTab("relations")}>귀인/악연</button>
      </div>

      <div className="tab-content">
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

            {featureEntries.map(([key, feature], idx) => (
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

                  <div className="feature-advice">
                    <div className="advice-header">
                      <span className="advice-icon">💡</span>
                      <strong>개선 조언</strong>
                    </div>
                    <p>{feature.advice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
