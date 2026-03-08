import { useState } from "react";
import { UserData, PsychTestResult, PsychTestQuestion, PointsData } from "../types";
import { analyzePsychTest } from "../services/gemini";
import { canUseFeature, useFeature, savePoints, getRemainingUses } from "../utils/pointsManager";
import "../styles/PsychologyTest.css";

interface Props {
  userData: UserData;
  points: PointsData;
  isPaid: boolean;
  onResult: (result: PsychTestResult) => void;
  onBack: () => void;
  onUpdatePoints: (points: PointsData) => void;
}

const QUESTIONS: PsychTestQuestion[] = [
  {
    id: 1,
    question: "주말 아침, 눈을 떴을 때 가장 먼저 하고 싶은 것은?",
    emoji: "🌅",
    options: [
      { text: "창문을 열고 깊은 심호흡", value: "wood" },
      { text: "좋아하는 음악 틀고 스트레칭", value: "fire" },
      { text: "따뜻한 이불 속에서 10분 더", value: "earth" },
      { text: "바로 일어나서 계획한 일 시작", value: "metal" },
    ],
  },
  {
    id: 2,
    question: "친구가 갑자기 고민 상담을 요청했다면?",
    emoji: "💬",
    options: [
      { text: "일단 끝까지 들어준다", value: "water" },
      { text: "해결책을 바로 제시한다", value: "metal" },
      { text: "같이 감정을 공감하며 울어준다", value: "fire" },
      { text: "맛있는 것 먹으면서 이야기하자고 한다", value: "earth" },
    ],
  },
  {
    id: 3,
    question: "가장 끌리는 여행 스타일은?",
    emoji: "✈️",
    options: [
      { text: "자연 속 힐링 여행", value: "wood" },
      { text: "핫플레이스 투어", value: "fire" },
      { text: "맛집 중심 미식 여행", value: "earth" },
      { text: "역사/문화 탐방", value: "water" },
    ],
  },
  {
    id: 4,
    question: "스트레스를 받으면 주로 어떻게 풀어요?",
    emoji: "😤",
    options: [
      { text: "산책하거나 운동한다", value: "wood" },
      { text: "사람들과 어울리며 수다 떤다", value: "fire" },
      { text: "좋아하는 음식을 먹는다", value: "earth" },
      { text: "혼자만의 시간을 가진다", value: "water" },
    ],
  },
  {
    id: 5,
    question: "내가 가장 중요하게 생각하는 가치는?",
    emoji: "⭐",
    options: [
      { text: "성장과 발전", value: "wood" },
      { text: "즐거움과 열정", value: "fire" },
      { text: "안정과 조화", value: "earth" },
      { text: "원칙과 완벽함", value: "metal" },
    ],
  },
  {
    id: 6,
    question: "팀 프로젝트에서 나의 역할은?",
    emoji: "👥",
    options: [
      { text: "아이디어를 내는 기획자", value: "wood" },
      { text: "분위기를 이끄는 리더", value: "fire" },
      { text: "중재하고 조율하는 조정자", value: "earth" },
      { text: "꼼꼼하게 마무리하는 실행자", value: "metal" },
    ],
  },
  {
    id: 7,
    question: "이상적인 연인의 조건은?",
    emoji: "💕",
    options: [
      { text: "함께 성장할 수 있는 사람", value: "wood" },
      { text: "매일이 설레는 재미있는 사람", value: "fire" },
      { text: "편안하고 따뜻한 사람", value: "earth" },
      { text: "깊이있고 신비로운 사람", value: "water" },
    ],
  },
];

export default function PsychologyTest({ userData, points, isPaid, onResult, onBack, onUpdatePoints }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const remainingUses = getRemainingUses(points, "psych_test");
  const costInfo = { cost: 50, remaining: remainingUses };

  const handleSelect = async (value: string, optionIdx: number) => {
    if (currentQ === 0 && answers.length === 0 && !isPaid) {
      const check = canUseFeature(points, "psych_test", false);
      if (!check.allowed) {
        setError(check.reason || "심리테스트를 시작할 수 없습니다.");
        return;
      }

      const updatedPoints = useFeature(points, "psych_test", false);
      if (!updatedPoints) {
        setError("포인트 차감에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      savePoints(updatedPoints);
      onUpdatePoints(updatedPoints);
    }

    setSelectedOption(optionIdx);

    setTimeout(async () => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        // 마지막 질문 - 결과 분석
        setLoading(true);
        try {
          const result = await analyzePsychTest(userData, newAnswers);
          onResult(result);
        } catch (err) {
          console.error("심리테스트 분석 실패:", err);
        } finally {
          setLoading(false);
        }
      }
    }, 400);
  };

  if (loading) {
    return (
      <div className="psych-page">
        <div className="psych-loading">
          <div className="brain-pulse">🧠</div>
          <h2>당신의 사주 성격을 분석 중...</h2>
          <p>오행(五行) 기반으로 성격 유형을 도출하고 있어요</p>
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="psych-page">
        <div className="psych-loading" style={{ gap: "1rem" }}>
          <div className="brain-pulse">⚠️</div>
          <h2>심리테스트를 시작할 수 없어요</h2>
          <p>{error}</p>
          {!isPaid && (
            <div style={{
              background: "rgba(102,126,234,0.12)",
              border: "1px solid rgba(102,126,234,0.35)",
              borderRadius: "12px",
              padding: "12px 14px",
              width: "100%",
              maxWidth: "340px",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>필요 복주머니</span>
                <strong>🏮 {costInfo.cost}개</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>보유 복주머니</span>
                <strong>🏮 {points.total_points}개</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>오늘 남은 횟수</span>
                <strong>{costInfo.remaining}/5회</strong>
              </div>
            </div>
          )}
          <button className="back-btn" onClick={onBack}>← 뒤로</button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="psych-page">
      <header className="psych-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="q-count">{currentQ + 1}/{QUESTIONS.length}</span>
      </header>

      {!isPaid && (
        <div style={{
          margin: "0 1.2rem 1rem",
          background: "rgba(102,126,234,0.08)",
          border: "1px solid rgba(102,126,234,0.25)",
          borderRadius: "12px",
          padding: "0.65rem 0.8rem",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.82rem",
          color: "rgba(240,236,228,0.9)"
        }}>
          <span>이용비용: 🏮 50개</span>
          <span>오늘 남은 횟수: {costInfo.remaining}/5회</span>
        </div>
      )}

      <div className="question-area" key={currentQ}>
        <span className="q-emoji">{q.emoji}</span>
        <h2 className="q-text">{q.question}</h2>

        <div className="options-list">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedOption === idx ? "selected" : ""}`}
              onClick={() => handleSelect(opt.value, idx)}
              disabled={selectedOption !== null}
            >
              <span className="option-text">{opt.text}</span>
              <span className="option-check">✓</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
