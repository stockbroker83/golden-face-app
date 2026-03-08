import { useState, useEffect } from "react";
import WelcomeScreen from "./pages/WelcomeScreen";
import UserInfo from "./pages/UserInfo";
import HomeHub from "./pages/HomeHub";
import FaceUpload from "./pages/FaceUpload";
import FaceAnalyzing from "./pages/FaceAnalyzing";
import FreeResult from "./pages/FreeResult";
import Payment from "./pages/Payment";
import PremiumAnalyzing from "./pages/PremiumAnalyzing";
import PremiumResult from "./pages/PremiumResult";
import DailyFortune from "./pages/DailyFortune";
import Compatibility from "./pages/Compatibility";
import CompatibilityResultPage from "./pages/CompatibilityResultPage";
import PsychologyTest from "./pages/PsychologyTest";
import PsychTestResultPage from "./pages/PsychTestResultPage";
import PointsPage from "./pages/PointsPage";
import LuckyNumbers from "./pages/LuckyNumbers";
import DigitalCharm from "./pages/DigitalCharm";
import WishWall from "./pages/WishWall";
import TojeongBigyeol from "./pages/TojeongBigyeol";
import DreamInterpretation from "./pages/DreamInterpretation";
import LuckyStyle from "./pages/LuckyStyle";
import Saju from "./pages/Saju";
import SajuCompatibility from "./pages/SajuCompatibility";
import {
  AppState,
  AppStep,
  FaceData,
  UserData,
  PointsData,
  DailyFortuneResult,
  CompatibilityResult,
  PsychTestResult,
} from "./types";
import { analyzeFacePremium } from "./services/gemini";
import { loadPoints, savePoints, addPoints, addStreak, deductPoints } from "./utils/pointsManager";
import { requestNotificationPermission } from "./utils/notificationManager";
import "./App.css";

