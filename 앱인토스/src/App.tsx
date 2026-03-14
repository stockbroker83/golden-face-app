import { useState, useEffect, useCallback } from "react";
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
import LuckyNumbers from "./pages/LuckyNumbers";
import DigitalCharm from "./pages/DigitalCharm";
import WishWall from "./pages/WishWall";
import TojeongBigyeol from "./pages/TojeongBigyeol";
import DreamInterpretation from "./pages/DreamInterpretation";
import LuckyStyle from "./pages/LuckyStyle";
import Saju from "./pages/Saju";
import SajuCompatibility from "./pages/SajuCompatibility";
import TarotReading from "./pages/TarotReading";
import {
  AppState,
  AppStep,
  FaceData,
  UserData,
  DailyFortuneResult,
  CompatibilityResult,
  PsychTestResult,
} from "./types";
import { analyzeFacePremium } from "./services/gemini";
import { canUseAI, incrementMonthlyUsage } from "./utils/monthlyUsageManager";
import { requestNotificationPermission } from "./utils/notificationManager";
import "./App.css";

function App() {
  const [isPremiumAnalyzing, setIsPremiumAnalyzing] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    user_data: null,
    face_data: null,
    is_paid: true,
    current_step: "notice",
    daily_fortune: null,
    compatibility: null,
    compatibility_partner: null,
    psych_test_result: null,
  });

  // 앱 초기화: 저장된 유저 데이터 복구
  useEffect(() => {
    const savedUser = localStorage.getItem("golden_face_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as UserData;
        setAppState((prev) => ({
          ...prev,
          user_data: userData,
          is_paid: true,
          current_step: "hub",
        }));
      } catch {}
    }
  }, []);

  const updateUserData = (data: UserData) => {
    localStorage.setItem("golden_face_user", JSON.stringify(data));
    setAppState((prev) => ({
      ...prev,
      user_data: data,
      current_step: "upload",
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

  const handlePremiumAnalyzingComplete = useCallback(async () => {
    if (isPremiumAnalyzing) return;

    if (!appState.face_data?.image_file || !appState.user_data) {
      goToStep("free");
      return;
    }

    setIsPremiumAnalyzing(true);

    try {
      if (!canUseAI()) {
        alert("이번 달 AI 분석 횟수를 모두 사용했습니다. (월 150회 제한)");
        goToStep("free");
        return;
      }

      const premiumAnalysis = await analyzeFacePremium(
        appState.face_data.image_file,
        appState.user_data
      );
      incrementMonthlyUsage();
      updateFaceData({ premium_analysis: premiumAnalysis });
      goToStep("premium");
    } catch (error) {
      console.error("프리미엄 분석 실패:", error);
      alert("프리미엄 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      goToStep("free");
    } finally {
      setIsPremiumAnalyzing(false);
    }
  }, [appState.face_data?.image_file, appState.user_data, isPremiumAnalyzing]);

  const handleDailyResult = (result: DailyFortuneResult) => {
    setAppState((prev) => ({ ...prev, daily_fortune: result }));
  };

  const handleCompatibilityResult = (result: CompatibilityResult, partner: UserData) => {
    setAppState((prev) => ({
      ...prev,
      compatibility: result,
      compatibility_partner: partner,
      current_step: "compatibility_result",
    }));
  };

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

      {/* ── 메인 허브 ── */}
      {appState.current_step === "hub" && appState.user_data && (
        <HomeHub
          userData={appState.user_data}
          onNavigate={goToStep}
        />
      )}

      {/* ── 관상 분석 ── */}
      {appState.current_step === "upload" && (
        <FaceUpload
          onUpload={(file) => {
            updateFaceData({ image_file: file });
            goToStep("analyzing");
          }}
          onBack={() =>
            appState.face_data?.free_analysis
              ? goToStep("hub")
              : goToStep("userinfo")
          }
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
              requestNotificationPermission();
            }}
          />
        )}

      {appState.current_step === "free" &&
        (appState.face_data?.premium_analysis || appState.face_data?.free_analysis) &&
        appState.face_data?.image_file && (
          <FreeResult
            analysis={appState.face_data.premium_analysis || appState.face_data.free_analysis!}
            imageFile={appState.face_data.image_file}
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

      {/* ── 오늘의 관상 ── */}
      {appState.current_step === "daily" && appState.user_data && (
        <DailyFortune
          userData={appState.user_data}
          onResult={handleDailyResult}
          existingResult={appState.daily_fortune}
          onBack={() => goToStep("hub")}
        />
      )}

      {/* ── 궁합 분석 ── */}
      {appState.current_step === "compatibility" && appState.user_data && (
        <Compatibility
          myData={appState.user_data}
          onResult={handleCompatibilityResult}
          onBack={() => goToStep("hub")}
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

      {/* ── 심리테스트 ── */}
      {appState.current_step === "psychtest" && appState.user_data && (
        <PsychologyTest
          userData={appState.user_data}
          onResult={handlePsychResult}
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "psychtest_result" &&
        appState.psych_test_result && (
          <PsychTestResultPage
            result={appState.psych_test_result}
            onBack={() => goToStep("hub")}
          />
        )}

      {appState.current_step === "lucky_numbers" && appState.user_data && (
        <LuckyNumbers
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "charm" && appState.user_data && (
        <DigitalCharm
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "wish_wall" && (
        <WishWall
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "tojeong" && appState.user_data && (
        <TojeongBigyeol
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "dream" && (
        <DreamInterpretation
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "lucky_style" && appState.user_data && (
        <LuckyStyle
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "saju" && (
        <Saju
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "saju_compatibility" && (
        <SajuCompatibility
          onBack={() => goToStep("hub")}
        />
      )}

      {appState.current_step === "tarot" && appState.user_data && (
        <TarotReading
          userData={appState.user_data}
          onBack={() => goToStep("hub")}
        />
      )}
    </div>
  );
}

export default App;
