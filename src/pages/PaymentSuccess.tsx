import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let id = sessionStorage.getItem("tarot_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tarot_session", id);
  }
  return id;
}

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = params.get("amount");

  const hasParams = !!(paymentKey && orderId && amount);

  useEffect(() => {
    if (!hasParams || saved) return;

    const saveSubscription = async () => {
      setSaving(true);
      try {
        await supabase.from("subscriptions").insert({
          session_id: getSessionId(),
          payment_key: paymentKey,
          order_id: orderId!,
          amount: Number(amount),
          status: "active",
        });
        localStorage.setItem("isPremium", "true");
        setSaved(true);
      } catch (e) {
        console.error("Failed to save subscription:", e);
      } finally {
        setSaving(false);
      }
    };

    saveSubscription();
  }, [hasParams]);

  // 파라미터가 없으면 에러 UI
  if (!hasParams) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center max-w-md mx-auto px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="font-display text-xl font-bold text-foreground mb-2">
            결제 승인 실패
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            결제 정보가 올바르지 않습니다.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl bg-muted text-foreground font-bold
                       hover:opacity-90 active:scale-[0.98] transition-all"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 파라미터가 있으면 성공 UI
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center max-w-md mx-auto px-6">
      <div className="text-center">
        {saving ? (
          <>
            <div className="text-4xl animate-pulse mb-4">🔮</div>
            <p className="text-foreground font-display font-bold text-lg">결제 확인 중...</p>
            <p className="text-muted-foreground text-sm mt-2">잠시만 기다려주세요</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              결제가 완료되었어요!
            </h1>
            <p className="text-muted-foreground text-base mb-8">
              프리미엄 멤버가 되셨습니다 ✨
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold
                         hover:opacity-90 active:scale-[0.98] transition-all"
            >
              타로 리딩 시작하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