const DEFAULT_POINTS: PointsData = {
  total_points: 0,
  today_earned: 0,
  streak_days: 0,
  last_daily_claim: "",
  history: [],
  daily_usage: {
    date: "",
    daily_fortune: 0,
    compatibility: 0,
    psych_test: 0,
    saju: 0,
    tarot_chat: 0,
    face_reading_12: 0,
  },
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    user_data: null,
    face_data: null,
    is_paid: false,
    current_step: "notice",
    daily_fortune: null,
    compatibility: null,
    compatibility_partner: null,
    psych_test_result: null,
    points: DEFAULT_POINTS,
  });

  // 앱 초기화: 저장된 유저 데이터 & 포인트 복구
  useEffect(() => {
    const savedUser = localStorage.getItem("golden_face_user");
    const savedPoints = loadPoints();
    const savedVip = localStorage.getItem("golden_face_vip");

    let isPaid = false;
    if (savedVip) {
      try {
        isPaid = Boolean(JSON.parse(savedVip)?.is_vip);
      } catch {}
    }

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as UserData;
        setAppState((prev) => ({
          ...prev,
          user_data: userData,
          points: savedPoints || DEFAULT_POINTS,
          is_paid: isPaid,
          current_step: "hub", // 기존 유저는 바로 허브로
        }));
      } catch {}
    }
  }, []);

  const updateUserData = (data: UserData) => {
    localStorage.setItem("golden_face_user", JSON.stringify(data));
    setAppState((prev) => ({
      ...prev,
      user_data: data,
      current_step: "hub", // 허브로 이동 (기존: upload)
    }));
  };

  const updateFaceData = (data: FaceData) => {
    setAppState((prev) => ({
      ...prev,
      face_data: { ...prev.face_data, ...data },
    }));
  };

  const goToStep = (step: AppStep) => {
    setAppState((prev) => ({ ...prev, current_step: step }));
  };

  const handlePaymentComplete = () => {
    setAppState((prev) => ({
      ...prev,
      is_paid: true,
      current_step: "premium_analyzing",
    }));
  };

  const handlePremiumAnalyzingComplete = async () => {
    if (!appState.face_data?.image_file || !appState.user_data) {
      goToStep("free");
      return;
    }
    const premiumAnalysis = await analyzeFacePremium(
      appState.face_data.image_file,
      appState.user_data
    );
    updateFaceData({ premium_analysis: premiumAnalysis });
    goToStep("premium");
  };

  // 포인트 적립 핸들러
  const earnPoints = (amount: number, action: string, emoji: string) => {
    const updated = addPoints(appState.points, amount, action, emoji);
    savePoints(updated);
    setAppState((prev) => ({ ...prev, points: updated }));
  };

  const spendPoints = (amount: number, action: string, emoji: string): boolean => {
    const updated = deductPoints(appState.points, amount, action, emoji);
    if (!updated) {
      return false;
    }
    savePoints(updated);
    setAppState((prev) => ({ ...prev, points: updated }));
    return true;
  };

  const handleClaimDaily = () => {
    const streakResult = addStreak(appState.points);
    savePoints(streakResult.updated);
    setAppState((prev) => ({ ...prev, points: streakResult.updated }));

    if (streakResult.bonusPoints > 0) {
      alert(`🎁 연속 출석 보너스 +${streakResult.bonusPoints}P`);
    }
    if (streakResult.unlockedPremium) {
      alert("🏆 30일 연속 출석 달성! 프리미엄이 무료로 열렸습니다.");
      setAppState((prev) => ({ ...prev, is_paid: true }));
    }
  };

  // 데일리 관상 결과 저장
  const handleDailyResult = (result: DailyFortuneResult) => {
    setAppState((prev) => ({ ...prev, daily_fortune: result }));
  };

  // 궁합 결과 저장
  const handleCompatibilityResult = (
    result: CompatibilityResult,
    partner: UserData
  ) => {
    setAppState((prev) => ({
      ...prev,
      compatibility: result,
      compatibility_partner: partner,
      current_step: "compatibility_result",
    }));
  };

  // 심리테스트 결과 저장
  const handlePsychResult = (result: PsychTestResult) => {
    setAppState((prev) => ({
      ...prev,
      psych_test_result: result,
      current_step: "psychtest_result",
    }));
  };

  return (
    <div className="app-container">
      {/* ── 온보딩 ── */}
      {appState.current_step === "notice" && (
        <WelcomeScreen onStart={() => goToStep("userinfo")} />
      )}

      {appState.current_step === "userinfo" && (
        <UserInfo onSubmit={updateUserData} />
      )}

      {/* ── 메인 허브 (점신 스타일) ── */}
      {appState.current_step === "hub" && appState.user_data && (
        <HomeHub
          userData={appState.user_data}
          points={appState.points}
          isPaid={appState.is_paid}
          onNavigate={goToStep}
          onClaimDaily={handleClaimDaily}
        />
      )}

      {/* ── 관상 분석 (기존 플로우) ── */}
      {appState.current_step === "upload" && (
        <FaceUpload
          onUpload={(file) => {
            updateFaceData({ image_file: file });
            goToStep("analyzing");
          }}
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "analyzing" &&
        appState.face_data?.image_file && (
          <FaceAnalyzing
            imageFile={appState.face_data.image_file}
            userData={appState.user_data}
            onComplete={(result) => {
              updateFaceData({ ...appState.face_data, free_analysis: result });
              goToStep("free");
              earnPoints(10, "관상 분석 완료", "👁️");
              requestNotificationPermission();
            }}
          />
        )}

      {appState.current_step === "free" &&
        appState.face_data?.free_analysis &&
        appState.face_data?.image_file && (
          <FreeResult
            analysis={appState.face_data.free_analysis}
            imageFile={appState.face_data.image_file}
            onUpgrade={() => goToStep("payment")}
            onBack={() => goToStep("hub")}
          />
        )}

      {appState.current_step === "payment" && (
        <Payment
          onPaymentSuccess={handlePaymentComplete}
          onBack={() => goToStep("free")}
        />
      )}

      {appState.current_step === "premium_analyzing" && (
        <PremiumAnalyzing onComplete={handlePremiumAnalyzingComplete} />
      )}

      {appState.current_step === "premium" &&
        appState.user_data &&
        appState.face_data?.premium_analysis &&
        appState.face_data?.image_file && (
          <PremiumResult
            userData={appState.user_data}
            premiumAnalysis={appState.face_data.premium_analysis}
            imageFile={appState.face_data.image_file}
            onBack={() => goToStep("hub")}
          />
        )}

      {/* ── 오늘의 관상 (NEW) ── */}
      {appState.current_step === "daily" && appState.user_data && (
        <DailyFortune
          userData={appState.user_data}
          points={appState.points}
          isPaid={appState.is_paid}
          onResult={handleDailyResult}
          existingResult={appState.daily_fortune}
          onBack={() => goToStep("hub")}
          onUpdatePoints={(updatedPoints: PointsData) => {
            setAppState((prev) => ({
              ...prev,
              points: updatedPoints,
            }));
          }}
        />
      )}

      {/* ── 궁합 분석 (NEW) ── */}
      {appState.current_step === "compatibility" && appState.user_data && (
        <Compatibility
          myData={appState.user_data}
          points={appState.points}
          isPaid={appState.is_paid}
          onResult={handleCompatibilityResult}
          onBack={() => goToStep("hub")}
          onUpdatePoints={(updatedPoints: PointsData) => {
            setAppState((prev) => ({
              ...prev,
              points: updatedPoints,
            }));
          }}
        />
      )}

      {appState.current_step === "compatibility_result" &&
        appState.compatibility && (
          <CompatibilityResultPage
            result={appState.compatibility}
            myData={appState.user_data!}
            partnerData={appState.compatibility_partner!}
            onBack={() => goToStep("hub")}
          />
        )}

      {/* ── 심리테스트 (NEW) ── */}
      {appState.current_step === "psychtest" && appState.user_data && (
        <PsychologyTest
          userData={appState.user_data}
          points={appState.points}
          isPaid={appState.is_paid}
          onResult={handlePsychResult}
          onBack={() => goToStep("hub")}
          onUpdatePoints={(updatedPoints: PointsData) => {
            setAppState((prev) => ({
              ...prev,
              points: updatedPoints,
            }));
          }}
        />
      )}

      {appState.current_step === "psychtest_result" &&
        appState.psych_test_result && (
          <PsychTestResultPage
            result={appState.psych_test_result}
            onBack={() => goToStep("hub")}
          />
        )}

      {/* ── 포인트 (NEW) ── */}
      {appState.current_step === "points" && (
        <PointsPage
          points={appState.points}
          onBack={() => goToStep("hub")}
          onUpdatePoints={(updatedPoints: PointsData) => {
            setAppState((prev) => ({
              ...prev,
              points: updatedPoints,
            }));
          }}
        />
      )}

      {appState.current_step === "lucky_numbers" && appState.user_data && (
        <LuckyNumbers
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
          onEarnPoints={earnPoints}
        />
      )}

      {appState.current_step === "charm" && appState.user_data && (
        <DigitalCharm
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
          onEarnPoints={earnPoints}
        />
      )}

      {appState.current_step === "wish_wall" && (
        <WishWall
          onBack={() => goToStep("hub")}
          onSpendPoints={spendPoints}
        />
      )}

      {appState.current_step === "tojeong" && appState.user_data && (
        <TojeongBigyeol
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
          onEarnPoints={earnPoints}
        />
      )}

      {appState.current_step === "dream" && (
        <DreamInterpretation
          onBack={() => goToStep("hub")}
          onEarnPoints={earnPoints}
        />
      )}

      {appState.current_step === "lucky_style" && appState.user_data && (
        <LuckyStyle
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
          onEarnPoints={earnPoints}
        />
      )}

      {appState.current_step === "saju" && (
        <Saju
          onBack={() => goToStep("hub")}
          points={appState.points}
          isPaid={appState.is_paid}
          onUpdatePoints={(updatedPoints: PointsData) => {
            setAppState((prev) => ({
              ...prev,
              points: updatedPoints,
            }));
          }}
        />
      )}

      {appState.current_step === "saju_compatibility" && (
        <SajuCompatibility
          onBack={() => goToStep("hub")}
        />
      )}
    </div>
  );
}

export default App;
