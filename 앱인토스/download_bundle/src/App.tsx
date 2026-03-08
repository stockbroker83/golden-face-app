import { useState } from "react";
import WelcomeScreen from "./pages/WelcomeScreen";
import UserInfo from "./pages/UserInfo";
import FaceUpload from "./pages/FaceUpload";
import FaceAnalyzing from "./pages/FaceAnalyzing";
import FreeResult from "./pages/FreeResult";
import Payment from "./pages/Payment";
import PremiumAnalyzing from "./pages/PremiumAnalyzing";
import PremiumResult from "./pages/PremiumResult";
import { AppState, FaceData, UserData } from "./types";
import { analyzeFacePremium } from "./services/gemini";
import "./App.css";

function App() {
  const [appState, setAppState] = useState<AppState>({
    user_data: null,
    face_data: null,
    is_paid: false,
    current_step: "notice",
  });

  const updateUserData = (data: UserData) => {
    setAppState((prev) => ({
      ...prev,
      user_data: data,
      current_step: "upload",
    }));
  };

  const updateFaceData = (data: FaceData) => {
    setAppState((prev) => ({
      ...prev,
      face_data: {
        ...prev.face_data,
        ...data,
      },
    }));
  };

  const goToStep = (step: AppState["current_step"]) => {
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

    const premiumAnalysis = await analyzeFacePremium(appState.face_data.image_file, appState.user_data);
    updateFaceData({ premium_analysis: premiumAnalysis });
    goToStep("premium");
  };

  return (
    <div className="app-container">
      {appState.current_step === "notice" && <WelcomeScreen onAccept={() => goToStep("userinfo")} />}

      {appState.current_step === "userinfo" && <UserInfo onSubmit={updateUserData} />}

      {appState.current_step === "upload" && (
        <FaceUpload
          onUpload={(file) => {
            updateFaceData({ image_file: file });
            goToStep("analyzing");
          }}
        />
      )}

      {appState.current_step === "analyzing" && appState.face_data?.image_file && (
        <FaceAnalyzing
          imageFile={appState.face_data.image_file}
          userData={appState.user_data}
          onComplete={(result) => {
            updateFaceData({
              ...appState.face_data,
              free_analysis: result,
            });
            goToStep("free");
          }}
        />
      )}

      {appState.current_step === "free" && appState.face_data?.free_analysis && appState.face_data?.image_file && (
        <FreeResult
          analysis={appState.face_data.free_analysis}
          imageFile={appState.face_data.image_file}
          onUpgrade={() => goToStep("payment")}
        />
      )}

      {appState.current_step === "payment" && (
        <Payment onPaymentSuccess={handlePaymentComplete} onBack={() => goToStep("free")} />
      )}

      {appState.current_step === "premium_analyzing" && (
        <PremiumAnalyzing onComplete={handlePremiumAnalyzingComplete} />
      )}

      {appState.current_step === "premium" && appState.user_data && appState.face_data?.premium_analysis && appState.face_data?.image_file && (
        <PremiumResult
          userData={appState.user_data}
          premiumAnalysis={appState.face_data.premium_analysis}
          imageFile={appState.face_data.image_file}
          onBack={() => goToStep("free")}
        />
      )}
    </div>
  );
}

export default App;
