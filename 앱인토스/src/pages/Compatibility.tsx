import { useState } from "react";
import { UserData, CompatibilityResult, PointsData } from "../types";
import { analyzeCompatibility } from "../services/gemini";
import { canUseFeature, useFeature, savePoints, getRemainingUses } from "../utils/pointsManager";
import "../styles/Compatibility.css";

interface Props {
  myData: UserData;
  points: PointsData;
  isPaid: boolean;
  onResult: (result: CompatibilityResult, partner: UserData) => void;
  onBack: () => void;
  onUpdatePoints: (points: PointsData) => void;
}

export default function Compatibility({ myData, points, isPaid, onResult, onBack, onUpdatePoints }: Props) {
  const [partnerData, setPartnerData] = useState<Partial<UserData>>({
    birth_date: "",
    gender: myData.gender === "male" ? "female" : "male",
    lunar: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const remainingUses = getRemainingUses(points, "compatibility");
  const costInfo = { cost: 100, remaining: remainingUses };

  const handleSubmit = async () => {
    if (!partnerData.birth_date) {
      setError("상대방 생년월일을 입력해주세요");
      return;
    }

    // 포인트 체크
    const check = canUseFeature(points, "compatibility", isPaid);
    if (!check.allowed) {
      setError(check.reason || "사용할 수 없습니다.");
      return;
    }

    // 포인트 차감 (프리미엄은 제외)
    if (!isPaid) {
      const updatedPoints = useFeature(points, "compatibility", false);
      if (!updatedPoints) {
        setError("포인트 차감에 실패했습니다.");
        return;
      }
      savePoints(updatedPoints);
      onUpdatePoints(updatedPoints);
    }

    setLoading(true);
    setError("");

    try {
      const partner: UserData = {
        birth_date: partnerData.birth_date!,
        gender: partnerData.gender as "male" | "female",
        lunar: partnerData.lunar || false,
      };
      const result = await analyzeCompatibility(myData, partner);
      onResult(result, partner);
    } catch (err) {
      setError("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="compat-page">
        <div className="compat-loading">
          <div className="hearts-animation">
            <span className="heart h1">💜</span>
            <span className="heart h2">💛</span>
            <span className="heart h3">💕</span>
          </div>
          <h2>두 분의 궁합을 분석하고 있어요</h2>
          <p>사주와 관상 기운을 비교 중...</p>
          {!isPaid && <span className="cost-badge">🏮 -100 복주머니</span>}
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compat-page">
      <header className="compat-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>💕 궁합 분석</h1>
      </header>

      <div className="compat-intro">
        <div className="compat-vs">
          <div className="person-card me">
            <span className="person-emoji">{myData.gender === "male" ? "🙎‍♂️" : "🙎‍♀️"}</span>
            <strong>나</strong>
            <span className="person-birth">{myData.birth_date}</span>
          </div>
          <div className="vs-icon">
            <span>💕</span>
          </div>
          <div className="person-card partner">
            <span className="person-emoji">{partnerData.gender === "male" ? "🙎‍♂️" : "🙎‍♀️"}</span>
            <strong>상대방</strong>
            <span className="person-birth">{partnerData.birth_date || "?"}</span>
          </div>
        </div>
      </div>

      <div className="compat-form">
        <h2>상대방 정보 입력</h2>

        {/* 비용 정보 */}
        {!isPaid && (
          <div className="cost-display">
            <div className="cost-item">
              <span>필요한 복주머니</span>
              <strong>🏮 {costInfo.cost}개</strong>
            </div>
            <div className="cost-item">
              <span>보유 복주머니</span>
              <strong style={{ color: points.total_points >= costInfo.cost ? "#10b981" : "#ef4444" }}>
                🏮 {points.total_points}개
              </strong>
            </div>
            <div className="cost-item">
              <span>오늘 남은 횟수</span>
              <strong>{costInfo.remaining}/3회</strong>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>생년월일</label>
          <input
            type="date"
            value={partnerData.birth_date}
            onChange={(e) => setPartnerData({ ...partnerData, birth_date: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>성별</label>
          <div className="gender-toggle">
            <button
              className={partnerData.gender === "male" ? "active" : ""}
              onClick={() => setPartnerData({ ...partnerData, gender: "male" })}
            >
              🙎‍♂️ 남성
            </button>
            <button
              className={partnerData.gender === "female" ? "active" : ""}
              onClick={() => setPartnerData({ ...partnerData, gender: "female" })}
            >
              🙎‍♀️ 여성
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>양/음력</label>
          <div className="gender-toggle">
            <button
              className={!partnerData.lunar ? "active" : ""}
              onClick={() => setPartnerData({ ...partnerData, lunar: false })}
            >
              ☀️ 양력
            </button>
            <button
              className={partnerData.lunar ? "active" : ""}
              onClick={() => setPartnerData({ ...partnerData, lunar: true })}
            >
              🌙 음력
            </button>
          </div>
        </div>

        {error && <p className="form-error">⚠️ {error}</p>}

        <button className="compat-submit" onClick={handleSubmit}>
          궁합 분석하기
        </button>
      </div>
    </div>
  );
}
