import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles } from "lucide-react";

const CONFIRM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-payment`;

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const confirm = async () => {
      const paymentKey = params.get("paymentKey");
      const orderId = params.get("orderId");
      const amount = params.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setStatus("error");
        setErrorMsg("결제 정보가 올바르지 않습니다.");
        return;
      }

      try {
        const res = await fetch(CONFIRM_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "결제 승인 실패");
        }

        localStorage.setItem("isPremium", "true");
        setStatus("success");
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e.message || "결제 승인 중 오류가 발생했습니다.");
      }
    };

    confirm();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center max-w-md mx-auto px-6">
      {status === "loading" && (
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">🔮</div>
          <p className="text-foreground font-display font-bold text-lg">결제 확인 중...</p>
          <p className="text-muted-foreground text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            프리미엄 활성화 완료!
          </h1>
          <p className="text-muted-foreground mb-8">
            미래가 밝아질 거예요 ✨
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold
                       hover:opacity-90 active:scale-[0.98] transition-all"
          >
            타로 상담 시작하기
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="font-display text-xl font-bold text-foreground mb-2">
            결제 승인 실패
          </h1>
          <p className="text-muted-foreground text-sm mb-8">{errorMsg}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl bg-muted text-foreground font-bold
                       hover:opacity-90 active:scale-[0.98] transition-all"
          >
            메인으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
