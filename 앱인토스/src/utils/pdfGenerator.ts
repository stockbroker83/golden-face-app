import type { PremiumAnalysisResult, UserData } from '../types';

export async function generatePDF(
  premiumAnalysis: PremiumAnalysisResult,
  userData: UserData,
  imageFile: string
): Promise<Blob> {
  const { default: html2pdf } = await import('html2pdf.js');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
        
        body { 
          font-family: 'Noto Sans KR', sans-serif; 
          padding: 40px; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          padding-bottom: 30px;
          border-bottom: 3px solid #667eea;
        }
        .profile-img { 
          width: 150px; 
          height: 150px; 
          border-radius: 50%; 
          object-fit: cover;
          border: 5px solid #667eea;
        }
        .score { 
          font-size: 48px; 
          color: #667eea; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .section { 
          margin: 30px 0; 
          page-break-inside: avoid; 
        }
        .section-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }
        .feature-card { 
          background: #f9f9f9; 
          padding: 20px; 
          margin: 15px 0; 
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }
        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .feature-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .feature-score {
          font-size: 20px;
          color: #667eea;
          font-weight: bold;
        }
        .score-bar { 
          height: 10px; 
          background: #e0e0e0; 
          border-radius: 5px; 
          overflow: hidden;
          margin: 10px 0;
        }
        .score-fill { 
          height: 100%; 
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
        }
        .description {
          color: #555;
          margin: 10px 0;
        }
        .advice {
          background: #fff4e5;
          border-left: 3px solid #ff9800;
          padding: 10px 15px;
          margin-top: 10px;
          border-radius: 5px;
        }
        footer { 
          text-align: center; 
          margin-top: 60px; 
          padding-top: 30px;
          border-top: 2px solid #e0e0e0;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${imageFile}" class="profile-img" alt="프로필" />
        <h1>🌟 금빛관상 프리미엄 리포트</h1>
        <div class="score">${premiumAnalysis.overall_score}점</div>
        <p style="font-size: 20px; color: #667eea; font-weight: bold;">${premiumAnalysis.face_type}</p>
        <p style="color: #999;">생년월일: ${userData.birth_date} | 성별: ${userData.gender === 'male' ? '남성' : '여성'}</p>
      </div>

      <div class="section">
        <h2 class="section-title">📊 관상 12가지 종합 분석</h2>
        ${Object.entries(premiumAnalysis.features).map(([key, feature]) => `
          <div class="feature-card">
            <div class="feature-header">
              <div class="feature-title">${getFeatureName(key)}</div>
              <div class="feature-score">${feature.score}점</div>
            </div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${feature.score}%"></div>
            </div>
            <h4>${feature.title}</h4>
            <p class="description">${feature.description}</p>
            <div class="advice">
              <strong>💡 개선 조언:</strong><br/>
              ${feature.advice}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">🔮 사주 4대운 (2026년)</h2>
        <div class="feature-card">
          <h3>💘 연애운</h3>
          <p>${premiumAnalysis.saju.love}</p>
        </div>
        <div class="feature-card">
          <h3>💰 재물운</h3>
          <p>${premiumAnalysis.saju.money}</p>
        </div>
        <div class="feature-card">
          <h3>🏥 건강운</h3>
          <p>${premiumAnalysis.saju.health}</p>
        </div>
        <div class="feature-card">
          <h3>💼 직장운</h3>
          <p>${premiumAnalysis.saju.career}</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">🃏 타로 조언</h2>
        <div class="feature-card">
          <h3>🔮 현재 상황</h3>
          <p>${premiumAnalysis.tarot.present}</p>
        </div>
        <div class="feature-card">
          <h3>✨ 미래 예측</h3>
          <p>${premiumAnalysis.tarot.future}</p>
        </div>
        <div class="feature-card">
          <h3>💫 행동 조언</h3>
          <p>${premiumAnalysis.tarot.action}</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">👥 귀인/악연 관상</h2>
        <div class="feature-card">
          <h3>✅ 귀인 (도움을 줄 사람)</h3>
          <p>${premiumAnalysis.relations.helpful}</p>
        </div>
        <div class="feature-card">
          <h3>⚠️ 악연 (조심해야 할 사람)</h3>
          <p>${premiumAnalysis.relations.harmful}</p>
        </div>
      </div>

      <footer>
        <p><strong>© 2026 금빛관상 - 당신의 운명을 밝히다</strong></p>
        <p>본 리포트는 AI 기반 분석 결과이며, 참고용으로만 활용하시기 바랍니다.</p>
        <p>문의: support@goldface.com</p>
      </footer>
    </body>
    </html>
  `;

  const options = {
    margin: 10,
    filename: `금빛관상_${userData.birth_date}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };

  return await html2pdf().set(options).from(htmlContent).outputPdf('blob');
}

function getFeatureName(key: string): string {
  const names: { [key: string]: string } = {
    forehead: '이마 (額相)',
    eyes: '눈 (眼相)',
    nose: '코 (鼻相)',
    mouth: '입 (口相)',
    ears: '귀 (耳相)',
    chin: '턱 (頤相)',
    cheekbones: '광대 (顴骨)',
    eyebrows: '눈썹 (眉相)',
    philtrum: '인중 (人中)',
    face_shape: '얼굴형 (面形)',
    hairline: '이마선 (髮際)',
    nasolabial_folds: '법령선 (法令紋)',
  };
  return names[key] || key;
}
