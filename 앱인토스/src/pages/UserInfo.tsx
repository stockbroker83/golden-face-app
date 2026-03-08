import { useState } from "react";
import { UserData } from "../types";
import "../styles/UserInfo.css";

interface Props {
  onSubmit: (data: UserData) => void;
}

export default function UserInfo({ onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthTime, setBirthTime] = useState("");
  const [lunar, setLunar] = useState(false);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      onSubmit({
        name: name || undefined,
        birth_date: birthDate,
        birth_time: birthTime || undefined,
        gender,
        lunar,
      });
    }
  };

  const isStepValid = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return year && month && day;
    if (step === 3) return gender;
    return true; // Step 4는 선택사항
  };

  return (
    <div className="user-info-flow">
      {/* 진행바 */}
      <div className="flow-progress">
        <div className="progress-bar-wrapper">
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <p className="progress-text">STEP {step} / 4</p>
      </div>

      {/* Step 1: 이름 */}
      {step === 1 && (
        <div className="flow-step fade-in">
          <div className="step-icon">👋</div>
          <h2 className="step-title">안녕하세요!</h2>
          <p className="step-subtitle">
            당신의 운명을 분석하기 위해<br />
            <strong className="highlight">이름</strong>을 알려주세요
          </p>
          <input
            type="text"
            className="flow-input"
            placeholder="예: 홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="input-hint">
            💡 본명을 입력하시면 더 정확한 분석이 가능해요
          </div>
        </div>
      )}

      {/* Step 2: 생년월일 */}
      {step === 2 && (
        <div className="flow-step fade-in">
          <div className="step-icon">📅</div>
          <h2 className="step-title">{name}님의 생일은?</h2>
          <p className="step-subtitle">
            사주팔자 분석을 위해 필요해요
          </p>
          <div className="date-inputs">
            <input
              type="number"
              className="flow-input date-input"
              placeholder="1990"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              autoFocus
            />
            <span className="date-separator">년</span>
            <input
              type="number"
              className="flow-input date-input"
              placeholder="1"
              maxLength={2}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <span className="date-separator">월</span>
            <input
              type="number"
              className="flow-input date-input"
              placeholder="1"
              maxLength={2}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
            <span className="date-separator">일</span>
          </div>
          <label className="lunar-checkbox">
            <input
              type="checkbox"
              checked={lunar}
              onChange={(e) => setLunar(e.target.checked)}
            />
            <span>음력 기준</span>
          </label>
          <div className="input-hint">
            🌙 음력이신가요? 양력으로 변환해서 입력해주세요
          </div>
        </div>
      )}

      {/* Step 3: 성별 */}
      {step === 3 && (
        <div className="flow-step fade-in">
          <div className="step-icon">🚻</div>
          <h2 className="step-title">성별을 선택해주세요</h2>
          <p className="step-subtitle">
            음양오행 분석에 필요해요
          </p>
          <div className="gender-buttons">
            <button
              className={`gender-btn ${gender === "male" ? "selected" : ""}`}
              onClick={() => setGender("male")}
            >
              <span className="gender-icon">♂️</span>
              <span className="gender-text">남성</span>
            </button>
            <button
              className={`gender-btn ${gender === "female" ? "selected" : ""}`}
              onClick={() => setGender("female")}
            >
              <span className="gender-icon">♀️</span>
              <span className="gender-text">여성</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 생시 (선택) */}
      {step === 4 && (
        <div className="flow-step fade-in">
          <div className="step-icon">⏰</div>
          <h2 className="step-title">태어난 시간을 아시나요?</h2>
          <p className="step-subtitle">
            알면 <strong className="highlight">더 정확한</strong> 사주 분석이 가능해요
          </p>
          <select
            className="flow-input"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          >
            <option value="">모르겠어요 (선택 안함)</option>
            <option value="23:30-01:29">자시 (23:30~01:29)</option>
            <option value="01:30-03:29">축시 (01:30~03:29)</option>
            <option value="03:30-05:29">인시 (03:30~05:29)</option>
            <option value="05:30-07:29">묘시 (05:30~07:29)</option>
            <option value="07:30-09:29">진시 (07:30~09:29)</option>
            <option value="09:30-11:29">사시 (09:30~11:29)</option>
            <option value="11:30-13:29">오시 (11:30~13:29)</option>
            <option value="13:30-15:29">미시 (13:30~15:29)</option>
            <option value="15:30-17:29">신시 (15:30~17:29)</option>
            <option value="17:30-19:29">유시 (17:30~19:29)</option>
            <option value="19:30-21:29">술시 (19:30~21:29)</option>
            <option value="21:30-23:29">해시 (21:30~23:29)</option>
          </select>
          <div className="input-hint">
            ⚡ 생시를 모르셔도 90% 정확도로 분석 가능해요
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flow-actions">
        {step > 1 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            ← 이전
          </button>
        )}
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {step === 4 ? "분석 시작 →" : "다음 →"}
        </button>
      </div>

      {/* 배경 파티클 */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
