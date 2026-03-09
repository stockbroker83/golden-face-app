import { useEffect, useState } from "react";
import { analyzeFaceFree } from "../services/gemini";
import { FaceAnalysisResult, UserData } from "../types";
import { canUseAI, incrementMonthlyUsage } from "../utils/monthlyUsageManager";
import "../styles/FaceAnalyzing.css";

type FaceAnalyzingProps = {
  imageFile: File;
  userData: UserData | null;
  onComplete: (result: FaceAnalysisResult) => void;
};

export default function FaceAnalyzing({ imageFile, userData, onComplete }: FaceAnalyzingProps) {
  const [error, setError] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const progressInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 1200);

    const run = async () => {
      try {
        if (!userData) {
          throw new Error("사용자 정보가 없습니다.");
        }

        if (!canUseAI()) {
          throw new Error("이번 달 AI 분석 횟수를 모두 사용했습니다. (월 150회 제한)");
        }

        const [result] = await Promise.all([
          analyzeFaceFree(imageFile, userData),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);

        incrementMonthlyUsage();

        if (mounted) onComplete(result);
      } catch (e) {
        if (mounted) setError("분석에 실패했습니다. 다시 시도해주세요.");
        console.error(e);
      }
    };

    run();

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, [imageFile, userData, onComplete]);

  return (
    <div className="face-analyzing-page">
      <div className="analyzing-content">
        <div className="magic-circle" />
        <h1 className="analyzing-title">🔮 AI 분석 중...</h1>
        <p className="analyzing-subtitle">얼굴 5가지 핵심 포인트를 정밀하게 읽는 중입니다</p>

        <div className="progress-messages">
          {[
            "이마(額相) 지혜운 분석 중...",
            "눈(眼相) 재물·관계운 분석 중...",
            "코·입·귀 복록 흐름 계산 중...",
            "무료 리포트 요약 생성 중...",
          ].map((message, index) => (
            <p key={message} className={`message ${activeIndex === index ? "active" : ""}`}>
              {message}
            </p>
          ))}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
        <p className="wait-text">잠시만 기다려 주세요... (약 5초)</p>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
